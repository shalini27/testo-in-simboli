import { testoInCarte, cercaLibera, cartaVuota, urlImmagine, stato } from './arasaac.js';
import { creaPdf } from './pdf.js';

const $ = (id) => document.getElementById(id);
const el = (tag, attributi = {}, ...figli) => {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) {
    if (k === 'class') nodo.className = v;
    else if (k.startsWith('on')) nodo.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) nodo.setAttribute(k, v === true ? '' : v);
  }
  nodo.append(...figli.filter((f) => f != null));
  return nodo;
};

const ESEMPIO = 'Domani andiamo in palestra. Portate le scarpe da ginnastica e una bottiglia d\'acqua. ' +
  'Dopo la lezione laviamo le mani e mangiamo la merenda.';

let frasi = [];
export const leggiFrasi = () => frasi;

function avviso(testo, tipo = 'errore') {
  const box = $('avviso');
  box.textContent = testo || '';
  box.className = testo ? `avviso ${tipo}` : 'avviso nascosto';
}

// ---------- dal testo ai simboli ----------
async function trasforma() {
  const testo = $('testo').value.trim();
  if (!testo) { avviso('Scrivi o incolla un testo prima di cercare i simboli.'); return; }
  const bottone = $('trova');
  bottone.disabled = true;
  bottone.textContent = 'Cerco i simboli…';
  avviso('');
  try {
    frasi = await testoInCarte(testo);
    if (stato.erroriRete) {
      avviso('ARASAAC non ha risposto ad alcune ricerche. Controlla la connessione e riprova: ' +
        'i riquadri vuoti potrebbero avere un simbolo.');
    }
    disegna();
    $('risultato').hidden = false;
    $('risultato').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } finally {
    bottone.disabled = false;
    bottone.textContent = 'Trova i simboli';
  }
}

// ---------- disegno delle carte ----------
function disegnaCarta(carta, f, c) {
  const opzione = carta.opzioni.find((o) => o.id === carta.scelto);
  let figura;
  if (carta.scelto) {
    figura = el('img', { src: urlImmagine(carta.scelto), alt: opzione?.nome || carta.ricerca || '', width: 500, height: 500 });
  } else if (carta.cercato) {
    figura = el('span', { class: 'vuoto' }, 'Nessun simbolo');
  } else {
    figura = el('span', { class: 'senza' });
  }
  return el('button', {
    type: 'button', class: 'carta',
    'aria-label': `${carta.testo || 'carta vuota'}: modifica`,
    onclick: () => apriModifica(f, c),
  }, figura, el('span', { class: 'parole' }, carta.testo));
}

function disegna() {
  const area = $('frasi');
  area.replaceChildren(...frasi.map((frase, f) =>
    el('div', { class: 'frase' },
      ...frase.carte.map((carta, c) => disegnaCarta(carta, f, c)),
      el('button', {
        type: 'button', class: 'aggiungi', 'aria-label': 'Aggiungi una carta a questa frase', title: 'Aggiungi una carta',
        onclick: () => { frase.carte.push(cartaVuota()); disegna(); apriModifica(f, frase.carte.length - 1); },
      }, '+'))));
  area.dataset.misura = $('misura').value;
  const vuote = frasi.flatMap((x) => x.carte).filter((x) => x.cercato && !x.scelto).length;
  $('riepilogo').textContent = vuote
    ? `${vuote} ${vuote === 1 ? 'parola è rimasta' : 'parole sono rimaste'} senza simbolo: clicca sulla carta per cercarne uno.`
    : 'Clicca su una carta per cambiare il simbolo o le parole.';
}

// ---------- finestra di modifica ----------
let inModifica = null;

function apriModifica(f, c) {
  const carta = frasi[f].carte[c];
  inModifica = { f, c, scelto: carta.scelto, opzioni: carta.opzioni };
  $('mod-testo').value = carta.testo;
  $('mod-ricerca').value = carta.ricerca;
  disegnaOpzioni();
  $('modifica').showModal();
  if (!carta.testo) $('mod-testo').focus();
}

