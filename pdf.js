// Crea il PDF disegnando direttamente carte, immagini e testo (non è una "foto" della pagina):
// nessuna carta viene tagliata tra due pagine e i crediti ARASAAC sono su ogni pagina.
import { urlImmagine, CREDITI, NOTA_FOGLIO } from './arasaac.js';

// Larghezza della carta in millimetri: sono le misure reali sul foglio stampato al 100%.
const MISURE = {
  piccolo: { carta: 30, corpo: 9 },
  medio: { carta: 40, corpo: 12 },
  grande: { carta: 55, corpo: 15 },
};
const MARGINE = 12;
const SPAZIO = 3;
const PT = 0.3528; // millimetri per punto tipografico

const urlBiancoNero = (id) => `https://api.arasaac.org/api/pictograms/${id}?color=false&download=false`;

const immagini = new Map();
function caricaImmagine(id, colore) {
  const chiave = `${id}-${colore}`;
  if (!immagini.has(chiave)) {
    immagini.set(chiave, fetch(colore ? urlImmagine(id) : urlBiancoNero(id))
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
      .then((blob) => new Promise((ok, ko) => {
        const lettore = new FileReader();
        lettore.onload = () => ok(lettore.result);
        lettore.onerror = ko;
        lettore.readAsDataURL(blob);
      }))
      .catch(() => { immagini.delete(chiave); return null; }));
  }
  return immagini.get(chiave);
}

// I caratteri standard dei PDF coprono le lettere accentate italiane, non le virgolette tipografiche.
const perPdf = (t) => t.replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/…/g, '...').replace(/[–—]/g, '-');

/**
 * @param {{frasi: {carte: object[]}[], titolo?: string}} documento
 * @param {object} opzioni
 *   formato: 'strisce' (frasi in ordine) oppure 'carte' (griglia da ritagliare);
 *   orientamento: 'orizzontale' | 'verticale'; misura: 'piccolo' | 'medio' | 'grande';
 *   colore: false per i pittogrammi in bianco e nero; bordi: solo per le strisce.
 * @returns {Promise<{pdf: object, immaginiMancanti: number}>}
 */
