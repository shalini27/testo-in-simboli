// English text rules: which words get no symbol of their own, and how to guess the
// dictionary form of a word ("washes" -> "wash", "children" -> "child").
// Deliberately small: it only produces a list of guesses to try on ARASAAC.

// Articles and prepositions: they are attached to the next word instead of being searched.
export const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'with', 'for', 'from', 'by', 'into',
  'our', 'your', 'my', 'his', 'her', 'their', 'its', 'some',
]);

const IRREGULAR_WORDS = {
  be: 'am is are was were been being',
  have: 'has had having',
  do: 'does did done doing',
  go: 'goes went gone going',
  eat: 'ate eaten',
  drink: 'drank drunk',
  see: 'saw seen',
  come: 'came coming',
  take: 'took taken taking',
  make: 'made making',
  write: 'wrote written writing',
  run: 'ran running',
  sit: 'sat sitting',
  give: 'gave given giving',
  say: 'said',
  buy: 'bought',
  bring: 'brought',
  think: 'thought',
  sleep: 'slept',
  child: 'children',
  person: 'people',
  man: 'men',
  woman: 'women',
  foot: 'feet',
  tooth: 'teeth',
  not: 'dont doesnt didnt isnt arent cant wont',
};

// Forms that are common words in their own right: the word itself is tried first.
const AMBIGUOUS = new Set(['saw', 'made', 'thought', 'being', 'done']);

const IRREGULAR = new Map();
for (const [lemma, forms] of Object.entries(IRREGULAR_WORDS)) {
  for (const form of forms.split(' ')) if (!IRREGULAR.has(form)) IRREGULAR.set(form, lemma);
}

const MAX_CANDIDATES = 7;
const DOUBLED = /([bdgklmnprt])\1$/;

/** The part of a written word to look up: "teacher's" -> "teacher", "don't" -> "dont". */
export function wordKey(clean) {
  return clean.replace(/'s$/, '').replace(/'/g, '');
}

/** Ordered list of words to search for a lower-case word from the text. */
export function candidates(word) {
  const list = [];
  const add = (w) => { if (w && w.length > 1 && !list.includes(w)) list.push(w); };
  const lemma = IRREGULAR.get(word);

  if (lemma && !AMBIGUOUS.has(word)) { list.push(lemma); add(word); }
  else { list.push(word); if (lemma) list.push(lemma); }

  const stemOf = (ending) => word.slice(0, -ending.length);
  if (word.endsWith('ies') && word.length > 4) add(stemOf('ies') + 'y');
  if (word.endsWith('es') && word.length > 3) add(stemOf('es'));
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) add(stemOf('s'));
  for (const ending of ['ing', 'ed']) {
    if (!word.endsWith(ending) || word.length < ending.length + 3) continue;
    const stem = stemOf(ending);
    add(stem);
    add(stem.replace(DOUBLED, '$1'));   // running -> run
    add(stem + 'e');                    // making -> make
    if (stem.endsWith('i')) add(stem.slice(0, -1) + 'y');   // tried -> try
  }
  return list.slice(0, MAX_CANDIDATES);
}
