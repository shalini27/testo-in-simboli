// Regole semplici per risalire dalla parola scritta alla forma del dizionario
// ("andiamo" -> "andare", "portate" -> "portare"). Non è un'analisi linguistica:
// produce solo una lista di tentativi, da provare in ordine su ARASAAC.

// Parole che si attaccano alla parola seguente e non ricevono un simbolo proprio.
export const PAROLE_VUOTE = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'l', 'un', 'uno', 'una',
  'di', 'a', 'ad', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'del', 'dello', 'della', 'dei', 'degli', 'delle', 'dell',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'all',
  'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', 'dall',
  'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'nell',
  'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', 'sull',
  'col', 'coi', 'che', 'd',
]);

const VERBI_IRREGOLARI = {
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
  e: 'ed',
};

// Forme che sono anche parole comuni ("sei" numero, "sale" da cucina):
// per queste si prova prima la parola così com'è.
const AMBIGUE = new Set([
  'sei', 'sale', 'sali', 'date', 'state', 'stato', 'stati', 'dai', 'do',
  'fa', 'sa', 'va', 'era', 'letto', 'corso', 'fatto', 'fatta', 'dato',
  'apri', 'vista', 'visto', 'rotta', 'messa', 'presa', 'detto', 'detta',
]);

const IRREGOLARI = new Map();
for (const [lemma, forme] of Object.entries(VERBI_IRREGOLARI)) {
  for (const forma of forme.split(' ')) if (!IRREGOLARI.has(forma)) IRREGOLARI.set(forma, lemma);
}

// [finale della parola, finali da provare al suo posto], dalle più lunghe alle più corte.
const REGOLE = [
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

const MASSIMO_TENTATIVI = 8;

/** Lista ordinata di parole da cercare per una parola del testo (già in minuscolo). */
export function candidati(parola) {
  const lista = [];
  const aggiungi = (p) => { if (p && p.length > 1 && !lista.includes(p)) lista.push(p); };
  const lemma = IRREGOLARI.get(parola);

  if (lemma && !AMBIGUE.has(parola)) { lista.push(lemma); aggiungi(parola); }
  else { lista.push(parola); if (lemma) lista.push(lemma); }

  for (const [finale, sostituti] of REGOLE) {
    if (!parola.endsWith(finale)) continue;
    const radice = parola.slice(0, -finale.length);
    if (radice.length < 2) continue;
    for (const s of sostituti) aggiungi(radice + s);
  }
  return lista.slice(0, MASSIMO_TENTATIVI);
}
