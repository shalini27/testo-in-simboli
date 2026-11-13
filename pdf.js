// Crea il PDF disegnando direttamente carte, immagini e testo (non è una "foto" della pagina):
// nessuna carta viene tagliata tra due pagine e i crediti ARASAAC sono su ogni pagina.
import { urlImmagine, CREDITI } from './arasaac.js';

const MISURE = {
  piccolo: { carta: 26, corpo: 9 },
  medio: { carta: 34, corpo: 11 },
  grande: { carta: 46, corpo: 14 },
};
const MARGINE = 12;
const SPAZIO = 3;
const PT = 0.3528; // millimetri per punto tipografico

const immagini = new Map();
function caricaImmagine(id) {
  if (!immagini.has(id)) {
    immagini.set(id, fetch(urlImmagine(id))
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
      .then((blob) => new Promise((ok, ko) => {
        const lettore = new FileReader();
        lettore.onload = () => ok(lettore.result);
        lettore.onerror = ko;
        lettore.readAsDataURL(blob);
      }))
      .catch(() => { immagini.delete(id); return null; }));
  }
  return immagini.get(id);
}

// I caratteri standard dei PDF coprono le lettere accentate italiane, non le virgolette tipografiche.
const perPdf = (t) => t.replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/…/g, '...').replace(/[–—]/g, '-');

/**
 * @param {{frasi: {carte: object[]}[], titolo?: string}} documento
 * @param {{orientamento?: 'orizzontale'|'verticale', misura?: string, bordi?: boolean}} opzioni
 * @returns {Promise<{pdf: object, immaginiMancanti: number}>}
 */
export async function creaPdf(documento, opzioni = {}) {
  const { orientamento = 'orizzontale', misura = 'medio', bordi = true } = opzioni;
  const { carta: largCarta, corpo } = MISURE[misura] || MISURE.medio;
  const pdf = new window.jspdf.jsPDF({
    orientation: orientamento === 'verticale' ? 'portrait' : 'landscape', unit: 'mm', format: 'a4',
  });
  const L = pdf.internal.pageSize.getWidth();
  const A = pdf.internal.pageSize.getHeight();
  const largUtile = L - 2 * MARGINE;

  pdf.setFont('helvetica', 'normal').setFontSize(7);
  const righeCrediti = pdf.splitTextToSize(CREDITI, largUtile - 30);
  const altPiede = righeCrediti.length * 3 + 5;
  const fondo = A - MARGINE - altPiede;

  const scelti = documento.frasi.flatMap((f) => f.carte).map((c) => c.scelto).filter(Boolean);
  const dati = new Map(await Promise.all([...new Set(scelti)].map(async (id) => [id, await caricaImmagine(id)])));
  let immaginiMancanti = 0;

  const lato = largCarta - 4;
  const interlinea = corpo * PT * 1.2;
  const perRiga = Math.max(1, Math.floor((largUtile + SPAZIO) / (largCarta + SPAZIO)));
  let y = MARGINE;

  if (documento.titolo?.trim()) {
    pdf.setFont('helvetica', 'bold').setFontSize(16).setTextColor(20);
    const righe = pdf.splitTextToSize(perPdf(documento.titolo.trim()), largUtile);
    pdf.text(righe, MARGINE, y + 5);
    y += righe.length * 7 + 4;
  }

  pdf.setFont('helvetica', 'normal').setFontSize(corpo);
  for (const frase of documento.frasi) {
    // Prepara le righe della frase e la loro altezza.
    const righe = [];
    for (let i = 0; i < frase.carte.length; i += perRiga) {
      const carte = frase.carte.slice(i, i + perRiga).map((c) => ({
        carta: c, testo: pdf.splitTextToSize(perPdf(c.testo || ''), largCarta - 3),
      }));
      const maxRighe = Math.max(1, ...carte.map((c) => c.testo.length));
      righe.push({ carte, altezza: 2 + lato + 2 + maxRighe * interlinea + 2 });
    }
    const altFrase = righe.reduce((s, r) => s + r.altezza + SPAZIO, 0);
    // Una frase resta intera sulla pagina, se ci sta.
    if (y > MARGINE && y + altFrase > fondo && altFrase <= fondo - MARGINE) { pdf.addPage(); y = MARGINE; }

    for (const riga of righe) {
      if (y > MARGINE && y + riga.altezza > fondo) { pdf.addPage(); y = MARGINE; }
      riga.carte.forEach(({ carta, testo }, n) => {
        const x = MARGINE + n * (largCarta + SPAZIO);
        if (bordi) {
          pdf.setDrawColor(150).setLineWidth(0.3).setLineDashPattern([], 0);
          pdf.roundedRect(x, y, largCarta, riga.altezza, 2, 2);
        }
        const png = carta.scelto ? dati.get(carta.scelto) : null;
        if (png) {
          pdf.addImage(png, 'PNG', x + 2, y + 2, lato, lato, `p${carta.scelto}`, 'FAST');
        } else if (carta.cercato) {
          if (carta.scelto) immaginiMancanti++;
          pdf.setDrawColor(170).setLineWidth(0.3).setLineDashPattern([1.5, 1.5], 0);
          pdf.roundedRect(x + 2, y + 2, lato, lato, 2, 2);
          pdf.setLineDashPattern([], 0);
        }
        pdf.setFont('helvetica', 'normal').setFontSize(corpo).setTextColor(20);
        pdf.text(testo, x + largCarta / 2, y + 2 + lato + 2 + corpo * PT, { align: 'center', lineHeightFactor: 1.2 });
      });
      y += riga.altezza + SPAZIO;
    }
    y += 4;
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
