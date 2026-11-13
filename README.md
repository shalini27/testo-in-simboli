# Testo in simboli

Strumento gratuito per insegnanti: scrivi frasi brevi e semplici, lo strumento cerca un
pittogramma [ARASAAC](https://arasaac.org) per ogni parola e prepara un foglio PDF da
stampare, in A4 orizzontale o verticale.

**Prova lo strumento:** <https://shalini27.github.io/testo-in-simboli/>

## Come si usa

1. Scrivi o incolla il testo. Una frase per riga, oppure frasi separate dal punto.
2. Controlla i simboli proposti. Un clic su una carta permette di cambiare il simbolo,
   correggere le parole, togliere il simbolo o eliminare la carta. Il `+` alla fine di
   ogni frase aggiunge una carta.
3. Scegli il formato e scarica il PDF:
   - **Strisce**: le frasi in ordine, una sotto l'altra, da leggere insieme;
   - **Carte da ritagliare**: una griglia di carte tutte uguali (3, 4 o 5,5 cm), ogni simbolo
     una sola volta, con le linee di taglio, da plastificare o incollare.
   Puoi scegliere foglio orizzontale o verticale, colori o bianco e nero. Stampa al 100%
   ("dimensioni effettive") perché le misure siano giuste.

## Che cosa fa e che cosa non fa

Questo strumento **non usa l'intelligenza artificiale**. Funziona con regole semplici:

- unisce articoli e preposizioni alla parola che segue (`le mani`, `in palestra`);
- prova a riconoscere le espressioni di più parole che ARASAAC conosce
  (`scarpe da ginnastica`);
- se una parola non viene trovata, prova la forma base (`andiamo` → `andare`,
  `portate` → `portare`).

Di conseguenza:

- **non semplifica il testo**: le frasi vanno scritte già brevi e chiare;
- **non capisce il contesto**: in "hanno letto un libro" propone il letto per dormire.
  Il primo simbolo proposto va sempre controllato;
- per le parole che non trova lascia un riquadro vuoto: non inventa e non genera immagini.

## Dati personali

- Non ci sono account, pubblicità, cookie o sistemi di tracciamento.
- Il testo resta nel browser: non viene salvato e non viene inviato a questo sito.
- Ad ARASAAC vengono inviate solo le singole parole o espressioni da cercare.
- **Non inserire nomi di alunni, diagnosi o altri dati personali.**

## Licenze

- Il codice è distribuito con licenza [MIT](LICENSE).
- I pittogrammi sono di proprietà del Governo di Aragona, sono stati creati da Sergio Palao
  per ARASAAC e sono distribuiti con licenza Creative Commons BY-NC-SA 4.0: **solo uso non
  commerciale**, con citazione, e stessa licenza per i materiali derivati.

Le condizioni complete, e che cosa significano per i fogli che stampi, sono in
[LICENZE.md](LICENZE.md).

Questo strumento non è un prodotto ARASAAC e non è approvato da ARASAAC.

## Crediti

- **Pittogrammi:** autore Sergio Palao; origine [ARASAAC](http://www.arasaac.org); licenza
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it); proprietà
  Governo di Aragona (Spagna).
- **Strumento:** Shalini Kurapati, licenza MIT.
- **Libreria PDF:** [jsPDF](https://github.com/parallax/jsPDF), licenza MIT, © James Hall,
  yWorks GmbH e collaboratori.
- **Trasparenza:** il codice è stato scritto con l'aiuto di un assistente di intelligenza
  artificiale (Claude Code) e controllato dall'autrice. Lo strumento, quando lo usi, non
  contiene alcuna intelligenza artificiale.

## Per chi vuole modificarlo

È un sito statico senza passaggi di compilazione: HTML, CSS e JavaScript.

| File | Contenuto |
|---|---|
| `index.html`, `style.css` | la pagina |
| `app.js` | interfaccia: carte, finestra di modifica, bottoni |
| `arasaac.js` | ricerca dei pittogrammi e passaggio dal testo alle carte |
| `lemmi.js` | parole da non cercare e regole per risalire alla forma base |
| `pdf.js` | impaginazione del PDF |
| `vendor/` | libreria [jsPDF](https://github.com/parallax/jsPDF) 4.2.1 |

Per provarlo in locale serve un piccolo server, perché i moduli JavaScript non si aprono
direttamente dal disco:

```
python3 -m http.server 8000
```

e poi <http://localhost:8000>.

---

**In English.** A free, static web page for teachers: type short Italian sentences and get
a printable A4 sheet (landscape or portrait) with one ARASAAC pictogram per concept. No AI,
no accounts, no tracking; the text stays in the browser and only single words are sent to
the public ARASAAC API. Code under MIT; pictograms are property of the Government of
Aragon, created by Sergio Palao for ARASAAC, licensed CC BY-NC-SA (non-commercial,
attribution, share-alike). See [LICENZE.md](LICENZE.md).
