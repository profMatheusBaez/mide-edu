/* ============================================================
 * pybricks_mpy.js — MIDE EDU, placa LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Compila Python (.py) para .mpy DENTRO do navegador, com o
 * mpy-cross oficial do Pybricks em WebAssembly, e monta o blob
 * "multi-mpy6" que o hub aceita pelo perfil BLE do Pybricks.
 *
 * Vendorizado (sem CDN):
 *   @pybricks/mpy-cross-v6 2.0.0 (MIT) — js/vendor/pybricks/
 *   mpy-cross-v6.js + mpy-cross-v6.wasm (+ LICENSE).
 *   O .js do pacote é um script comum (declara a função global
 *   `MpyCross`), então carrega com <script> sem bundler. A função
 *   compile() abaixo repete o que o index.js do pacote faz — o
 *   index.js é CommonJS, feito para bundler, e não roda no
 *   navegador puro.
 *
 * Formato do blob (confirmado no pybricksdev, compile.py):
 *   para cada módulo: uint32 LE tamanho_do_mpy
 *                     + nome do módulo como C-string (termina em \0)
 *                     + bytes do .mpy
 * Na v1 há um módulo só: "__main__".
 *
 * Funciona no navegador (global PybricksMpy) e no Node
 * (ferramentas/testar_*.mjs), onde é preciso chamar configurar().
 * ============================================================ */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.PybricksMpy = api;
})(typeof self !== 'undefined' ? self : globalThis, function (raiz) {
  'use strict';

  const NOME_WASM = 'mpy-cross-v6.wasm';
  const cfg = {
    mpyCross: null,   // função MpyCross do pacote (no navegador: window.MpyCross)
    wasm: 'js/vendor/pybricks/' + NOME_WASM,   // relativo à página
  };

  /* Só necessário no Node (ou se a página servir os arquivos em outro lugar). */
  function configurar(opcoes) {
    if (opcoes && opcoes.mpyCross) cfg.mpyCross = opcoes.mpyCross;
    if (opcoes && opcoes.wasm) cfg.wasm = opcoes.wasm;
  }

  function obterMpyCross() {
    const f = cfg.mpyCross || raiz.MpyCross;
    if (typeof f !== 'function') throw new Error('O compilador Python (mpy-cross) não foi carregado.');
    return f;
  }

  /* Chama o mpy-cross uma vez. Cada chamada cria uma instância nova do
   * módulo WebAssembly (o programa do pacote roda uma vez e sai). */
  function compilarBruto(nomeArquivo, conteudo, opcoes) {
    return new Promise((resolve, reject) => {
      try {
        const args = [nomeArquivo];
        if (opcoes && opcoes.length) args.unshift(...opcoes);
        const pronto = obterMpyCross()({
          arguments: args,
          inputFileContents: conteudo,
          callback: (status, mpy, out, err) => resolve({ status, mpy, out, err }),
          locateFile: (caminho, pasta) => (caminho === NOME_WASM ? cfg.wasm : pasta + caminho),
        });
        if (pronto && typeof pronto.catch === 'function') pronto.catch(reject);
      } catch (e) { reject(e); }
    });
  }

  /* Monta o blob multi-mpy6. `modulos`: [{ nome, mpy: Uint8Array }]. */
  function montarBlob(modulos) {
    const codificador = new TextEncoder();
    const partes = [];
    let total = 0;
    for (const m of modulos) {
      const nome = codificador.encode(m.nome + '\0');
      const cab = new Uint8Array(4);
      new DataView(cab.buffer).setUint32(0, m.mpy.length, true);
      partes.push(cab, nome, m.mpy);
      total += cab.length + nome.length + m.mpy.length;
    }
    const blob = new Uint8Array(total);
    let pos = 0;
    for (const p of partes) { blob.set(p, pos); pos += p.length; }
    return blob;
  }

  /* Tradução de mensagens do MicroPython para linguagem de aluno.
   * A ordem importa: a primeira que casar vence. */
  const TRADUCOES = [
    [/unexpected indent/i, 'recuo (espaços no começo da linha) inesperado'],
    [/unindent (does not|doesn't) match/i, 'o recuo desta linha não combina com o das linhas de cima'],
    [/expected an indented block/i, 'faltou recuar o que vem depois do “:” (use 4 espaços)'],
    [/invalid syntax/i, 'a escrita desta linha (ou da anterior) não é válida em Python — confira parênteses, dois-pontos (:) e aspas'],
    [/bad indentation|IndentationError/i, 'problema de recuo (espaços no começo da linha)'],
    [/unterminated string|EOL while scanning/i, 'texto entre aspas sem fechar'],
    [/unmatched|expected '\)'|bracket|paren/i, 'parênteses ou colchetes sem par'],
    [/'break' outside loop/i, '“break” só pode ser usado dentro de um laço'],
    [/'return' outside function/i, '“return” só pode ser usado dentro de uma função'],
    [/name '.*' isn't defined|not defined/i, 'nome não definido'],
    [/SyntaxError/i, 'erro de sintaxe'],
  ];

  function traduzirMensagem(msg) {
    for (const [regex, texto] of TRADUCOES) if (regex.test(msg)) return texto;
    return msg;
  }

  /* Extrai a linha e a mensagem da saída de erro do mpy-cross.
   * Formatos vistos:  '  File "__main__.py", line 3'  seguido de
   * 'SyntaxError: invalid syntax'  — ou tudo numa linha só. */
  function interpretarErros(linhasErr) {
    const texto = (linhasErr || []).join('\n');
    const mLinha = /line (\d+)/i.exec(texto);
    const linha = mLinha ? parseInt(mLinha[1], 10) : null;
    const mMsg = /(\w*Error[^\n]*|error[^\n]*)/.exec(texto.split('\n').filter((l) => !/^\s*File /.test(l)).join('\n'));
    const bruta = (mMsg ? mMsg[1] : texto).trim();
    const traduzida = traduzirMensagem(bruta);
    const mensagem = linha
      ? 'Erro na linha ' + linha + ': ' + traduzida
      : 'Erro no programa: ' + traduzida;
    return { linha, mensagem, bruta };
  }

  /* Compila o código-fonte de um programa e devolve o blob para o hub.
   *   → { ok: true,  blob: Uint8Array, mpy: Uint8Array }
   *   → { ok: false, erros: [mensagem], linha: n|null, bruto: [...] } */
  async function compilarPrograma(codigo) {
    let r;
    try {
      r = await compilarBruto('__main__.py', String(codigo));
    } catch (e) {
      return { ok: false, erros: ['Não foi possível iniciar o compilador Python: ' + (e && e.message ? e.message : e)], linha: null, bruto: [] };
    }
    if (r.status !== 0 || !r.mpy) {
      const info = interpretarErros(r.err.length ? r.err : r.out);
      return { ok: false, erros: [info.mensagem], linha: info.linha, bruto: (r.err || []).concat(r.out || []) };
    }
    return { ok: true, blob: montarBlob([{ nome: '__main__', mpy: r.mpy }]), mpy: r.mpy };
  }

  return { configurar, compilarBruto, montarBlob, compilarPrograma, interpretarErros, traduzirMensagem };
});
