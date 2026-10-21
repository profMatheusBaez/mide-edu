/* ============================================================
 * microbit_hex.js — MIDE EDU, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Gera o arquivo .hex que vai para a micro:bit, TUDO no navegador,
 * sem servidor, sem arduino-cli, sem pip e sem internet:
 *
 *   MicroPython → firmware oficial (micropython-v2.hex, v2.1.2) +
 *                 main.py (e arquivos auxiliares) gravados no sistema de
 *                 arquivos do firmware, com @microbit/microbit-fs (MIT).
 *   JavaScript  → compilador do MakeCode (pxt) rodando aqui no navegador,
 *                 ligado a um runtime C++ já compilado guardado em
 *                 js/vendor/makecode/hexcache (ver VERSOES-MICROBIT.txt).
 *
 * Só micro:bit V2. Não há suporte à V1.
 *
 * Funciona no navegador (global MicrobitHex) e no Node (testes em
 * ferramentas/), onde é preciso chamar configurar().
 * ============================================================ */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.MicrobitHex = api;
})(typeof self !== 'undefined' ? self : globalThis, function (raiz) {
  'use strict';

  const cfg = {
    urlFirmware: 'js/vendor/microbit/micropython-v2.hex',
    baseMakeCode: 'js/vendor/makecode/',
    MicrobitFs: null,        // no navegador: window.MicrobitFs
    criarCompilador: null,   // no navegador: window.MakeCodeCompiler.criarCompilador
    carregarTexto: null,     // (url) => Promise<string>; padrão: fetch
    verificadorPython: null, // (codigo) => Promise<{ok, erros, linha}>; padrão: PybricksMpy
  };

  function configurar(opcoes) { Object.assign(cfg, opcoes || {}); }

  async function carregarTexto(url) {
    if (cfg.carregarTexto) return cfg.carregarTexto(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error('Não consegui carregar ' + url + ' (' + r.status + ').');
    return r.text();
  }

  /* ------------------------------------------------------------
   * MicroPython
   * ---------------------------------------------------------- */
  let _firmware = null;
  async function firmwareV2() {
    if (!_firmware) _firmware = carregarTexto(cfg.urlFirmware).catch((e) => { _firmware = null; throw e; });
    return _firmware;
  }

  function obterFs() {
    const fs = cfg.MicrobitFs || raiz.MicrobitFs;
    if (!fs) throw new Error('A biblioteca de arquivos da micro:bit (microbit-fs) não foi carregada.');
    return fs;
  }

  /* arquivos: { 'main.py': '...', 'lcd1602.py': '...' }
   *   → { ok: true, hex: '<intel hex>', bytes: n, restante: bytes livres }
   *   → { ok: false, erro: 'mensagem em português' } */
  async function montarHexPython(arquivos) {
    try {
      const Fs = obterFs();
      const base = await firmwareV2();
      const fsHex = new Fs.MicropythonFsHex([{ hex: base, boardId: Fs.microbitBoardId.V2 }]);
      const nomes = Object.keys(arquivos || {});
      if (!nomes.length) return { ok: false, erro: 'Não há nenhum arquivo para enviar.' };
      for (const nome of nomes) {
        if (!/^[A-Za-z0-9_.\-]{1,120}$/.test(nome)) return { ok: false, erro: 'Nome de arquivo inválido: ' + nome };
        try { fsHex.write(nome, arquivos[nome]); }
        catch (e) {
          if (/space|storage|full|no room|cannot fit|too large/i.test(String(e && e.message))) {
            return { ok: false, erro: 'O programa é grande demais para caber na memória de arquivos da micro:bit.' };
          }
          throw e;
        }
      }
      const hex = fsHex.getIntelHex(Fs.microbitBoardId.V2);
      return { ok: true, hex, bytes: hex.length, restante: fsHex.getStorageRemaining() };
    } catch (e) {
      return { ok: false, erro: 'Não consegui montar o arquivo .hex do MicroPython: ' + (e && e.message ? e.message : e) };
    }
  }

  /* Confere a sintaxe Python com o mpy-cross (o mesmo da placa LEGO). Não gera o
   * .hex: só avisa da linha com erro. Sem o compilador, devolve ok com aviso. */
  async function verificarPython(codigo) {
    if (cfg.verificadorPython) return cfg.verificadorPython(codigo);
    const M = raiz.PybricksMpy;
    if (!M) return { ok: true, avisoSemChecagem: true, erros: [], linha: null };
    try {
      const r = await M.compilarPrograma(String(codigo));
      if (r.ok) return { ok: true, erros: [], linha: null };
      return { ok: false, erros: r.erros, linha: r.linha };
    } catch (e) {
      return { ok: true, avisoSemChecagem: true, erros: [], linha: null };
    }
  }

  /* ------------------------------------------------------------
   * JavaScript (MakeCode)
   * ---------------------------------------------------------- */
  let _compilador = null;
  function obterCompilador() {
    if (_compilador) return _compilador;
    const fab = cfg.criarCompilador || (raiz.MakeCodeCompiler && raiz.MakeCodeCompiler.criarCompilador);
    if (!fab) return Promise.reject(new Error('O compilador do MakeCode não foi carregado.'));
    _compilador = Promise.resolve(fab(cfg.baseMakeCode)).catch((e) => { _compilador = null; throw e; });
    return _compilador;
  }

  /* Traduz o texto de um erro do TypeScript do MakeCode para o aluno. */
  function traduzirErroTS(txt) {
    const t = String(txt);
    let m;
    if ((m = /Cannot find name '([^']+)'/.exec(t))) return 'o nome “' + m[1] + '” não existe (variável não criada ou bloco escrito errado)';
    if ((m = /Property '([^']+)' does not exist on type '([^']+)'/.exec(t))) return '“' + m[1] + '” não existe em ' + m[2].replace(/^typeof /, '');
    if (/Expected (\d+) arguments?, but got (\d+)/.test(t)) return 'quantidade de valores errada dentro dos parênteses';
    if (/is not assignable to (type|parameter of type)/.test(t)) return 'o tipo do valor não combina (número, texto ou verdadeiro/falso)';
    if (/';' expected|',' expected|'\)' expected|'\(' expected|'\}' expected|Declaration or statement expected/.test(t)) return 'falta ou sobra um símbolo — confira parênteses, chaves e vírgulas';
    if (/Unterminated string/.test(t)) return 'texto entre aspas sem fechar';
    if (/Identifier expected/.test(t)) return 'faltou um nome aqui';
    return t;
  }

  /* codigo: JS do MakeCode. opcoes: { bluetooth: bool, arquivosExtras: {'lcd.ts': '...'} }
   *   → { ok: true, hex, avisos }
   *   → { ok: false, erros: [{linha, coluna, texto}], mensagem, semHex } */
  async function compilarHexJS(codigo, opcoes) {
    let comp;
    try { comp = await obterCompilador(); }
    catch (e) { return { ok: false, erros: [], mensagem: 'Não consegui iniciar o compilador do MakeCode: ' + (e && e.message ? e.message : e) }; }
    const r = await comp.compilar(String(codigo), opcoes || {});
    if (r.ok) return { ok: true, hex: r.hex, avisos: r.avisos || [] };
    const erros = (r.erros || []).filter((d) => !d.arquivo || d.arquivo === 'main.ts').map((d) => ({
      linha: d.linha, coluna: d.coluna, texto: traduzirErroTS(d.texto), bruto: d.texto,
    }));
    return { ok: false, erros, mensagem: r.mensagem || 'O programa tem erros.', semHex: !!r.semHex };
  }

  return { configurar, firmwareV2, montarHexPython, verificarPython, compilarHexJS, traduzirErroTS };
});
