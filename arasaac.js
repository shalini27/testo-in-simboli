// Access to ARASAAC pictograms (https://arasaac.org). No API key is needed.
// Only single words or short expressions are sent to ARASAAC, never the whole text.
import { getLanguage } from './i18n.js';
import * as italian from './lang-it.js';
import * as english from './lang-en.js';

const RULES = { it: italian, en: english };
const rules = () => RULES[getLanguage()];

const API = 'https://api.arasaac.org/api/pictograms';
export const imageUrl = (id) => `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
export const lineArtUrl = (id) => `${API}/${id}?color=false&download=false`;

// --- requests: cached, at most 6 running at the same time ---
const cache = new Map();
const queue = [];
let running = 0;
export const status = { networkErrors: 0 };

function limited(task) {
  return new Promise((resolve) => {
    const start = async () => {
      running++;
      try { resolve(await task()); } finally { running--; queue.shift()?.(); }
    };
    running < 6 ? start() : queue.push(start);
  });
}

function request(kind, term) {
  const language = getLanguage();
  const key = `${language}/${kind}/${term}`;
  if (!cache.has(key)) {
    cache.set(key, limited(async () => {
      try {
        const response = await fetch(`${API}/${language}/${kind}/${encodeURIComponent(term)}`);
        if (response.status === 404) return [];      // ARASAAC answers 404 when nothing matches
        if (!response.ok) throw new Error(String(response.status));
        return (await response.json()).map((pictogram) => ({
          id: pictogram._id,
          words: (pictogram.keywords || []).flatMap((k) => [k.keyword, k.plural]).filter(Boolean)
            .map((w) => w.toLowerCase()),
          name: pictogram.keywords?.[0]?.keyword || '',
        }));
      } catch {
        status.networkErrors++;
        cache.delete(key);                           // do not remember a network failure
        return [];
      }
    }));
  }
  return cache.get(key);
}

const exactSearch = (term) => request('bestsearch', term);
const looseSearch = (term) => request('search', term);

// Pictograms whose name is exactly the searched word come first.
function ranked(results, term) {
  const score = (p) => (p.name.toLowerCase() === term ? 0 : p.words.includes(term) ? 1 : 2);
  return [...results].sort((a, b) => score(a) - score(b));
}

/** Pictograms for one word: try the word, then its guessed base forms. */
export async function findWord(word) {
  for (const candidate of rules().candidates(word)) {
    const results = await exactSearch(candidate);
    if (results.length) return { query: candidate, options: ranked(results, candidate) };
  }
  return { query: word, options: [] };
}

/** Pictograms for a multi-word expression, only if ARASAAC knows it exactly. */
async function findExpression(expression) {
  const results = await exactSearch(expression);
  const exact = results.filter((p) => p.words.includes(expression));
  return exact.length ? { query: expression, options: ranked(exact, expression) } : null;
}

/** Free search for the edit dialog: exact matches first, then similar ones. */
export async function searchAny(term) {
  const query = term.trim().toLowerCase();
  if (!query) return [];
  const [exact, loose] = await Promise.all([exactSearch(query), looseSearch(query)]);
  const seen = new Set();
  return [...ranked(exact, query), ...loose].filter((p) => !seen.has(p.id) && seen.add(p.id)).slice(0, 36);
}

// --- from text to cards ---
const OUTER_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

function splitWords(sentence) {
  const { wordKey, STOPWORDS } = rules();
  return sentence.split(/\s+/).filter(Boolean).map((raw) => {
    const clean = raw.replace(/’/g, "'").replace(OUTER_PUNCTUATION, '').toLowerCase();
    const key = wordKey(clean);
    return {
      shown: raw.replace(/^[«"(\[]+|[.,;:!?»")\]…]+$/g, ''),
      clean,
      key,
      isStopword: !key || STOPWORDS.has(key),
    };
  }).filter((word) => word.clean);
}

export function splitSentences(text) {
  return text.split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
}

let counter = 0;
const newCard = (text, query = '', options = []) => ({
  id: `c${++counter}`, text, query, options, chosen: options[0]?.id ?? null, searched: Boolean(query),
});
export const emptyCard = () => newCard('', '', []);

async function cardsForSentence(sentence) {
  const words = splitWords(sentence);

  // Expressions of up to four words starting at position i, longest first.
  const expressionsFrom = (i) => {
    const list = [];
    for (let j = Math.min(i + 3, words.length - 1); j > i; j--) {
      if (!words[j].isStopword) list.push({ end: j, text: words.slice(i, j + 1).map((w) => w.clean).join(' ') });
    }
    return list;
  };

  // Start every search now: the awaits below then find the answers already cached.
  words.forEach((word, i) => {
    if (word.isStopword) return;
    expressionsFrom(i).forEach((expression) => exactSearch(expression.text));
    exactSearch(rules().candidates(word.key)[0]);
  });

  const cards = [];
  let prefix = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i].isStopword) { prefix.push(words[i].shown); continue; }
    let found = null;
    let end = i;
    for (const expression of expressionsFrom(i)) {
      found = await findExpression(expression.text);
      if (found) { end = expression.end; break; }
    }
    found ??= await findWord(words[i].key);
    const text = [...prefix, ...words.slice(i, end + 1).map((w) => w.shown)].join(' ');
    cards.push(newCard(text, found.query, found.options));
    prefix = [];
    i = end;
  }
  if (prefix.length) cards.push(newCard(prefix.join(' ')));
  return cards;
}

/** Turn a text into sentences, each with its cards (words + pictogram). */
export async function textToCards(text) {
  status.networkErrors = 0;
  const sentences = await Promise.all(splitSentences(text).map(cardsForSentence));
  return sentences.filter((cards) => cards.length).map((cards) => ({ cards }));
}
