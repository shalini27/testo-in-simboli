// Accesso ai pittogrammi ARASAAC (https://arasaac.org). Nessuna chiave richiesta.
// Si inviano ad ARASAAC solo singole parole o brevi espressioni, mai il testo intero.
import { candidati, PAROLE_VUOTE } from './lemmi.js';

const API = 'https://api.arasaac.org/api/pictograms/it';
export const urlImmagine = (id, lato = 500) =>
  `https://static.arasaac.org/pictograms/${id}/${id}_${lato}.png`;

export const CREDITI =
  'I simboli pittografici utilizzati sono di proprietà del Governo di Aragona e sono stati ' +
  'creati da Sergio Palao per ARASAAC (http://www.arasaac.org), che li distribuisce con ' +
  'licenza Creative Commons BY-NC-SA.';

// --- richieste, con memoria e al massimo 6 in parallelo ---
const memoria = new Map();
let attive = 0;
const coda = [];
export const stato = { erroriRete: 0 };

function conLimite(compito) {
  return new Promise((risolvi) => {
    const avvia = async () => {
      attive++;
      try { risolvi(await compito()); } finally { attive--; coda.shift()?.(); }
    };
    attive < 6 ? avvia() : coda.push(avvia);
  });
}

function richiesta(tipo, termine) {
  const chiave = `${tipo}/${termine}`;
  if (!memoria.has(chiave)) {
    memoria.set(chiave, conLimite(async () => {
      try {
        const r = await fetch(`${API}/${tipo}/${encodeURIComponent(termine)}`);
        if (r.status === 404) return [];           // ARASAAC risponde 404 quando non trova nulla
        if (!r.ok) throw new Error(String(r.status));
        return (await r.json()).map((p) => ({
          id: p._id,
          parole: (p.keywords || []).flatMap((k) => [k.keyword, k.plural]).filter(Boolean)
            .map((s) => s.toLowerCase()),
          nome: p.keywords?.[0]?.keyword || '',
        }));
      } catch {
        stato.erroriRete++;
        memoria.delete(chiave);                    // un errore di rete non va ricordato
        return [];
      }
    }));
  }
  return memoria.get(chiave);
}

const cercaPrecisa = (t) => richiesta('bestsearch', t);
const cercaAmpia = (t) => richiesta('search', t);

// Prima i pittogrammi il cui nome è proprio la parola cercata.
function ordina(risultati, termine) {
  const voto = (p) => (p.nome.toLowerCase() === termine ? 0 : p.parole.includes(termine) ? 1 : 2);
  return [...risultati].sort((a, b) => voto(a) - voto(b));
}

/** Pittogrammi per una parola: prova la parola, poi le sue forme base. */
export async function cercaParola(parola) {
  for (const tentativo of candidati(parola)) {
    const r = await cercaPrecisa(tentativo);
    if (r.length) return { ricerca: tentativo, opzioni: ordina(r, tentativo) };
  }
  return { ricerca: parola, opzioni: [] };
}

/** Pittogrammi per un'espressione di più parole, solo se ARASAAC la conosce esattamente. */
async function cercaEspressione(espressione) {
  const r = await cercaPrecisa(espressione);
  const esatti = r.filter((p) => p.parole.includes(espressione));
  return esatti.length ? { ricerca: espressione, opzioni: ordina(esatti, espressione) } : null;
}

/** Ricerca libera per la finestra di modifica: risultati precisi, poi quelli simili. */
export async function cercaLibera(termine) {
  const t = termine.trim().toLowerCase();
  if (!t) return [];
  const [precisi, ampi] = await Promise.all([cercaPrecisa(t), cercaAmpia(t)]);
  const visti = new Set();
  return [...ordina(precisi, t), ...ampi].filter((p) => !visti.has(p.id) && visti.add(p.id)).slice(0, 36);
}

// --- dal testo alle carte ---
const BORDI = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

function spezzaInParole(frase) {
  return frase.split(/\s+/).filter(Boolean).map((grezza) => {
    const pulita = grezza.replace(/’/g, "'").replace(BORDI, '').toLowerCase();
    const apostrofo = pulita.lastIndexOf("'");
    const chiave = apostrofo > 0 && apostrofo < pulita.length - 1 ? pulita.slice(apostrofo + 1) : pulita.replace(/'/g, '');
    return { mostra: grezza.replace(/^[«"(\[]+|[.,;:!?»")\]…]+$/g, ''), pulita, chiave, vuota: !chiave || PAROLE_VUOTE.has(chiave) };
  }).filter((p) => p.pulita);
}

export function spezzaInFrasi(testo) {
  return testo.split(/(?<=[.!?…])\s+|\n+/).map((f) => f.trim()).filter(Boolean);
}

let contatore = 0;
const nuovaCarta = (testo, ricerca = '', opzioni = []) => ({
  id: `c${++contatore}`, testo, ricerca, opzioni, scelto: opzioni[0]?.id ?? null, cercato: Boolean(ricerca),
});
export const cartaVuota = () => nuovaCarta('', '', []);

async function carteDellaFrase(frase) {
  const parole = spezzaInParole(frase);

  // Avvia subito tutte le ricerche: le attese più sotto trovano le risposte già in memoria.
  const espressioniDa = (i) => {
    const lista = [];
    for (let j = Math.min(i + 3, parole.length - 1); j > i; j--) {
      if (!parole[j].vuota) lista.push({ fine: j, testo: parole.slice(i, j + 1).map((p) => p.pulita).join(' ') });
    }
    return lista;
  };
  parole.forEach((p, i) => {
    if (p.vuota) return;
    espressioniDa(i).forEach((e) => cercaPrecisa(e.testo));
    cercaPrecisa(candidati(p.chiave)[0]);
  });

  const carte = [];
  let prefisso = [];
  for (let i = 0; i < parole.length; i++) {
    if (parole[i].vuota) { prefisso.push(parole[i].mostra); continue; }
    let trovata = null, fine = i;
    for (const e of espressioniDa(i)) {
      trovata = await cercaEspressione(e.testo);
      if (trovata) { fine = e.fine; break; }
    }
    trovata ??= await cercaParola(parole[i].chiave);
    const testo = [...prefisso, ...parole.slice(i, fine + 1).map((p) => p.mostra)].join(' ');
    carte.push(nuovaCarta(testo, trovata.ricerca, trovata.opzioni));
    prefisso = [];
    i = fine;
  }
  if (prefisso.length) carte.push(nuovaCarta(prefisso.join(' ')));
  return carte;
}

/** Trasforma un testo in frasi, ognuna con le sue carte (parole + pittogramma). */
export async function testoInCarte(testo) {
  stato.erroriRete = 0;
  const frasi = await Promise.all(spezzaInFrasi(testo).map(carteDellaFrase));
  return frasi.filter((carte) => carte.length).map((carte) => ({ carte }));
}
