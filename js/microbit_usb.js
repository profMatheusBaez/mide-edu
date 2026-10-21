/* ============================================================
 * microbit_usb.js — MIDE EDU, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Conexão USB (WebUSB, Chrome/Edge) com a micro:bit, direto do
 * navegador: conectar, gravar o .hex (partial flashing, sem
 * arduino-cli e sem pip) e Monitor Serial (serial do DAPLink).
 *
 * Usa @microbit/microbit-connection 1.0.0 (MIT), vendorizado em
 * js/vendor/microbit/microbit-connection.js (global MicrobitConnection).
 *
 * REGRAS (plano-microbit-v2 §11):
 *  - navigator.usb.requestDevice tem de ser a PRIMEIRA coisa depois do
 *    clique: conectar() chama a biblioteca sem nenhum await antes.
 *  - Uma operação por vez: gravar, escrever na serial e desconectar
 *    passam por uma FILA única. A serial da biblioteca já é pausada
 *    durante a gravação; aqui a fila garante que nenhum envio do aluno
 *    corra junto com o flash.
 *  - Só uma conexão por vez: a IDE solta a USB ao trocar de placa.
 *  - Sem WebUSB → mensagem clara, nunca um botão morto.
 *
 * Funciona no navegador (global MicrobitUSB) e no Node (testes em
 * ferramentas/testar_mb_usb.mjs, com uma conexão falsa).
 * ============================================================ */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.MicrobitUSB = api;
})(typeof self !== 'undefined' ? self : globalThis, function (raiz) {
  'use strict';

  /* Cada chamada de criar() é uma conexão independente (os testes usam várias);
   * a IDE usa a instância padrão exportada como MicrobitUSB. */
  function criar(opcoesIniciais) {
    /* Estados que a interface mostra. */
    const ESTADOS = ['desconectado', 'conectando', 'conectado', 'gravando'];

    const cfg = Object.assign({
      biblioteca: null,   // no navegador: window.MicrobitConnection
      fabricaUSB: null,   // (opcoes) => conexão; nos testes, uma conexão falsa
    }, opcoesIniciais || {});

    const S = {
      conexao: null,
      estado: 'desconectado',
      ouvintes: { estado: [], texto: [], erro: [], desconectou: [] },
      fila: Promise.resolve(),
      gravando: false,
      buffer: null,
      ultimoErro: '',
    };

    function configurar(opcoes) { Object.assign(cfg, opcoes || {}); }

    function on(evento, fn) {
      if (S.ouvintes[evento]) S.ouvintes[evento].push(fn);
      return () => { S.ouvintes[evento] = S.ouvintes[evento].filter((f) => f !== fn); };
    }
    function emitir(evento, dado) {
      for (const fn of (S.ouvintes[evento] || []).slice()) {
        try { fn(dado); } catch (e) { /* ouvinte com defeito não derruba a conexão */ }
      }
    }

    function biblioteca() { return cfg.biblioteca || raiz.MicrobitConnection || null; }

    function suportado() {
      if (cfg.fabricaUSB) return true;
      return !!(raiz.navigator && raiz.navigator.usb && biblioteca());
    }

    /* ------------------------------------------------------------
     * Mensagens em português
     * ---------------------------------------------------------- */
    const MENSAGENS = {
      unsupported: 'Este navegador não tem WebUSB. Use o Google Chrome ou o Microsoft Edge.',
      'no-device-selected': 'Nenhuma micro:bit foi escolhida na janela. Conecte o cabo USB e tente de novo.',
      aborted: 'A operação foi cancelada.',
      'permission-denied': 'O navegador não deixou usar a USB. Permita o acesso e tente de novo.',
      'not-connected': 'A micro:bit não está conectada. Clique em “Conectar micro:bit”.',
      'device-in-use': 'A micro:bit está sendo usada por outro programa. Feche as abas do makecode.microbit.org e do python.microbit.org e tente de novo.',
      'device-disconnected': 'A micro:bit foi desconectada. Confira o cabo USB e conecte de novo.',
      timeout: 'A micro:bit demorou demais para responder. Desconecte o cabo, ligue de novo e tente outra vez.',
      'connection-error': 'Não consegui falar com a micro:bit. Use um cabo USB de dados (não só de carga) e tente de novo.',
      'firmware-update-required': 'O firmware da interface USB da micro:bit está antigo. Use “Baixar .hex” e arraste o arquivo para a unidade MICROBIT.',
    };

    function mensagemDeErro(e, padrao) {
      if (e && e.code && MENSAGENS[e.code]) return MENSAGENS[e.code];
      const txt = e && e.message ? String(e.message) : '';
      if (/NotFoundError|No device selected|no device selected/i.test(txt + ' ' + (e && e.name))) return MENSAGENS['no-device-selected'];
      if (/SecurityError|Access denied|NotAllowed/i.test(txt + ' ' + (e && e.name))) return MENSAGENS['permission-denied'];
      if (/claimInterface|already in use|busy|Unable to claim/i.test(txt)) return MENSAGENS['device-in-use'];
      if (/disconnected|NetworkError|device was lost/i.test(txt)) return MENSAGENS['device-disconnected'];
      return (padrao || 'Erro na micro:bit') + (txt ? ': ' + txt : '.');
    }

    /* ------------------------------------------------------------
     * Estado
     * ---------------------------------------------------------- */
    function definirEstado(novo) {
      if (S.estado === novo) return;
      S.estado = novo;
      emitir('estado', novo);
    }

    /* status da biblioteca → estado nosso (quando não estamos gravando) */
    function aplicarStatus(status) {
      if (S.gravando) return;   // durante o flash a biblioteca passa por Connecting/Paused
      if (status === 'Connected') definirEstado('conectado');
      else if (status === 'Connecting') definirEstado('conectando');
      else if (status === 'Paused') { /* aba escondida: a biblioteca reconecta sozinha */ }
      else {
        const eraConectado = S.estado === 'conectado' || S.estado === 'conectando';
        definirEstado('desconectado');
        if (eraConectado) emitir('desconectou', null);
      }
    }

    /* ------------------------------------------------------------
     * Fila única
     * ---------------------------------------------------------- */
    function naFila(tarefa) {
      const executar = () => tarefa();
      const p = S.fila.then(executar, executar);
      S.fila = p.then(() => undefined, () => undefined);
      return p;
    }

    /* ------------------------------------------------------------
     * Linhas do Monitor Serial
     * O texto chega em pedaços quaisquer (o DAPLink entrega o que tem).
     * Vira linhas completas; o que ficou sem \n é solto por descarregar().
     * ---------------------------------------------------------- */
    function criarBufferLinhas(aoLinha) {
      let resto = '';
      let vinhaCR = false;
      return {
        adicionar(texto) {
          let t = String(texto);
          /* U+FFFD nas pontas de um pedaço = caractere UTF-8 partido ao meio pelo USB:
             não dá para recompor, então sai da tela em vez de virar "�". */
          t = t.replace(/\uFFFD/g, '');
          if (vinhaCR && t[0] === '\n') t = t.slice(1);
          vinhaCR = t.endsWith('\r');
          const partes = (resto + t).split(/\r\n|\r|\n/);
          resto = partes.pop();
          for (const l of partes) aoLinha(l);
        },
        pendente() { return resto.length > 0; },
        descarregar() { if (resto.length) { const l = resto; resto = ''; aoLinha(l); } },
      };
    }

    /* ------------------------------------------------------------
     * Conectar / desconectar
     * ---------------------------------------------------------- */
    function criarConexao() {
      if (cfg.fabricaUSB) return cfg.fabricaUSB({ pauseOnHidden: true });
      const lib = biblioteca();
      if (!lib || !lib.createUSBConnection) throw Object.assign(new Error('biblioteca ausente'), { code: 'unsupported' });
      return lib.createUSBConnection({ pauseOnHidden: true });
    }

    /* IMPORTANTE: chamar direto do clique; sem await antes. */
    function conectar() {
      if (!suportado()) return Promise.reject(Object.assign(new Error(MENSAGENS.unsupported), { code: 'unsupported', mensagem: MENSAGENS.unsupported }));
      if (S.estado === 'conectado' || S.estado === 'gravando') return Promise.resolve(informacoes());
      if (S.estado === 'conectando') return Promise.reject(Object.assign(new Error('Já estou conectando.'), { mensagem: 'Já estou conectando.' }));

      let conexao;
      try {
        if (!S.conexao) {
          conexao = criarConexao();
          S.conexao = conexao;
          conexao.addEventListener('status', (ev) => aplicarStatus(ev && ev.status));
          conexao.addEventListener('serialdata', (ev) => {
            const texto = ev && typeof ev.data === 'string' ? ev.data : '';
            if (texto) emitir('texto', texto);
          });
          conexao.addEventListener('backgrounderror', (ev) => {
            const e = ev && ev.error;
            emitir('erro', mensagemDeErro(e, 'Erro em segundo plano'));
          });
        } else conexao = S.conexao;
      } catch (e) {
        const msg = mensagemDeErro(e);
        return Promise.reject(Object.assign(new Error(msg), { code: e && e.code, mensagem: msg }));
      }

      definirEstado('conectando');
      /* connect() é a PRIMEIRA chamada assíncrona: dentro dela vai o requestDevice. */
      return conexao.connect().then(() => {
        definirEstado('conectado');
        return informacoes();
      }, (e) => {
        definirEstado('desconectado');
        const msg = mensagemDeErro(e, 'Não foi possível conectar');
        S.ultimoErro = msg;
        throw Object.assign(new Error(msg), { code: e && e.code, mensagem: msg, cancelou: !!(e && (e.code === 'no-device-selected' || e.code === 'aborted')) });
      });
    }

    function informacoes() {
      const c = S.conexao;
      let versao = null;
      try { versao = c && c.getBoardVersion ? c.getBoardVersion() : null; } catch (e) { /* ainda sem placa */ }
      return { versao, v2: versao === 'V2' };
    }

    async function desconectar() {
      const c = S.conexao;
      if (!c) return;
      await naFila(async () => {
        try { await c.disconnect(); } catch (e) { /* já caiu */ }
      });
      definirEstado('desconectado');
    }

    /* Solta a USB de vez (troca de placa na IDE). */
    async function liberar() {
      const c = S.conexao;
      if (!c) { definirEstado('desconectado'); return; }
      try { await desconectar(); } catch (e) { /* segue */ }
      try { if (c.dispose) c.dispose(); } catch (e) { /* segue */ }
      S.conexao = null;
      definirEstado('desconectado');
    }

    /* ------------------------------------------------------------
     * Gravar (partial flashing)
     * hex: texto Intel Hex (V2) ou função (versaoDaPlaca) => hex.
     * progresso(fracao 0..1, etapa)
     * → { ok: true } | { ok: false, erro: 'mensagem' }
     * Nunca lança: o que der errado vira mensagem.
     * ---------------------------------------------------------- */
    function gravar(hex, progresso) {
      return naFila(async () => {
        const c = S.conexao;
        if (!c || (S.estado !== 'conectado')) {
          return { ok: false, erro: MENSAGENS['not-connected'] };
        }
        if (typeof c.flash !== 'function') return { ok: false, erro: 'Esta conexão não sabe gravar.' };
        S.gravando = true;
        definirEstado('gravando');
        try {
          const fonte = typeof hex === 'function' ? hex : async () => hex;
          await c.flash(async (versao) => {
            if (versao && versao !== 'V2') throw Object.assign(new Error('Só a micro:bit V2 é suportada.'), { code: 'connection-error', mensagem: 'Esta placa é a micro:bit V1. A IDE só suporta a V2.' });
            return fonte(versao);
          }, {
            partial: true,
            progress: (etapa, valor) => {
              if (!progresso) return;
              let f = typeof valor === 'number' ? valor : 0;
              if (f > 1) f = f / 100;
              try { progresso(Math.max(0, Math.min(1, f)), etapa); } catch (e) { /* ignora */ }
            },
          });
          S.gravando = false;
          definirEstado('conectado');
          return { ok: true };
        } catch (e) {
          S.gravando = false;
          /* se a placa saiu no meio, a biblioteca já avisou "Disconnected" */
          let estadoFinal = 'conectado';
          try { if (c.status && c.status !== 'Connected') estadoFinal = 'desconectado'; } catch (_) { /* ok */ }
          if (e && e.code === 'device-disconnected') estadoFinal = 'desconectado';
          definirEstado(estadoFinal);
          if (estadoFinal === 'desconectado') emitir('desconectou', null);
          return { ok: false, erro: (e && e.mensagem) || mensagemDeErro(e, 'A gravação falhou'), codigo: e && e.code };
        }
      });
    }

    /* ------------------------------------------------------------
     * Monitor Serial: enviar texto à placa (fila única)
     * ---------------------------------------------------------- */
    function escrever(texto) {
      return naFila(async () => {
        const c = S.conexao;
        if (!c || S.estado !== 'conectado') return { ok: false, erro: MENSAGENS['not-connected'] };
        try {
          await c.serialWrite(String(texto));
          return { ok: true };
        } catch (e) {
          return { ok: false, erro: mensagemDeErro(e, 'Não consegui enviar') };
        }
      });
    }


    return {
      ESTADOS, configurar, suportado, on, conectar, desconectar, liberar, gravar, escrever,
      criarBufferLinhas, mensagemDeErro,
      get estado() { return S.estado; },
      get conectado() { return S.estado === 'conectado' || S.estado === 'gravando'; },
      get info() { return informacoes(); },
      MENSAGENS,
    };
  }

  const padrao = criar();
  padrao.criar = criar;
  return padrao;
});
