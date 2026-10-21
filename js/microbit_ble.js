/* ============================================================
 * microbit_ble.js — MIDE EDU, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Bluetooth (Web Bluetooth, Chrome/Edge) com a micro:bit, só para
 * PROGRAMAS JAVASCRIPT (MakeCode) que já estão gravados na placa:
 *   - Monitor sem fio: serviço UART  → evento 'texto'
 *   - Painel ao vivo: acelerômetro, botões A/B, bússola e temperatura
 *     → evento 'dados'  ({ tipo, ... })
 * GRAVAR por Bluetooth (EXPERIMENTAL): gravar(hex) usa flash() da biblioteca,
 * o mesmo serviço de gravação parcial que o app do celular usa (placa em modo
 * de pareamento). No navegador só a gravação PARCIAL é possível (troca o código
 * do usuário quando o runtime é o mesmo); a completa exige reconectar a um
 * dispositivo novo e vira o aviso “use o cabo USB”.
 *
 * Usa @microbit/microbit-connection 1.0.0 (MIT), vendorizado em
 * js/vendor/microbit/microbit-connection.js (global MicrobitConnection).
 *
 * REGRAS (plano-microbit-v2 §5 e §11):
 *  - navigator.bluetooth.requestDevice tem de ser a PRIMEIRA coisa depois
 *    do clique: conectar() chama a biblioteca sem nenhum await antes.
 *  - Só a trilha JavaScript: quem chama decide (a IDE desabilita o botão
 *    no MicroPython, que não tem serviço UART Bluetooth).
 *  - Um envio por vez (fila) e em pedaços de até 20 bytes (limite do UART).
 *  - Serviço que a placa não tem: o evento simplesmente não chega; a
 *    interface mostra “sem dados” em vez de inventar valores.
 *
 * Funciona no navegador (global MicrobitBLE) e no Node (testes em
 * ferramentas/testar_mb_ble.mjs, com uma conexão falsa).
 * ============================================================ */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.MicrobitBLE = api;
})(typeof self !== 'undefined' ? self : globalThis, function (raiz) {
  'use strict';

  const TAMANHO_PEDACO = 20;   // o serviço UART da micro:bit aceita 20 bytes por escrita

  function criar(opcoesIniciais) {
    const cfg = Object.assign({
      biblioteca: null,   // no navegador: window.MicrobitConnection
      fabricaBLE: null,   // (opcoes) => conexão; nos testes, uma conexão falsa
    }, opcoesIniciais || {});

    const S = {
      conexao: null,
      estado: 'desconectado',   // desconectado | conectando | conectado
      ouvintes: { estado: [], texto: [], dados: [], erro: [], desconectou: [] },
      fila: Promise.resolve(),
      decodificador: null,
      recebeu: { acelerometro: false, botoes: false, bussola: false, temperatura: false, uart: false },
      ultimoErro: '',
      bussolaOcupada: false,
      gravando: false,
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
      if (cfg.fabricaBLE) return true;
      const lib = biblioteca();
      return !!(raiz.navigator && raiz.navigator.bluetooth && lib && lib.createBluetoothConnection);
    }

    const MENSAGENS = {
      unsupported: 'Este navegador não tem Web Bluetooth. Use o Google Chrome ou o Microsoft Edge.',
      'no-device-selected': 'Nenhuma micro:bit foi escolhida na janela. Coloque a placa em modo de pareamento (A + B + reset até aparecer “PAIRING MODE!”), confirme que o programa Bluetooth está gravado e que o celular não está conectado a ela, e tente de novo.',
      aborted: 'A operação foi cancelada.',
      disabled: 'O Bluetooth do computador está desligado. Ligue o Bluetooth e tente de novo.',
      'permission-denied': 'O navegador não deixou usar o Bluetooth. Permita o acesso e tente de novo.',
      'location-disabled': 'O Windows pede a localização ligada para procurar aparelhos Bluetooth.',
      'not-connected': 'A micro:bit não está conectada por Bluetooth.',
      'device-disconnected': 'A micro:bit saiu do alcance ou foi desligada.',
      timeout: 'A micro:bit demorou demais para responder. Confira se o programa Bluetooth está gravado e chegue mais perto.',
      'connection-error': 'Não consegui falar com a micro:bit por Bluetooth. Confira se ela está com o programa Bluetooth gravado (por USB) e no modo de pareamento.',
      'pairing-information-lost': 'O computador esqueceu o pareamento. Remova a micro:bit nas configurações de Bluetooth do Windows e pareie de novo.',
      'device-in-use': 'Outra janela está usando a micro:bit. Feche-a e tente de novo.',
      'precisa-usb': 'Esta gravação exige o modo completo, que o navegador não faz por Bluetooth. Grave esta vez pelo cabo USB (com “Incluir em todo envio” ligado, os próximos envios por Bluetooth costumam funcionar).',
      'pareamento-necessario': 'A micro:bit recusou a gravação. Coloque-a em modo de pareamento (A + B + reset até “PAIRING MODE!”), remova pareamentos antigos dela nas configurações de Bluetooth do Windows e tente de novo.',
      'firmware-update-required': 'A micro:bit precisa de uma atualização de firmware.',
    };

    function mensagemDeErro(e, padrao) {
      if (!e) return padrao || 'Erro desconhecido.';
      if (e.mensagem) return e.mensagem;
      if (e.code && MENSAGENS[e.code]) return MENSAGENS[e.code];
      /* Uma escrita ou leitura de serviço que a placa não tem. */
      if (/no (matching )?service|service not found|not found/i.test(String(e.message || ''))) {
        return 'O programa da micro:bit não liga esse serviço Bluetooth. Use o bloco “Bluetooth: iniciar serviço UART” ou “iniciar painel ao vivo” e grave de novo.';
      }
      return (padrao ? padrao + ': ' : '') + (e.message || String(e));
    }

    function definirEstado(novo) {
      if (S.estado === novo) return;
      S.estado = novo;
      emitir('estado', novo);
    }

    function aplicarStatus(status) {
      /* status da biblioteca: Connected | Disconnected | Connecting | NoAuthorizedDevice | Paused */
      if (status === 'Connected') { definirEstado('conectado'); return; }
      if (status === 'Connecting') { definirEstado('conectando'); return; }
      if (status === 'Disconnected' || status === 'NoAuthorizedDevice') {
        const estavaConectado = S.estado === 'conectado';
        definirEstado('desconectado');
        if (estavaConectado && !S.gravando) emitir('desconectou', null);
      }
    }

    function zerarRecebidos() {
      for (const k of Object.keys(S.recebeu)) S.recebeu[k] = false;
    }

    /* ------------------------------------------------------------
     * Eventos da placa → 'texto' e 'dados'
     * ---------------------------------------------------------- */
    function decodificar(bytes) {
      if (!S.decodificador) {
        const TD = raiz.TextDecoder;
        if (!TD) return String.fromCharCode.apply(null, Array.from(bytes));
        S.decodificador = new TD('utf-8');
      }
      /* stream: um caractere UTF-8 partido entre dois pacotes BLE fica esperando o resto */
      return S.decodificador.decode(bytes, { stream: true });
    }

    function ligarEventos(conexao) {
      conexao.addEventListener('status', (ev) => aplicarStatus(ev && ev.status));
      conexao.addEventListener('backgrounderror', (ev) => {
        const e = ev && ev.error;
        emitir('erro', mensagemDeErro(e, 'Erro em segundo plano'));
      });
      conexao.addEventListener('uartdata', (ev) => {
        const v = ev && ev.value;
        if (!v || !v.length) return;
        S.recebeu.uart = true;
        const texto = decodificar(v);
        if (texto) emitir('texto', texto);
      });
      conexao.addEventListener('accelerometerdatachanged', (ev) => {
        if (!ev) return;
        S.recebeu.acelerometro = true;
        emitir('dados', { tipo: 'acelerometro', x: ev.x, y: ev.y, z: ev.z });
      });
      const botao = (ev) => {
        if (!ev) return;
        S.recebeu.botoes = true;
        /* estado: 0 solto, 1 aperto curto, 2 aperto longo */
        emitir('dados', { tipo: 'botao', botao: ev.button, estado: ev.state, apertado: ev.state !== 0 });
      };
      conexao.addEventListener('buttonachanged', botao);
      conexao.addEventListener('buttonbchanged', botao);
      conexao.addEventListener('magnetometerdatachanged', (ev) => {
        if (!ev) return;
        S.recebeu.bussola = true;
        const dado = { tipo: 'bussola', x: ev.x, y: ev.y, z: ev.z, graus: null };
        /* o rumo (0–359°) vem calculado pela própria placa; pedimos um por vez para não engarrafar o BLE */
        if (typeof conexao.getMagnetometerBearing === 'function' && !S.bussolaOcupada) {
          S.bussolaOcupada = true;
          Promise.resolve().then(() => conexao.getMagnetometerBearing()).then((g) => {
            dado.graus = typeof g === 'number' ? g : null;
          }, () => { /* sem rumo: o painel mostra só o campo magnético */ }).then(() => {
            S.bussolaOcupada = false;
            emitir('dados', dado);
          });
        } else emitir('dados', dado);
      });
      conexao.addEventListener('temperaturechanged', (ev) => {
        if (!ev) return;
        S.recebeu.temperatura = true;
        emitir('dados', { tipo: 'temperatura', celsius: ev.celsius });
      });
    }

    /* ------------------------------------------------------------
     * Conectar / desconectar
     * ---------------------------------------------------------- */
    function criarConexao() {
      if (cfg.fabricaBLE) return cfg.fabricaBLE({});
      const lib = biblioteca();
      if (!lib || !lib.createBluetoothConnection) throw Object.assign(new Error('biblioteca ausente'), { code: 'unsupported' });
      return lib.createBluetoothConnection({});
    }

    /* IMPORTANTE: chamar direto do clique; sem await antes. */
    function conectar() {
      if (!suportado()) return Promise.reject(Object.assign(new Error(MENSAGENS.unsupported), { code: 'unsupported', mensagem: MENSAGENS.unsupported }));
      if (S.estado === 'conectado') return Promise.resolve({ ok: true });
      if (S.estado === 'conectando') return Promise.reject(Object.assign(new Error('Já estou conectando.'), { mensagem: 'Já estou conectando.' }));

      let conexao;
      try {
        if (!S.conexao) {
          conexao = criarConexao();
          S.conexao = conexao;
          ligarEventos(conexao);
        } else conexao = S.conexao;
      } catch (e) {
        const msg = mensagemDeErro(e);
        return Promise.reject(Object.assign(new Error(msg), { code: e && e.code, mensagem: msg }));
      }

      S.decodificador = null;
      zerarRecebidos();
      definirEstado('conectando');
      /* connect() é a PRIMEIRA chamada assíncrona: dentro dela vai o requestDevice. */
      return conexao.connect({ bondMode: 'application' }).then(() => {
        definirEstado('conectado');
        return { ok: true };
      }, (e) => {
        definirEstado('desconectado');
        const msg = mensagemDeErro(e, 'Não foi possível conectar');
        S.ultimoErro = msg;
        throw Object.assign(new Error(msg), { code: e && e.code, mensagem: msg, cancelou: !!(e && (e.code === 'no-device-selected' || e.code === 'aborted')) });
      });
    }

    async function desconectar() {
      const c = S.conexao;
      if (!c) { definirEstado('desconectado'); return; }
      await naFila(async () => {
        try { await c.disconnect(); } catch (e) { /* já caiu */ }
      });
      definirEstado('desconectado');
    }

    /* Solta o Bluetooth de vez (troca de placa na IDE). */
    async function liberar() {
      const c = S.conexao;
      if (!c) { definirEstado('desconectado'); return; }
      try { await desconectar(); } catch (e) { /* segue */ }
      try { if (c.dispose) c.dispose(); } catch (e) { /* segue */ }
      S.conexao = null;
      definirEstado('desconectado');
    }

    /* ------------------------------------------------------------
     * Fila única: nada de duas escritas ao mesmo tempo
     * ---------------------------------------------------------- */
    function naFila(tarefa) {
      const proxima = S.fila.then(tarefa, tarefa);
      S.fila = proxima.then(() => undefined, () => undefined);
      return proxima;
    }

    /* ------------------------------------------------------------
     * Enviar texto à placa pelo UART, em pedaços de 20 bytes.
     * → { ok: true } | { ok: false, erro }
     * ---------------------------------------------------------- */
    function escrever(texto) {
      return naFila(async () => {
        const c = S.conexao;
        if (!c || S.estado !== 'conectado') return { ok: false, erro: MENSAGENS['not-connected'] };
        const TE = raiz.TextEncoder;
        const bytes = TE ? new TE().encode(String(texto)) : Uint8Array.from(String(texto), (ch) => ch.charCodeAt(0) & 255);
        try {
          for (let i = 0; i < bytes.length; i += TAMANHO_PEDACO) {
            await c.uartWrite(bytes.slice(i, i + TAMANHO_PEDACO));
          }
          return { ok: true };
        } catch (e) {
          return { ok: false, erro: mensagemDeErro(e, 'Não consegui enviar') };
        }
      });
    }

    /* ------------------------------------------------------------
     * Gravar por Bluetooth (experimental). hex: texto Intel HEX da V2 (JavaScript).
     * aoProgredir({ etapa, texto, fracao }) — fracao de 0 a 1 ou null.
     * IMPORTANTE: chamar direto do clique (abre a janela do Chrome): nada de await antes.
     * → { ok: true } | rejeita com { mensagem, precisaUsb, cancelou }
     * ---------------------------------------------------------- */
    const ETAPAS = {
      Initializing: 'Preparando o Bluetooth…', FindingDevice: 'Procurando a micro:bit…',
      CheckingBond: 'Conferindo o pareamento…', ResettingDevice: 'Reiniciando a micro:bit…',
      Connecting: 'Conectando…', PartialFlashing: 'Enviando o programa por Bluetooth…',
      FullFlashing: 'Gravação completa por Bluetooth…',
    };

    function gravar(hex, aoProgredir) {
      const falha = (code, msg, extra) => Promise.reject(Object.assign(new Error(msg), { code, mensagem: msg }, extra || {}));
      if (!suportado()) return falha('unsupported', MENSAGENS.unsupported);
      if (S.estado === 'conectando' || S.gravando) return falha('ocupado', 'Já estou conectando ou gravando.');
      if (typeof hex !== 'string' || !hex) return falha('sem-hex', 'Não há programa para enviar.');

      let conexao;
      try {
        if (!S.conexao) { conexao = criarConexao(); S.conexao = conexao; ligarEventos(conexao); } else conexao = S.conexao;
      } catch (e) { return falha(e && e.code, mensagemDeErro(e)); }
      if (typeof conexao.flash !== 'function') return falha('sem-flash', 'Esta versão da biblioteca não grava por Bluetooth.');

      S.gravando = true;
      S.decodificador = null;
      zerarRecebidos();
      let viuCompleta = false;
      const progresso = (etapa, fracao) => {
        if (etapa === 'FullFlashing') viuCompleta = true;
        if (typeof aoProgredir === 'function') {
          try { aoProgredir({ etapa, texto: ETAPAS[etapa] || String(etapa), fracao: typeof fracao === 'number' ? fracao : null }); } catch (e) { /* segue */ }
        }
      };
      /* flash() conecta sozinho (abre a janela do Chrome) quando ainda não há conexão */
      return conexao.flash(async () => hex, { progress: progresso }).then(() => ({ ok: true }), (e) => {
        const texto = String((e && e.message) || '');
        let msg, extra = {};
        if (e && (e.code === 'no-device-selected' || e.code === 'aborted')) {
          msg = mensagemDeErro(e); extra.cancelou = true;
        } else if (viuCompleta) {
          msg = MENSAGENS['precisa-usb']; extra.precisaUsb = true;
        } else if (/insufficient|encryption|authentication|pairing/i.test(texto)) {
          msg = MENSAGENS['pareamento-necessario'];
        } else msg = mensagemDeErro(e, 'Não foi possível gravar por Bluetooth');
        S.ultimoErro = msg;
        throw Object.assign(new Error(msg), { code: e && e.code, mensagem: msg }, extra);
      }).finally(() => {
        S.gravando = false;
        /* depois da gravação a placa reinicia: o Bluetooth fica desconectado */
        if (S.estado !== 'desconectado') definirEstado('desconectado');
      });
    }

    /* Pede a calibração da bússola (a placa mostra o jogo de encher a tela). */
    function calibrarBussola() {
      return naFila(async () => {
        const c = S.conexao;
        if (!c || S.estado !== 'conectado') return { ok: false, erro: MENSAGENS['not-connected'] };
        try { await c.triggerMagnetometerCalibration(); return { ok: true }; }
        catch (e) { return { ok: false, erro: mensagemDeErro(e, 'Não consegui pedir a calibração') }; }
      });
    }

    return {
      suportado, configurar, on, conectar, desconectar, liberar, escrever, calibrarBussola, gravar, mensagemDeErro,
      get estado() { return S.estado; },
      get conectado() { return S.estado === 'conectado'; },
      get gravando() { return S.gravando; },
      get recebeu() { return Object.assign({}, S.recebeu); },
      get ultimoErro() { return S.ultimoErro; },
      MENSAGENS, TAMANHO_PEDACO,
    };
  }

  const padrao = criar();
  padrao.criar = criar;
  return padrao;
});
