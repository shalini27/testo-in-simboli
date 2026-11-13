// Italian text rules: which words get no symbol of their own, and how to guess the
// dictionary form of a word ("andiamo" -> "andare", "portate" -> "portare").
// This is not linguistic analysis: it only produces a list of guesses to try on ARASAAC.

// Articles and prepositions: they are attached to the next word instead of being searched.
export const STOPWORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'l', 'un', 'uno', 'una',
  'di', 'a', 'ad', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'del', 'dello', 'della', 'dei', 'degli', 'delle', 'dell',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'all',
  'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', 'dall',
  'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'nell',
  'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', 'sull',
  'col', 'coi', 'che', 'd',
]);

const IRREGULAR_VERBS = {
  andare: 'vado vai va andiamo andate vanno andato andata andati',
  essere: 'sono sei è siamo siete era erano stato stata stati sarà',
  avere: 'ho hai ha abbiamo avete hanno aveva avuto avrà',
  fare: 'faccio fai fa facciamo fate fanno fatto fatta faceva farà',
  dire: 'dico dici dice diciamo dite dicono detto detta',
  potere: 'posso puoi può possiamo potete possono',
  volere: 'voglio vuoi vuole vogliamo volete vogliono',
  dovere: 'devo devi deve dobbiamo dovete devono',
  sapere: 'so sai sa sappiamo sapete sanno',
  stare: 'sto stai sta stiamo state stanno',
  dare: 'do dai dà diamo date danno dato',
  venire: 'vengo vieni viene veniamo venite vengono venuto venuta',
  uscire: 'esco esci esce usciamo uscite escono',
  bere: 'bevo bevi beve beviamo bevete bevono bevuto',
  tenere: 'tengo tieni tiene tengono',
  rimanere: 'rimango rimani rimane rimangono rimasto rimasta',
  salire: 'salgo sali sale salgono',
  scegliere: 'scelgo scegli sceglie scelgono scelto',
  togliere: 'tolgo togli toglie tolgono tolto',
  sedere: 'siedo siedi siede siedono',
  mettere: 'messo messa messi',
  prendere: 'preso presa presi',
  leggere: 'letto letta',
  scrivere: 'scritto scritta',
  vedere: 'visto vista vide',
  aprire: 'aperto aperta apri',
  chiudere: 'chiuso chiusa',
  rompere: 'rotto rotta',
  correre: 'corso',
  chiedere: 'chiesto',
  rispondere: 'risposto',
  accendere: 'acceso accesa',
  spegnere: 'spento spenta spengo',
  piacere: 'piace piacciono piaciuto',
  piovere: 'piove pioveva piovuto',
  e: 'ed',
};

// Forms that are also everyday words ("sei" = six, "sale" = salt, "letto" = bed):
// for these the word itself is tried first.
const AMBIGUOUS = new Set([
  'sei', 'sale', 'sali', 'date', 'state', 'stato', 'stati', 'dai', 'do',
  'fa', 'sa', 'va', 'era', 'letto', 'corso', 'fatto', 'fatta', 'dato',
  'apri', 'vista', 'visto', 'rotta', 'messa', 'presa', 'detto', 'detta',
]);

const IRREGULAR = new Map();
for (const [lemma, forms] of Object.entries(IRREGULAR_VERBS)) {
  for (const form of forms.split(' ')) if (!IRREGULAR.has(form)) IRREGULAR.set(form, lemma);
}

// [word ending, endings to try in its place], longest endings first.
const SUFFIX_RULES = [
  ['eranno', ['are', 'ere']], ['iranno', ['ire']], ['iscono', ['ire']],
  ['avano', ['are']], ['evano', ['ere']], ['ivano', ['ire']],
  ['eremo', ['are', 'ere']], ['iremo', ['ire']],
  ['arsi', ['are']], ['ersi', ['ere']], ['irsi', ['ire']],
  ['iamo', ['are', 'iare', 'ere', 'ire']],
  ['isce', ['ire']], ['isco', ['ire']], ['isci', ['ire']],
  ['ando', ['are']], ['endo', ['ere', 'ire']],
  ['ato', ['are']], ['ata', ['are']], ['ati', ['are']], ['ate', ['are']],
  ['uto', ['ere']], ['uta', ['ere']], ['uti', ['ere']], ['ute', ['ere']],
  ['ito', ['ire']], ['ita', ['ire']], ['iti', ['ire']], ['ite', ['ire']],
  ['ete', ['ere']], ['ano', ['are']], ['ono', ['ere', 'ire']],
  ['ava', ['are']], ['avo', ['are']], ['avi', ['are']],
  ['eva', ['ere']], ['evo', ['ere']], ['iva', ['ire']], ['ivo', ['ire']],
  ['erà', ['are', 'ere']], ['erò', ['are', 'ere']], ['irà', ['ire']], ['irò', ['ire']],
  ['che', ['ca']], ['ghe', ['ga']], ['chi', ['co']], ['ghi', ['go']],
  ['i', ['o', 'e', 'a', 'are', 'iare', 'ere', 'ire']],
  ['e', ['a', 'o', 'ere', 'ire', 'are']],
  ['a', ['o', 'are']],
  ['o', ['are', 'ere', 'ire']],
];

const MAX_CANDIDATES = 8;

/** The part of a written word to look up: "d'acqua" -> "acqua", "po'" -> "po". */
export function wordKey(clean) {
  const apostrophe = clean.lastIndexOf("'");
  return apostrophe > 0 && apostrophe < clean.length - 1
    ? clean.slice(apostrophe + 1)
    : clean.replace(/'/g, '');
}

/** Ordered list of words to search for a lower-case word from the text. */
export function candidates(word) {
  const list = [];
  const add = (w) => { if (w && w.length > 1 && !list.includes(w)) list.push(w); };
  const lemma = IRREGULAR.get(word);

  if (lemma && !AMBIGUOUS.has(word)) { list.push(lemma); add(word); }
  else { list.push(word); if (lemma) list.push(lemma); }

  for (const [ending, replacements] of SUFFIX_RULES) {
    if (!word.endsWith(ending)) continue;
    const stem = word.slice(0, -ending.length);
    if (stem.length < 2) continue;
    // "giochiamo" -> "giocare", "paghi" -> "pagare": the h is only there before i and e.
    const hard = /[cg]h$/.test(stem) ? stem.slice(0, -1) : null;
    for (const replacement of replacements) {
      if (hard && /^[aio]/.test(replacement)) add(hard + replacement);
      add(stem + replacement);
    }
  }
  return list.slice(0, MAX_CANDIDATES);
}
