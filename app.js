// Page behaviour: cards, edit dialog, buttons and language switch.
import { textToCards, searchAny, emptyCard, imageUrl, status } from './arasaac.js';
import { buildPdf } from './pdf.js';
import { t, applyTranslations, setLanguage, getLanguage, EXAMPLES } from './i18n.js';

const $ = (id) => document.getElementById(id);
const el = (tag, attributes = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (name === 'class') node.className = value;
    else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else if (value !== false && value != null) node.setAttribute(name, value === true ? '' : value);
  }
  node.append(...children.filter((child) => child != null));
  return node;
};
const picked = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

let sentences = [];
export const getSentences = () => sentences;

function showAlert(message) {
  const box = $('alert');
  box.textContent = message || '';
  box.classList.toggle('is-hidden', !message);
}

// ---------- from text to symbols ----------
async function transform() {
  const text = $('text').value.trim();
  if (!text) { showAlert(t('message.emptyText')); return; }
  const button = $('find');
  button.disabled = true;
  button.textContent = t('button.finding');
  showAlert('');
  try {
    sentences = await textToCards(text);
    if (status.networkErrors) showAlert(t('message.network'));
    render();
    $('result').hidden = false;
    $('print').hidden = false;
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } finally {
    button.disabled = false;
    button.textContent = t('button.find');
  }
}

// ---------- drawing the cards ----------
function renderCard(card, sentenceIndex, cardIndex) {
  const option = card.options.find((o) => o.id === card.chosen);
  let picture;
  if (card.chosen) {
    picture = el('img', { src: imageUrl(card.chosen), alt: option?.name || card.query || '', width: 500, height: 500 });
  } else if (card.searched) {
    picture = el('span', { class: 'empty' }, t('card.noSymbol'));
  } else {
    picture = el('span', { class: 'blank' });
  }
  return el('button', {
    type: 'button', class: 'card',
    'aria-label': t('card.edit', { text: card.text || t('card.emptyName') }),
    onclick: () => openEditor(sentenceIndex, cardIndex),
  }, picture, el('span', { class: 'words' }, card.text));
}

function render() {
  const area = $('sentences');
  area.replaceChildren(...sentences.map((sentence, s) =>
    el('div', { class: 'sentence' },
      ...sentence.cards.map((card, c) => renderCard(card, s, c)),
      el('button', {
        type: 'button', class: 'add', 'aria-label': t('card.add'), title: t('card.add'),
        onclick: () => { sentence.cards.push(emptyCard()); render(); openEditor(s, sentence.cards.length - 1); },
      }, '+'))));
  area.dataset.size = picked('size');
  const missing = sentences.flatMap((s) => s.cards).filter((c) => c.searched && !c.chosen).length;
  $('summary').textContent = missing === 0 ? t('summary.ok')
    : missing === 1 ? t('summary.one') : t('summary.many', { n: missing });
}

function renderExamples() {
  $('examples').replaceChildren(
    el('span', {}, t('examples.label')),
    ...EXAMPLES[getLanguage()].map(([label, text]) =>
      el('button', { type: 'button', class: 'pill', onclick: () => { $('text').value = text; transform(); } }, label)));
}

// ---------- edit dialog ----------
let editing = null;

function openEditor(sentenceIndex, cardIndex) {
  const card = sentences[sentenceIndex].cards[cardIndex];
  editing = { sentenceIndex, cardIndex, chosen: card.chosen, options: card.options };
  $('ed-text').value = card.text;
  $('ed-query').value = card.query;
  renderOptions();
  $('editor').showModal();
  if (!card.text) $('ed-text').focus();
}

function renderOptions(message) {
  const grid = $('ed-options');
  if (message) { grid.replaceChildren(el('p', { class: 'note' }, message)); return; }
  if (!editing.options.length) { grid.replaceChildren(el('p', { class: 'note' }, t('editor.noResults'))); return; }
  grid.replaceChildren(...editing.options.map((option) =>
    el('button', {
      type: 'button', class: 'option', 'aria-pressed': String(option.id === editing.chosen),
      onclick: () => { editing.chosen = option.id; renderOptions(); },
    }, el('img', { src: imageUrl(option.id), alt: option.name, width: 500, height: 500, loading: 'lazy' }),
    el('span', {}, option.name))));
}

async function searchInEditor() {
  const term = $('ed-query').value.trim();
  if (!term) return;
  renderOptions(t('editor.searching'));
  editing.options = await searchAny(term);
  editing.chosen = editing.options[0]?.id ?? null;
  renderOptions();
}

function saveEditor() {
  const { sentenceIndex, cardIndex, chosen, options } = editing;
  const card = sentences[sentenceIndex].cards[cardIndex];
  const query = $('ed-query').value.trim();
  Object.assign(card, { text: $('ed-text').value.trim(), query, options, chosen, searched: Boolean(chosen) || Boolean(query) });
  closeEditor();
}

function closeEditor() {
  $('editor').close();
  // A new card left empty does not stay on the page.
  sentences.forEach((sentence) => { sentence.cards = sentence.cards.filter((card) => card.text || card.chosen); });
  sentences = sentences.filter((sentence) => sentence.cards.length);
  render();
}

// ---------- PDF ----------
async function downloadPdf() {
  const button = $('pdf');
  button.disabled = true;
  $('pdf-label').textContent = t('button.pdfBusy');
  try {
    const { pdf, missingImages } = await buildPdf(
      { sentences, title: $('sheet-title').value },
      { format: picked('format'), orientation: picked('orientation'), size: picked('size'),
        colour: picked('colour') === 'colour', borders: $('borders').checked });
    pdf.save(t('pdf.fileName'));
    showAlert(missingImages ? t('message.pdfMissing', { n: missingImages }) : '');
  } catch (error) {
    console.error(error);
    showAlert(t('message.pdfFailed'));
  } finally {
    button.disabled = false;
    $('pdf-label').textContent = t('button.pdf');
  }
}

// ---------- start ----------
function refreshLanguage() {
  applyTranslations();
  renderExamples();
  if (sentences.length) render();
}

document.querySelectorAll('[data-lang]').forEach((button) =>
  button.addEventListener('click', () => { setLanguage(button.dataset.lang); refreshLanguage(); }));
$('find').addEventListener('click', transform);
$('open-credits').addEventListener('click', () => { $('credits-details').open = true; });
document.querySelectorAll('input[name="size"]').forEach((radio) => radio.addEventListener('change', render));
document.querySelectorAll('input[name="format"]').forEach((radio) =>
  radio.addEventListener('change', () => { $('borders').closest('label').hidden = picked('format') === 'cards'; }));
$('pdf').addEventListener('click', downloadPdf);
$('ed-search').addEventListener('click', searchInEditor);
$('ed-query').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); searchInEditor(); } });
$('ed-none').addEventListener('click', () => {
  editing.chosen = null; editing.options = []; $('ed-query').value = '';
  renderOptions(t('editor.textOnly'));
});
$('ed-delete').addEventListener('click', () => {
  sentences[editing.sentenceIndex].cards.splice(editing.cardIndex, 1);
  closeEditor();
});
$('ed-save').addEventListener('click', saveEditor);
$('ed-cancel').addEventListener('click', closeEditor);
$('editor').addEventListener('cancel', (event) => { event.preventDefault(); closeEditor(); });

refreshLanguage();