export async function creaPdf(documento, opzioni = {}) {
  const { formato = 'strisce', orientamento = 'orizzontale', misura = 'medio', colore = true, bordi = true } = opzioni;
  const { carta: largCarta, corpo } = MISURE[misura] || MISURE.medio;
  const pdf = new window.jspdf.jsPDF({
    orientation: orientamento === 'verticale' ? 'portrait' : 'landscape', unit: 'mm', format: 'a4',
  });
  const L = pdf.internal.pageSize.getWidth();
  const A = pdf.internal.pageSize.getHeight();
  const largUtile = L - 2 * MARGINE;

  pdf.setFont('helvetica', 'normal').setFontSize(7);
  const righeCrediti = [
    ...pdf.splitTextToSize(CREDITI, largUtile - 30),
    ...pdf.splitTextToSize(NOTA_FOGLIO, largUtile - 30),
  ];
  pdf.setProperties({
    title: documento.titolo?.trim() || 'Testo in simboli',
    subject: `${CREDITI} ${NOTA_FOGLIO}`,
    keywords: 'CAA, pittogrammi, ARASAAC, Sergio Palao, Governo di Aragona, CC BY-NC-SA 4.0',
    creator: 'Testo in simboli (https://github.com/shalini27/testo-in-simboli)',
  });
  const altPiede = righeCrediti.length * 3 + 5;
  const fondo = A - MARGINE - altPiede;

  const scelti = documento.frasi.flatMap((f) => f.carte).map((c) => c.scelto).filter(Boolean);
  const dati = new Map(await Promise.all([...new Set(scelti)].map(async (id) => [id, await caricaImmagine(id, colore)])));
  let immaginiMancanti = 0;

  const lato = largCarta - 4;
  const interlinea = corpo * PT * 1.2;
  const righeDi = (carta) => pdf.splitTextToSize(perPdf(carta.testo || ''), largCarta - 3);
  const altezzaCon = (nRighe) => 2 + lato + 2 + Math.max(1, nRighe) * interlinea + 2;
  let y = MARGINE;

  if (documento.titolo?.trim()) {
    pdf.setFont('helvetica', 'bold').setFontSize(16).setTextColor(20);
    const righe = pdf.splitTextToSize(perPdf(documento.titolo.trim()), largUtile);
    pdf.text(righe, MARGINE, y + 5);
    y += righe.length * 7 + 4;
  }
  pdf.setFont('helvetica', 'normal').setFontSize(corpo);

  const disegnaCarta = (carta, testo, x, yy, altezza, bordo) => {
    pdf.setLineDashPattern([], 0);
    if (bordo === 'taglio') { pdf.setDrawColor(40).setLineWidth(0.35); pdf.rect(x, yy, largCarta, altezza); }
    else if (bordo === 'tondo') { pdf.setDrawColor(150).setLineWidth(0.3); pdf.roundedRect(x, yy, largCarta, altezza, 2, 2); }
    const png = carta.scelto ? dati.get(carta.scelto) : null;
    if (png) {
      pdf.addImage(png, 'PNG', x + 2, yy + 2, lato, lato, `p${carta.scelto}${colore ? '' : 'bn'}`, 'FAST');
    } else if (carta.cercato) {
      if (carta.scelto) immaginiMancanti++;
      pdf.setDrawColor(170).setLineWidth(0.3).setLineDashPattern([1.5, 1.5], 0);
      pdf.roundedRect(x + 2, yy + 2, lato, lato, 2, 2);
      pdf.setLineDashPattern([], 0);
    }
    pdf.setFont('helvetica', 'normal').setFontSize(corpo).setTextColor(20);
    pdf.text(testo, x + largCarta / 2, yy + 2 + lato + 2 + corpo * PT, { align: 'center', lineHeightFactor: 1.2 });
  };

  if (formato === 'carte') {
    // Griglia di carte tutte uguali, attaccate una all'altra: un taglio separa due carte.
    const viste = new Set();
    const carte = documento.frasi.flatMap((f) => f.carte)
      .filter((c) => c.testo || c.scelto)
      .filter((c) => { const k = `${c.scelto}|${(c.testo || '').toLowerCase()}`; return !viste.has(k) && viste.add(k); })
      .map((c) => ({ carta: c, testo: righeDi(c) }));
    const altezza = altezzaCon(Math.max(1, ...carte.map((c) => c.testo.length)));
    const perRiga = Math.max(1, Math.floor(largUtile / largCarta));
    pdf.setFont('helvetica', 'normal').setFontSize(8).setTextColor(90);
    pdf.text('Ritaglia lungo le linee. Stampa al 100% (dimensioni effettive) per avere le misure giuste.', MARGINE, y + 2);
    y += 6;
    for (let i = 0; i < carte.length; i += perRiga) {
      if (y > MARGINE && y + altezza > fondo) { pdf.addPage(); y = MARGINE; }
      carte.slice(i, i + perRiga).forEach(({ carta, testo }, n) =>
        disegnaCarta(carta, testo, MARGINE + n * largCarta, y, altezza, 'taglio'));
      y += altezza;
    }
  } else {
    // Strisce: le frasi restano in ordine, una sotto l'altra.
    const perRiga = Math.max(1, Math.floor((largUtile + SPAZIO) / (largCarta + SPAZIO)));
    for (const frase of documento.frasi) {
      const righe = [];
      for (let i = 0; i < frase.carte.length; i += perRiga) {
        const carte = frase.carte.slice(i, i + perRiga).map((c) => ({ carta: c, testo: righeDi(c) }));
        righe.push({ carte, altezza: altezzaCon(Math.max(...carte.map((c) => c.testo.length))) });
      }
      const altFrase = righe.reduce((s, r) => s + r.altezza + SPAZIO, 0);
      // Una frase resta intera sulla pagina, se ci sta.
      if (y > MARGINE && y + altFrase > fondo && altFrase <= fondo - MARGINE) { pdf.addPage(); y = MARGINE; }
      for (const riga of righe) {
        if (y > MARGINE && y + riga.altezza > fondo) { pdf.addPage(); y = MARGINE; }
        riga.carte.forEach(({ carta, testo }, n) =>
          disegnaCarta(carta, testo, MARGINE + n * (largCarta + SPAZIO), y, riga.altezza, bordi ? 'tondo' : null));
        y += riga.altezza + SPAZIO;
      }
      y += 4;
    }
  }

  const pagine = pdf.getNumberOfPages();
  for (let p = 1; p <= pagine; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal').setFontSize(7).setTextColor(90);
    pdf.text(righeCrediti, MARGINE, A - MARGINE - altPiede + 6);
    pdf.text(`Pagina ${p} di ${pagine}`, L - MARGINE, A - MARGINE - altPiede + 6, { align: 'right' });
  }
  return { pdf, immaginiMancanti };
}
