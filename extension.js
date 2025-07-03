const vscode = require('vscode');

function activate(context) {
  // Dekorationsobjekt: speichert alle TextEditor-Dekorationen für Satzarten
  const decorations = {};

  // Die Farbtabelle für jede Satzart – erweitert um neue Typen (Q00, M00, ...)
  const farbTabelle = {
    A00: '#9cdcfe',
    A10: '#40bfff',
    B00: '#dcdcaa',
    B10: '#e7e798',
    C00: '#ce9178',
    D00: '#4ec9b0',
    D10: '#6ee6cf',
    E00: '#c586c0',
    E10: '#e2b3e8',
    F00: '#d16969',
    G00: '#b5cea8',
    H00: '#569cd6',
    H10: '#7ba7ea',
    I00: '#c8c8c8',
    J00: '#ffc66d',
    Z00: '#ff9da4',
    M00: '#ffa07a',
    N00: '#a9a9f5',
    Q00: '#98fb98',
    Q10: '#c0fccc'
  };

  // Für jede Satzart wird eine VS Code Text-Dekoration erzeugt
  for (const [satzart, farbe] of Object.entries(farbTabelle)) {
    decorations[satzart] = vscode.window.createTextEditorDecorationType({
      color: farbe // Farbe, mit der die Satzart im Editor dargestellt wird
    });
  }

  // Prüft, ob die Datei durch ihren Header als FORTRAS-Datei erkannt werden kann
  function istFortrasDatei(text) {
    const header = text.split(/\r?\n/)[0]; // Erste Zeile der Datei
    return /@@PH(STAT|BORD|ENTL)\d*/.test(header.toUpperCase());
  }

  // Diese Funktion sucht nach Satzarten wie A00, B10 usw. und weist die passende Farbe zu
  function updateDecorations(editor) {
    if (!editor) return;

    const text = editor.document.getText();

    // Verhindert Hervorhebung, wenn kein FORTRAS-Kopf erkannt wird
    if (!istFortrasDatei(text)) return;

    const zeilen = text.split(/\r?\n/);
    const rangesBySatzart = {};

    // Initialisiere leere Arrays für jede erkannte Satzart
    for (const satzart of Object.keys(farbTabelle)) {
      rangesBySatzart[satzart] = [];
    }

    // Durchläuft jede Zeile und prüft, ob sie mit einer Satzart beginnt (z. B. "A00...")
    zeilen.forEach((zeile, i) => {
      const match = zeile.match(/^([A-Z]{1}\d{2})/);
      if (match) {
        const satzart = match[1];
        if (rangesBySatzart[satzart]) {
          // Setzt die Dekoration für das Zeichenbereich von Spalte 0 bis 3 der betroffenen Zeile
          rangesBySatzart[satzart].push(new vscode.Range(i, 0, i, 3));
        }
      }
    });

    // Weist jeder Satzart ihre gesammelten Textbereiche zu – VS Code zeigt sie farbig an
    for (const [satzart, ranges] of Object.entries(rangesBySatzart)) {
      editor.setDecorations(decorations[satzart], ranges);
    }
  }

  // Listener: Bei geöffnetem neuen Editor – prüfe auf FORTRAS und dekoriere
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) updateDecorations(editor);
    }),

    // Listener: Bei Änderungen am Dokument – aktualisiere Hervorhebungen
    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        updateDecorations(editor);
      }
    }),

    // Listener: Bei Öffnen einer Datei – Trigger für Dekoration
    vscode.workspace.onDidOpenTextDocument(doc => {
      const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
      if (editor) updateDecorations(editor);
    })
  );

  // Initialer Aufruf – wenn beim Laden schon ein Editor aktiv ist
  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

exports.activate = activate;
