# Testo in simboli · Text to symbols

**English** · [Italiano](#italiano)

A free tool for teachers. Write short, simple sentences; the tool finds an
[ARASAAC](https://arasaac.org) pictogram for each word and prepares an A4 PDF to print,
either as strips to read together or as cards to cut out.

**Try it:** <https://shalini27.github.io/testo-in-simboli/>
(English interface: <https://shalini27.github.io/testo-in-simboli/?lang=en>)

## How to use it

1. Write or paste the text, one sentence per line or separated by full stops. The
   interface language (IT / EN, top right) is also the language the words are searched in.
2. Check the suggested symbols. Click a card to change the symbol, fix the words, remove
   the symbol or delete the card. The `+` at the end of a sentence adds a card.
3. Choose the format and download the PDF:
   - **Strips**: the sentences in order, one under the other;
   - **Cut-out cards**: a grid of equal cards (3, 4 or 5.5 cm wide), each symbol once,
     with cut lines, to laminate or glue.
   Landscape or portrait, colour or black and white. Print at 100% ("actual size") so the
   measurements are right.

## What it does and does not do

This tool **does not use artificial intelligence**. It works with simple rules:

- it attaches articles and prepositions to the following word (`le mani`, `to the gym`);
- it recognises multi-word expressions that ARASAAC knows (`scarpe da ginnastica`);
- if a word is not found, it tries the base form (`andiamo` → `andare`, `washing` → `wash`).

As a result:

- **it does not simplify the text**: write sentences that are already short and clear;
- **it does not understand context**: in "hanno letto un libro" it suggests a bed (*letto*).
  Always check the first symbol it suggests;
- for words it cannot find it leaves an empty box: it never invents or generates images.

## Personal data

- No accounts, advertising, cookies or tracking. The only thing stored in the browser is
  the chosen interface language.
- The text stays in the browser: it is not saved and not sent to this site.
- Only the single words or expressions to look up are sent to ARASAAC.
- **Do not enter pupils' names, diagnoses or other personal data.**

## Licences and credits

- **Code:** MIT licence, © Shalini Kurapati. See [LICENSE](LICENSE).
- **Pictograms:** the pictographic symbols used are the property of the Government of
  Aragón and have been created by Sergio Palao for [ARASAAC](http://www.arasaac.org), that
  distributes them under
  [Creative Commons License BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en).
  **Non-commercial use only**, with attribution, and the same licence for derived materials.
- **PDF library:** [jsPDF](https://github.com/parallax/jsPDF), MIT, © James Hall, yWorks
  GmbH and contributors.
- **Typefaces:** Bricolage Grotesque and Figtree, SIL Open Font License 1.1, © their
  authors. They are served from this site: no requests to Google Fonts.
- **Transparency:** the code was written with the help of an AI assistant (Claude Code)
  and checked by the author. The tool itself contains no artificial intelligence.

The full conditions, and what they mean for the sheets you print, are in
[LICENSES.md](LICENSES.md).

This tool is not an ARASAAC product and is not approved or endorsed by ARASAAC.

## For developers

A static site with no build step: HTML, CSS and JavaScript modules.

| File | Contents |
|---|---|
| `index.html`, `style.css` | the page (Italian text is the default markup) |
| `app.js` | interface: cards, edit dialog, buttons, language switch |
| `i18n.js` | interface texts in Italian and English |
| `arasaac.js` | pictogram search and the text-to-cards step |
| `lang-it.js`, `lang-en.js` | per-language rules: words to skip, base-form guesses |
| `pdf.js` | PDF layout |
| `vendor/` | [jsPDF](https://github.com/parallax/jsPDF) 4.2.1 |
| `fonts/` | Bricolage Grotesque and Figtree |

To run it locally you need a small web server, because JavaScript modules do not load from
disk:

```
python3 -m http.server 8000
```

then open <http://localhost:8000>. To add a language, add a `lang-xx.js` rules file, a
block of texts in `i18n.js`, and a button with `data-lang="xx"` in `index.html`; ARASAAC
must support that language code.

---

<a id="italiano"></a>

# Italiano

Strumento gratuito per insegnanti. Scrivi frasi brevi e semplici; lo strumento cerca un
pittogramma [ARASAAC](https://arasaac.org) per ogni parola e prepara un PDF A4 da stampare,
a strisce da leggere insieme oppure a carte da ritagliare.

**Prova lo strumento:** <https://shalini27.github.io/testo-in-simboli/>

## Come si usa

1. Scrivi o incolla il testo, una frase per riga oppure frasi separate dal punto. La lingua
   dell'interfaccia (IT / EN, in alto a destra) è anche la lingua in cui si cercano le parole.
2. Controlla i simboli proposti. Un clic su una carta permette di cambiare il simbolo,
   correggere le parole, togliere il simbolo o eliminare la carta. Il `+` alla fine di ogni
   frase aggiunge una carta.
3. Scegli il formato e scarica il PDF:
   - **Strisce**: le frasi in ordine, una sotto l'altra;
   - **Carte da ritagliare**: una griglia di carte tutte uguali (larghe 3, 4 o 5,5 cm), ogni
     simbolo una sola volta, con le linee di taglio, da plastificare o incollare.
   Foglio orizzontale o verticale, a colori o in bianco e nero. Stampa al 100%
   ("dimensioni effettive") perché le misure siano giuste.

## Che cosa fa e che cosa non fa

Questo strumento **non usa l'intelligenza artificiale**. Funziona con regole semplici:

- unisce articoli e preposizioni alla parola che segue (`le mani`, `in palestra`);
- riconosce le espressioni di più parole che ARASAAC conosce (`scarpe da ginnastica`);
- se una parola non viene trovata, prova la forma base (`andiamo` → `andare`).

Di conseguenza:

- **non semplifica il testo**: le frasi vanno scritte già brevi e chiare;
- **non capisce il contesto**: in "hanno letto un libro" propone il letto per dormire.
  Il primo simbolo proposto va sempre controllato;
- per le parole che non trova lascia un riquadro vuoto: non inventa e non genera immagini.

## Dati personali

- Non ci sono account, pubblicità, cookie o sistemi di tracciamento. L'unica cosa salvata
  nel browser è la lingua scelta per l'interfaccia.
- Il testo resta nel browser: non viene salvato e non viene inviato a questo sito.
- Ad ARASAAC vengono inviate solo le singole parole o espressioni da cercare.
- **Non inserire nomi di alunni, diagnosi o altri dati personali.**

## Licenze e crediti

- **Codice:** licenza MIT, © Shalini Kurapati. Vedi [LICENSE](LICENSE).
- **Pittogrammi:** i simboli pittografici utilizzati sono di proprietà del Governo di
  Aragona e sono stati creati da Sergio Palao per [ARASAAC](http://www.arasaac.org), che li
  distribuisce con licenza
  [Creative Commons BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it).
  **Solo uso non commerciale**, con citazione, e stessa licenza per i materiali derivati.
- **Libreria PDF:** [jsPDF](https://github.com/parallax/jsPDF), MIT, © James Hall, yWorks
  GmbH e collaboratori.
- **Caratteri:** Bricolage Grotesque e Figtree, SIL Open Font License 1.1, © i rispettivi
  autori. Sono ospitati in questo sito: nessuna richiesta a Google Fonts.
- **Trasparenza:** il codice è stato scritto con l'aiuto di un assistente di intelligenza
  artificiale (Claude Code) e controllato dall'autrice. Lo strumento, quando lo usi, non
  contiene alcuna intelligenza artificiale.

Le condizioni complete, e che cosa significano per i fogli che stampi, sono in
[LICENSES.md](LICENSES.md#italiano).

Questo strumento non è un prodotto ARASAAC e non è approvato da ARASAAC.
