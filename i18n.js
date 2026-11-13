// Interface texts in Italian and English, and the current language.
// Elements in index.html carry data-i18n (plain text), data-i18n-html (trusted markup
// from this file) or data-i18n-attr="attribute:key;attribute:key".

const ARASAAC = '<a href="http://www.arasaac.org" rel="noopener">ARASAAC (http://www.arasaac.org)</a>';
const CC_IT = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it';
const CC_EN = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en';
const REPO = 'https://github.com/shalini27/testo-in-simboli';

const STRINGS = {
  it: {
    'doc.title': 'Testo in simboli',
    'doc.description': 'Strumento gratuito per insegnanti: da un testo semplice a un foglio di pittogrammi ARASAAC pronto da stampare. Senza intelligenza artificiale, senza account.',
    'nav.credits': 'Crediti e licenze',
    'nav.code': 'Codice',
    'nav.language': 'Lingua',
    'brand.home': 'Testo in simboli, pagina iniziale',

    'hero.eyebrow': 'CAA · Comunicazione Aumentativa Alternativa',
    'hero.title': 'Ogni frase può avere i suoi <em>simboli.</em>',
    'hero.lead': 'Scrivi frasi brevi e semplici. Per ogni parola trovi un pittogramma ARASAAC, lo controlli e scarichi un foglio A4 da leggere insieme o da ritagliare.',
    'input.label': 'Il tuo testo: una frase per riga, oppure frasi separate dal punto',
    'input.placeholder': 'Scrivi qui. Es. Domani andiamo in palestra.',
    'input.hint': 'Una frase per riga, o separate dal punto',
    'button.find': 'Trova i simboli',
    'button.finding': 'Cerco i simboli…',
    'examples.label': 'Prova con:',
    'showcase.badge': '★ Senza IA, senza account',
    'showcase.card1': 'Domani',
    'showcase.card2': 'andiamo',
    'showcase.card3': 'in palestra',
    'showcase.note': 'Gratuito · nessun tracciamento · il testo resta nel tuo browser',
    'privacy': '<strong>Non inserire nomi di alunni, diagnosi o altri dati personali.</strong> Ad ARASAAC vengono inviate solo le singole parole da cercare. Lo strumento non usa l\'intelligenza artificiale: non semplifica il testo e non capisce il contesto, quindi il primo simbolo proposto va sempre controllato.',

    'step2.kicker': 'Passo 2',
    'step2.title': 'Controlla i simboli',
    'summary.ok': 'Clicca su una carta per cambiare il simbolo o le parole.',
    'summary.one': '1 parola è rimasta senza simbolo: clicca sulla carta per cercarne uno.',
    'summary.many': '{n} parole sono rimaste senza simbolo: clicca sulla carta per cercarne uno.',
    'card.noSymbol': 'Nessun simbolo',
    'card.edit': '{text}: modifica',
    'card.emptyName': 'carta vuota',
    'card.add': 'Aggiungi una carta a questa frase',

    'step3.kicker': 'Passo 3',
    'step3.title': 'Scarica il foglio, <em>pronto da stampare</em>',
    'option.format': 'Formato',
    'option.strips': 'Strisce',
    'option.cards': 'Carte da ritagliare',
    'option.sheet': 'Foglio A4',
    'option.landscape': 'Orizzontale',
    'option.portrait': 'Verticale',
    'option.width': 'Larghezza delle carte',
    'option.wide': '5,5 cm',
    'option.print': 'Stampa',
    'option.colour': 'A colori',
    'option.lineArt': 'Bianco e nero',
    'option.borders': 'Bordo attorno alle carte',
    'sheetTitle.label': 'Titolo del foglio (facoltativo)',
    'sheetTitle.placeholder': 'Es. La giornata in palestra',
    'button.pdf': 'Scarica PDF',
    'button.pdfBusy': 'Preparo il PDF…',
    'print.note': '<strong>Strisce</strong> per leggere le frasi in ordine. <strong>Carte da ritagliare</strong> per avere carte tutte uguali da tagliare, plastificare o incollare (ogni simbolo una sola volta). Nella finestra di stampa scegli "Dimensioni effettive" o "100%", non "Adatta alla pagina".',

    'credits.title': 'Crediti e licenze',
    'credits.pictograms.heading': 'I pittogrammi',
    'credits.pictograms.text': `I simboli pittografici utilizzati sono di proprietà del Governo di Aragona e sono stati creati da Sergio Palao per ${ARASAAC}, che li distribuisce con licenza <a href="${CC_IT}" rel="noopener license">Creative Commons BY-NC-SA</a>.`,
    'credits.author': 'Autore dei pittogrammi',
    'credits.origin': 'Origine',
    'credits.licence': 'Licenza',
    'credits.owner': 'Proprietà',
    'credits.ownerValue': 'Governo di Aragona (Spagna)',
    'credits.licenceValue': `<a href="${CC_IT}" rel="noopener license">CC BY-NC-SA 4.0</a>`,
    'credits.independent': 'ARASAAC è un marchio del Governo di Aragona. Questo strumento è indipendente: non è un prodotto ARASAAC e non è approvato né sostenuto da ARASAAC o dal Governo di Aragona. <a href="https://arasaac.org/terms-of-use" rel="noopener">Condizioni d\'uso ARASAAC</a>.',
    'credits.sheets.heading': 'I fogli che crei',
    'credits.sheets.text': 'Un foglio creato qui contiene pittogrammi ARASAAC: puoi stamparlo, usarlo in classe e condividerlo, ma <strong>non venderlo</strong>. Se lo condividi o lo modifichi, lascia la citazione stampata in fondo al foglio e mantieni la stessa licenza. Per i cartelli in spazi aperti al pubblico ARASAAC chiede di aggiungere anche il suo logo.',
    'credits.tool.heading': 'Lo strumento',
    'credits.tool.text': `Creato da Shalini Kurapati. Codice libero con licenza MIT, <a href="${REPO}" rel="noopener">pubblicato su GitHub</a>. PDF composti con <a href="https://github.com/parallax/jsPDF" rel="noopener">jsPDF</a> (MIT, © James Hall, yWorks GmbH e collaboratori). Caratteri Bricolage Grotesque e Figtree (SIL Open Font License, © i rispettivi autori). <a href="${REPO}/blob/main/LICENSES.md" rel="noopener">Tutte le licenze in dettaglio</a>.`,
    'credits.free': 'Gratuito, senza account, senza pubblicità e senza tracciamento.',

    'editor.title': 'Modifica la carta',
    'editor.words': 'Parole sotto il simbolo',
    'editor.query': 'Parola da cercare su ARASAAC',
    'editor.search': 'Cerca',
    'editor.delete': 'Elimina la carta',
    'editor.none': 'Senza simbolo',
    'editor.cancel': 'Annulla',
    'editor.save': 'Salva',
    'editor.searching': 'Cerco…',
    'editor.noResults': 'Nessun simbolo trovato. Prova con una parola più semplice o con la forma base (infinito, singolare).',
    'editor.textOnly': 'Questa carta mostrerà solo le parole, senza simbolo.',

    'message.emptyText': 'Scrivi o incolla un testo prima di cercare i simboli.',
    'message.network': 'ARASAAC non ha risposto ad alcune ricerche. Controlla la connessione e riprova: i riquadri vuoti potrebbero avere un simbolo.',
    'message.pdfMissing': 'Il PDF è stato creato, ma {n} immagini non si sono caricate. Controlla la connessione e riprova.',
    'message.pdfFailed': 'Non sono riuscito a creare il PDF. Riprova tra qualche secondo.',

    'pdf.credits': 'I simboli pittografici utilizzati sono di proprietà del Governo di Aragona e sono stati creati da Sergio Palao per ARASAAC (http://www.arasaac.org), che li distribuisce con licenza Creative Commons BY-NC-SA.',
    'pdf.sheetNote': `Questo foglio contiene pittogrammi ARASAAC ed è distribuito con la stessa licenza (CC BY-NC-SA 4.0): uso non commerciale, con questa citazione. Testo della licenza: ${CC_IT}`,
    'pdf.cutHint': 'Ritaglia lungo le linee. Stampa al 100% (dimensioni effettive) per avere le misure giuste.',
    'pdf.page': 'Pagina {p} di {n}',
    'pdf.keywords': 'CAA, pittogrammi, ARASAAC, Sergio Palao, Governo di Aragona, CC BY-NC-SA 4.0',
    'pdf.fileName': 'testo-in-simboli.pdf',
  },

  en: {
    'doc.title': 'Text to symbols',
    'doc.description': 'A free tool for teachers: from a simple text to a printable sheet of ARASAAC pictograms. No artificial intelligence, no account.',
    'nav.credits': 'Credits and licences',
    'nav.code': 'Code',
    'nav.language': 'Language',
    'brand.home': 'Testo in simboli, home page',

    'hero.eyebrow': 'AAC · Augmentative and Alternative Communication',
    'hero.title': 'Every sentence can have its <em>symbols.</em>',
    'hero.lead': 'Write short, simple sentences. For each word you get an ARASAAC pictogram, you check it, and you download an A4 sheet to read together or to cut out.',
    'input.label': 'Your text: one sentence per line, or sentences separated by a full stop',
    'input.placeholder': 'Write here. E.g. Tomorrow we go to the gym.',
    'input.hint': 'One sentence per line, or separated by a full stop',
    'button.find': 'Find the symbols',
    'button.finding': 'Looking for symbols…',
    'examples.label': 'Try with:',
    'showcase.badge': '★ No AI, no account',
    'showcase.card1': 'Tomorrow',
    'showcase.card2': 'we go',
    'showcase.card3': 'to the gym',
    'showcase.note': 'Free · no tracking · your text stays in your browser',
    'privacy': '<strong>Do not enter pupils\' names, diagnoses or other personal data.</strong> Only the single words to look up are sent to ARASAAC. This tool does not use artificial intelligence: it does not simplify the text or understand context, so always check the first symbol it suggests.',

    'step2.kicker': 'Step 2',
    'step2.title': 'Check the symbols',
    'summary.ok': 'Click a card to change its symbol or its words.',
    'summary.one': '1 word has no symbol: click the card to look for one.',
    'summary.many': '{n} words have no symbol: click a card to look for one.',
    'card.noSymbol': 'No symbol',
    'card.edit': '{text}: edit',
    'card.emptyName': 'empty card',
    'card.add': 'Add a card to this sentence',

    'step3.kicker': 'Step 3',
    'step3.title': 'Download the sheet, <em>ready to print</em>',
    'option.format': 'Format',
    'option.strips': 'Strips',
    'option.cards': 'Cut-out cards',
    'option.sheet': 'A4 sheet',
    'option.landscape': 'Landscape',
    'option.portrait': 'Portrait',
    'option.width': 'Card width',
    'option.wide': '5.5 cm',
    'option.print': 'Print',
    'option.colour': 'Colour',
    'option.lineArt': 'Black and white',
    'option.borders': 'Border around the cards',
    'sheetTitle.label': 'Sheet title (optional)',
    'sheetTitle.placeholder': 'E.g. Our day at the gym',
    'button.pdf': 'Download PDF',
    'button.pdfBusy': 'Preparing the PDF…',
    'print.note': '<strong>Strips</strong> keep the sentences in reading order. <strong>Cut-out cards</strong> give equal cards to cut, laminate or glue (each symbol once). In the print dialog choose "Actual size" or "100%", not "Fit to page".',

    'credits.title': 'Credits and licences',
    'credits.pictograms.heading': 'The pictograms',
    'credits.pictograms.text': `The pictographic symbols used are the property of the Government of Aragón and have been created by Sergio Palao for ${ARASAAC}, that distributes them under <a href="${CC_EN}" rel="noopener license">Creative Commons License BY-NC-SA</a>.`,
    'credits.author': 'Pictograms author',
    'credits.origin': 'Origin',
    'credits.licence': 'Licence',
    'credits.owner': 'Owner',
    'credits.ownerValue': 'Government of Aragon (Spain)',
    'credits.licenceValue': `<a href="${CC_EN}" rel="noopener license">CC BY-NC-SA 4.0</a>`,
    'credits.independent': 'ARASAAC is a brand of the Government of Aragon. This tool is independent: it is not an ARASAAC product and is not approved or endorsed by ARASAAC or the Government of Aragon. <a href="https://arasaac.org/terms-of-use" rel="noopener">ARASAAC terms of use</a>.',
    'credits.sheets.heading': 'The sheets you make',
    'credits.sheets.text': 'A sheet made here contains ARASAAC pictograms: you may print it, use it in class and share it, but <strong>not sell it</strong>. If you share or adapt it, keep the citation printed at the bottom of the sheet and keep the same licence. For signs in places open to the public, ARASAAC asks you to add its logo too.',
    'credits.tool.heading': 'The tool',
    'credits.tool.text': `Created by Shalini Kurapati. Free code under the MIT licence, <a href="${REPO}" rel="noopener">published on GitHub</a>. PDFs are composed with <a href="https://github.com/parallax/jsPDF" rel="noopener">jsPDF</a> (MIT, © James Hall, yWorks GmbH and contributors). Bricolage Grotesque and Figtree typefaces (SIL Open Font License, © their authors). <a href="${REPO}/blob/main/LICENSES.md" rel="noopener">All licences in detail</a>.`,
    'credits.free': 'Free, with no account, no advertising and no tracking.',

    'editor.title': 'Edit the card',
    'editor.words': 'Words under the symbol',
    'editor.query': 'Word to look up on ARASAAC',
    'editor.search': 'Search',
    'editor.delete': 'Delete the card',
    'editor.none': 'No symbol',
    'editor.cancel': 'Cancel',
    'editor.save': 'Save',
    'editor.searching': 'Searching…',
    'editor.noResults': 'No symbol found. Try a simpler word or the base form (infinitive, singular).',
    'editor.textOnly': 'This card will show only the words, with no symbol.',

    'message.emptyText': 'Write or paste a text before looking for symbols.',
    'message.network': 'ARASAAC did not answer some searches. Check your connection and try again: the empty boxes may have a symbol.',
    'message.pdfMissing': 'The PDF was created, but {n} images did not load. Check your connection and try again.',
    'message.pdfFailed': 'The PDF could not be created. Try again in a few seconds.',

    'pdf.credits': 'The pictographic symbols used are the property of the Government of Aragón and have been created by Sergio Palao for ARASAAC (http://www.arasaac.org), that distributes them under Creative Commons License BY-NC-SA.',
    'pdf.sheetNote': `This sheet contains ARASAAC pictograms and is shared under the same licence (CC BY-NC-SA 4.0): non-commercial use, with this citation. Licence text: ${CC_EN}`,
    'pdf.cutHint': 'Cut along the lines. Print at 100% (actual size) to get the right measurements.',
    'pdf.page': 'Page {p} of {n}',
    'pdf.keywords': 'AAC, pictograms, ARASAAC, Sergio Palao, Government of Aragon, CC BY-NC-SA 4.0',
    'pdf.fileName': 'text-to-symbols.pdf',
  },
};