function disegnaOpzioni(messaggio) {
  const griglia = $('mod-opzioni');
  if (messaggio) { griglia.replaceChildren(el('p', { class: 'nota' }, messaggio)); return; }
  if (!inModifica.opzioni.length) {
    griglia.replaceChildren(el('p', { class: 'nota' }, 'Nessun simbolo trovato. Prova con una parola più semplice o con la forma base (infinito, singolare).'));
    return;
  }
  griglia.replaceChildren(...inModifica.opzioni.map((o) =>
    el('button', {
      type: 'button', class: 'opzione', 'aria-pressed': String(o.id === inModifica.scelto),
      onclick: () => { inModifica.scelto = o.id; disegnaOpzioni(); },
    }, el('img', { src: urlImmagine(o.id), alt: o.nome, width: 500, height: 500, loading: 'lazy' }),
    el('span', {}, o.nome))));
}

async function cercaInModifica() {
  const termine = $('mod-ricerca').value.trim();
  if (!termine) return;
  disegnaOpzioni('Cerco…');
  inModifica.opzioni = await cercaLibera(termine);
  inModifica.scelto = inModifica.opzioni[0]?.id ?? null;
  disegnaOpzioni();
}

function salvaModifica() {
  const { f, c, scelto, opzioni } = inModifica;
  const carta = frasi[f].carte[c];
  Object.assign(carta, {
    testo: $('mod-testo').value.trim(), ricerca: $('mod-ricerca').value.trim(), opzioni, scelto,
    cercato: Boolean(scelto) || Boolean($('mod-ricerca').value.trim()),
  });
  if (!carta.testo && !carta.scelto) frasi[f].carte.splice(c, 1);
  chiudiModifica();
}

function chiudiModifica() {
  $('modifica').close();
  // Una carta nuova lasciata vuota non resta sulla pagina.
  frasi.forEach((frase) => { frase.carte = frase.carte.filter((x) => x.testo || x.scelto); });
  frasi = frasi.filter((frase) => frase.carte.length);
  disegna();
}

// ---------- PDF ----------
async function scaricaPdf() {
  const bottone = $('pdf');
  bottone.disabled = true;
  bottone.textContent = 'Preparo il PDF…';
  try {
    const { pdf, immaginiMancanti } = await creaPdf(
      { frasi, titolo: $('titolo').value },
      { formato: $('formato').value, orientamento: $('orientamento').value, misura: $('misura').value,
        colore: $('colore').value === 'colori', bordi: $('bordi').checked });
    pdf.save('testo-in-simboli.pdf');
    avviso(immaginiMancanti
      ? `Il PDF è stato creato, ma ${immaginiMancanti} immagini non si sono caricate. Controlla la connessione e riprova.`
      : '', 'errore');
  } catch (e) {
    console.error(e);
    avviso('Non sono riuscito a creare il PDF. Riprova tra qualche secondo.');
  } finally {
    bottone.disabled = false;
    bottone.textContent = 'Scarica PDF';
  }
}

// ---------- avvio ----------
$('trova').addEventListener('click', trasforma);
$('esempio').addEventListener('click', () => { $('testo').value = ESEMPIO; trasforma(); });
$('misura').addEventListener('change', disegna);
$('formato').addEventListener('change', () => { $('bordi').closest('label').hidden = $('formato').value === 'carte'; });
$('pdf').addEventListener('click', scaricaPdf);
$('mod-cerca').addEventListener('click', cercaInModifica);
$('mod-ricerca').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); cercaInModifica(); } });
$('mod-nessuno').addEventListener('click', () => {
  inModifica.scelto = null; inModifica.opzioni = []; $('mod-ricerca').value = '';
  disegnaOpzioni('Questa carta mostrerà solo le parole, senza simbolo.');
});
$('mod-elimina').addEventListener('click', () => {
  frasi[inModifica.f].carte.splice(inModifica.c, 1);
  chiudiModifica();
});
$('mod-salva').addEventListener('click', salvaModifica);
$('mod-annulla').addEventListener('click', chiudiModifica);
$('modifica').addEventListener('cancel', (e) => { e.preventDefault(); chiudiModifica(); });
