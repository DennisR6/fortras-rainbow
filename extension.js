const vscode = require('vscode');

function activate(context) {
  const decorations = {};

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

  for (const [satzart, farbe] of Object.entries(farbTabelle)) {
    decorations[satzart] = vscode.window.createTextEditorDecorationType({
      color: farbe
    });
  }

  function erkenneSatzartAusHeader(text) {
    const ersteZeile = text.split(/\r?\n/)[0];
    const match = ersteZeile.match(/(BORD\d*|STAT|[A-Z]{1}\d{2})/i);
    if (!match) return null;

    const header = match[1].toUpperCase();

    if (header.startsWith('BORD')) return 'B00';
    if (header.startsWith('STAT')) return 'A00';
    if (farbTabelle[header]) return header;

    return null;
  }

  function updateDecorations(editor) {
    if (!editor) return;
    const text = editor.document.getText();

    const erkannteSatzart = erkenneSatzartAusHeader(text);
    if (!erkannteSatzart || !farbTabelle[erkannteSatzart]) return;

    const ranges = [];
    const zeilen = text.split(/\r?\n/);
    zeilen.forEach((zeile, i) => {
      const match = zeile.match(/^([A-Z]{1}\d{2})/);
      if (match && match[1] === erkannteSatzart) {
        ranges.push(new vscode.Range(i, 0, i, 3));
      }
    });

    editor.setDecorations(decorations[erkannteSatzart], ranges);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) updateDecorations(editor);
    }),

    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) updateDecorations(editor);
    }),

    vscode.workspace.onDidOpenTextDocument(doc => {
      const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
      if (editor) updateDecorations(editor);
    })
  );

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

exports.activate = activate;