// Example sentences shown as pills under the text box: [label, text].
export const EXAMPLES = {
  it: [
    ['in palestra', 'Domani andiamo in palestra. Portate le scarpe da ginnastica.'],
    ['la merenda', 'Prima laviamo le mani. Dopo mangiamo la merenda.'],
    ['oggi piove', 'Oggi piove. Leggiamo un libro in classe.'],
    ['lo zaino', 'Apri lo zaino. Prendi il quaderno e la matita.'],
  ],
  en: [
    ['at the gym', 'Tomorrow we go to the gym. Bring your shoes.'],
    ['snack time', 'First we wash our hands. Then we eat a snack.'],
    ['in the garden', 'Today we go to the garden. We look at the flowers.'],
    ['a book', 'We read a book. Then we play with friends.'],
  ],
};

export const LANGUAGES = Object.keys(STRINGS);
const STORAGE_KEY = 'testo-in-simboli:lang';

function initialLanguage() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGUAGES.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch { /* storage may be blocked: fall through to the default */ }
  return 'it';
}

let language = initialLanguage();
export const getLanguage = () => language;

/** Text for a key in the current language; {name} placeholders are filled from `values`. */
export function t(key, values = {}) {
  const template = STRINGS[language][key] ?? STRINGS.it[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

/** Write the current language into every element marked with data-i18n attributes. */
export function applyTranslations(root = document) {
  document.documentElement.lang = language;
  document.title = t('doc.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('doc.description'));
  root.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach((node) => { node.innerHTML = t(node.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-attr]').forEach((node) => {
    for (const pair of node.dataset.i18nAttr.split(';')) {
      const [attribute, key] = pair.split(':');
      node.setAttribute(attribute, t(key));
    }
  });
  root.querySelectorAll('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  });
}

export function setLanguage(next) {
  if (!LANGUAGES.includes(next) || next === language) return;
  language = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* not essential */ }
  applyTranslations();
}
