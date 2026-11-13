// Builds the PDF by drawing cards, images and text directly (it is not a screenshot of
// the page): no card is split across pages and the ARASAAC credits are on every page.
import { imageUrl, lineArtUrl } from './arasaac.js';
import { t } from './i18n.js';

// Card width in millimetres: the real size on a sheet printed at 100%.
const SIZES = {
  small: { card: 30, fontSize: 9 },
  medium: { card: 40, fontSize: 12 },
  large: { card: 55, fontSize: 15 },
};
const MARGIN = 12;
const GAP = 3;
const PT = 0.3528; // millimetres per typographic point

const images = new Map();
function loadImage(id, colour) {
  const key = `${id}-${colour}`;
  if (!images.has(key)) {
    images.set(key, fetch(colour ? imageUrl(id) : lineArtUrl(id))
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.blob(); })
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(() => { images.delete(key); return null; }));
  }
  return images.get(key);
}

// The standard PDF fonts cover accented Latin letters but not typographic quotes.
const pdfSafe = (text) => text.replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/…/g, '...').replace(/[–—]/g, '-');

/**
 * @param {{sentences: {cards: object[]}[], title?: string}} sheet
 * @param {object} options
 *   format: 'strips' (sentences in order) or 'cards' (grid to cut out);
 *   orientation: 'landscape' | 'portrait'; size: 'small' | 'medium' | 'large';
 *   colour: false for black-and-white pictograms; borders: strips only.
 * @returns {Promise<{pdf: object, missingImages: number}>}
 */
export async function buildPdf(sheet, options = {}) {
  const { format = 'strips', orientation = 'landscape', size = 'medium', colour = true, borders = true } = options;
  const { card: cardWidth, fontSize } = SIZES[size] || SIZES.medium;
  const pdf = new window.jspdf.jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - 2 * MARGIN;

  pdf.setFont('helvetica', 'normal').setFontSize(7);
  const creditLines = [
    ...pdf.splitTextToSize(t('pdf.credits'), usableWidth - 30),
    ...pdf.splitTextToSize(t('pdf.sheetNote'), usableWidth - 30),
  ];
  pdf.setProperties({
    title: sheet.title?.trim() || t('doc.title'),
    subject: `${t('pdf.credits')} ${t('pdf.sheetNote')}`,
    keywords: t('pdf.keywords'),
    creator: 'Testo in simboli (https://github.com/shalini27/testo-in-simboli)',
  });
  const footerHeight = creditLines.length * 3 + 5;
  const bottom = pageHeight - MARGIN - footerHeight;

  const chosenIds = sheet.sentences.flatMap((s) => s.cards).map((c) => c.chosen).filter(Boolean);
  const imageData = new Map(await Promise.all([...new Set(chosenIds)].map(async (id) => [id, await loadImage(id, colour)])));
  let missingImages = 0;

  const imageSide = cardWidth - 4;
  const lineHeight = fontSize * PT * 1.2;
  const linesOf = (card) => pdf.splitTextToSize(pdfSafe(card.text || ''), cardWidth - 3);
  const heightFor = (lineCount) => 2 + imageSide + 2 + Math.max(1, lineCount) * lineHeight + 2;
  let y = MARGIN;

  if (sheet.title?.trim()) {
    pdf.setFont('helvetica', 'bold').setFontSize(16).setTextColor(20);
    const lines = pdf.splitTextToSize(pdfSafe(sheet.title.trim()), usableWidth);
    pdf.text(lines, MARGIN, y + 5);
    y += lines.length * 7 + 4;
  }
  pdf.setFont('helvetica', 'normal').setFontSize(fontSize);

  const drawCard = (card, lines, x, top, height, border) => {
    pdf.setLineDashPattern([], 0);
    if (border === 'cut') { pdf.setDrawColor(40).setLineWidth(0.35); pdf.rect(x, top, cardWidth, height); }
    else if (border === 'round') { pdf.setDrawColor(150).setLineWidth(0.3); pdf.roundedRect(x, top, cardWidth, height, 2, 2); }
    const png = card.chosen ? imageData.get(card.chosen) : null;
    if (png) {
      pdf.addImage(png, 'PNG', x + 2, top + 2, imageSide, imageSide, `p${card.chosen}${colour ? '' : 'bw'}`, 'FAST');
    } else if (card.searched) {
      if (card.chosen) missingImages++;
      pdf.setDrawColor(170).setLineWidth(0.3).setLineDashPattern([1.5, 1.5], 0);
      pdf.roundedRect(x + 2, top + 2, imageSide, imageSide, 2, 2);
      pdf.setLineDashPattern([], 0);
    }
    pdf.setFont('helvetica', 'normal').setFontSize(fontSize).setTextColor(20);
    pdf.text(lines, x + cardWidth / 2, top + 2 + imageSide + 2 + fontSize * PT, { align: 'center', lineHeightFactor: 1.2 });
  };

  if (format === 'cards') {
    // A grid of identical, touching cards: one cut separates two cards.
    const seen = new Set();
    const cards = sheet.sentences.flatMap((s) => s.cards)
      .filter((c) => c.text || c.chosen)
      .filter((c) => { const key = `${c.chosen}|${(c.text || '').toLowerCase()}`; return !seen.has(key) && seen.add(key); })
      .map((c) => ({ card: c, lines: linesOf(c) }));
    const height = heightFor(Math.max(1, ...cards.map((c) => c.lines.length)));
    const perRow = Math.max(1, Math.floor(usableWidth / cardWidth));
    pdf.setFont('helvetica', 'normal').setFontSize(8).setTextColor(90);
    pdf.text(t('pdf.cutHint'), MARGIN, y + 2);
    y += 6;
    for (let i = 0; i < cards.length; i += perRow) {
      if (y > MARGIN && y + height > bottom) { pdf.addPage(); y = MARGIN; }
      cards.slice(i, i + perRow).forEach(({ card, lines }, n) =>
        drawCard(card, lines, MARGIN + n * cardWidth, y, height, 'cut'));
      y += height;
    }
  } else {
    // Strips: sentences stay in order, one under the other.
    const perRow = Math.max(1, Math.floor((usableWidth + GAP) / (cardWidth + GAP)));
    for (const sentence of sheet.sentences) {
      const rows = [];
      for (let i = 0; i < sentence.cards.length; i += perRow) {
        const cards = sentence.cards.slice(i, i + perRow).map((c) => ({ card: c, lines: linesOf(c) }));
        rows.push({ cards, height: heightFor(Math.max(...cards.map((c) => c.lines.length))) });
      }
      const sentenceHeight = rows.reduce((sum, row) => sum + row.height + GAP, 0);
      // A sentence stays whole on one page when it fits.
      if (y > MARGIN && y + sentenceHeight > bottom && sentenceHeight <= bottom - MARGIN) { pdf.addPage(); y = MARGIN; }
      for (const row of rows) {
        if (y > MARGIN && y + row.height > bottom) { pdf.addPage(); y = MARGIN; }
        row.cards.forEach(({ card, lines }, n) =>
          drawCard(card, lines, MARGIN + n * (cardWidth + GAP), y, row.height, borders ? 'round' : null));
        y += row.height + GAP;
      }
      y += 4;
    }
  }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal').setFontSize(7).setTextColor(90);
    pdf.text(creditLines, MARGIN, pageHeight - MARGIN - footerHeight + 6);
    pdf.text(t('pdf.page', { p: page, n: pageCount }), pageWidth - MARGIN, pageHeight - MARGIN - footerHeight + 6, { align: 'right' });
  }
  return { pdf, missingImages };
}
