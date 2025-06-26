const vscode = require('vscode');

function activate(context) {
  const decorations = {};

  // Farben für jede spezifische Satzart (anpassbar!)
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
    Z00: '#ff9da4'
  };

  // Erzeuge für jede Satzart eine passende Decoration
  for (const [satzart, farbe] of Object.entries(farbTabelle)) {
    decorations[satzart] = vscode.window.createTextEditorDecorationType({
      color: farbe
    });
  }

  function updateDecorations(editor) {
    if (!editor) return;
    const text = editor.document.getText();
    const rangesBySatzart = {};

    for (const satzart of Object.keys(farbTabelle)) {
      rangesBySatzart[satzart] = [];
    }

    const zeilen = text.split(/\r?\n/);
    zeilen.forEach((zeile, i) => {
      const match = zeile.match(/^([A-Z]{1}\d{2})/);
      if (match) {
        const satzart = match[1];
        if (rangesBySatzart[satzart]) {
          rangesBySatzart[satzart].push(new vscode.Range(i, 0, i, 3));
        }
      }
    });

    for (const [satzart, ranges] of Object.entries(rangesBySatzart)) {
      editor.setDecorations(decorations[satzart], ranges);
    }
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) updateDecorations(editor);
  });

  vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (editor && event.document === editor.document) updateDecorations(editor);
  });

  vscode.workspace.onDidOpenTextDocument(doc => {
    if (['.ftr', '.bord', '.stat', '.entl'].some(ext => doc.fileName.endsWith(ext))) {
      const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
      if (editor) updateDecorations(editor);
    }
  });

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

exports.activate = activate;
