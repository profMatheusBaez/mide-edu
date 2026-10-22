/* ============================================================
 * mide_web.js — MIDE EDU sem servidor (só o navegador)
 * ------------------------------------------------------------
 * Quando a IDE é aberta de um site (ou do arquivo index.html),
 * não existe o servidor.py com o arduino-cli. Este arquivo põe no
 * lugar da função api() um "servidor de mentira" que faz tudo no
 * navegador, com as mesmas respostas que a IDE já espera:
 *
 *   /api/compilar  -> missão conhecida: binário pronto (avr-gcc);
 *                     outro código: MideCompilador (bytecode da MIDE VM)
 *   /api/gravar    -> grava na placa pela USB com Web Serial,
 *                     falando o protocolo do bootloader do Uno (STK500)
 *   /api/monitor   -> Monitor Serial pela Web Serial
 *   /api/portas    -> portas USB que o aluno já autorizou
 *
 * Arduino Uno (ATmega328P + optiboot). A UNIHIKER K10 em MicroPython
 * usa a mesma Web Serial, mas pelo REPL (k10_mp.js / k10_web.js).
 * Precisa de Chrome ou Edge no computador (Web Serial).
 * ============================================================ */
'use strict';

const MIDE_WEB = (() => {
  const p = new URLSearchParams(location.search);
  if (p.get('web') === '1') return true;
  if (p.get('web') === '0') return false;
  return !['127.0.0.1', 'localhost'].includes(location.hostname) || location.protocol === 'file:';
})();

if (MIDE_WEB) (function () {
  const TEM_SERIAL = 'serial' in navigator;
  const PROG_ADDR = 0x4000;
  const BOOT_ADDR = 0x7E00;
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------------- utilidades ---------------- */
  const deBase64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  function imagemVazia() { return new Uint8Array(BOOT_ADDR).fill(0xFF); }

  function paraHex(img, trechos) {
    const linhas = [];
    const hx = (n, d) => n.toString(16).toUpperCase().padStart(d, '0');
    for (const [ini, fim] of trechos) {
      for (let a = ini; a < fim; a += 16) {
        const n = Math.min(16, fim - a);
        let soma = n + (a >> 8) + (a & 0xFF);
        let dados = '';
        for (let i = 0; i < n; i++) { dados += hx(img[a + i], 2); soma += img[a + i]; }
        linhas.push(':' + hx(n, 2) + hx(a, 4) + '00' + dados + hx((-soma) & 0xFF, 2));
      }
    }
    linhas.push(':00000001FF');
    return linhas.join('\n') + '\n';
  }

  /* ---------------- compilação ---------------- */
  function compilarWeb(codigo) {
    const h = MideCompilador.hash(MideCompilador.normalizar(codigo));
    const pronto = (typeof MIDE_FASES_BIN !== 'undefined') && MIDE_FASES_BIN[h];
    if (pronto) {
      const bin = deBase64(pronto.base64);
      const img = imagemVazia(); img.set(bin, 0);
      return {
        ok: true, img, trechos: [[0, bin.length]], tipo: 'nativo',
        log: `Código da missão reconhecido: usando o programa já compilado (${bin.length} bytes de ${32256}).`,
      };
    }
    const r = MideCompilador.compilar(codigo);
    if (!r.ok) {
      const e = r.erros[0];
      return { ok: false, log: `sketch.ino:${e.linha}: erro: ${e.msg}`, linha: e.linha };
    }
    const fw = deBase64(MIDE_VM_FIRMWARE.base64);
    const img = imagemVazia();
    img.set(fw, 0);
    img.set(r.bytes, PROG_ADDR);
    return {
      ok: true, img, tipo: 'vm',
      trechos: [[0, fw.length, 'firmware'], [PROG_ADDR, PROG_ADDR + Math.ceil(r.bytes.length / 128) * 128]],
      log: `Programa traduzido para a MIDE VM: ${r.bytes.length} bytes de ${BOOT_ADDR - PROG_ADDR}; ` +
           `variáveis globais: ${r.info.globais} de ${r.info.memoria - 24} posições.`,
    };
  }

  const { Conexao, gravarImagem } = MideSerial;
  const PROGRESSO = MideSerial.PROGRESSO;
  const marcar = MideSerial.marcar;

  /* ---------------- portas ---------------- */
  const NOMES_USB = { 0x2341: 'Arduino', 0x2A03: 'Arduino', 0x1A86: 'Arduino (clone CH340)',
    0x0403: 'Arduino (clone FTDI)', 0x10C4: 'Arduino (clone CP2102)' };
  let PORTAS = [];   // [{rotulo, porta}]
  async function atualizarPortas() {
    if (!TEM_SERIAL) { PORTAS = []; return PORTAS; }
    const lista = await navigator.serial.getPorts();
    PORTAS = lista.map((porta, i) => {
      const info = porta.getInfo ? porta.getInfo() : {};
      const nome = NOMES_USB[info.usbVendorId] || 'Placa USB';
      return { rotulo: `USB ${i + 1}`, placa: nome, porta };
    });
    return PORTAS;
  }
  const portaPorRotulo = (r) => (PORTAS.find((p) => p.rotulo === r) || {}).porta;
  if (TEM_SERIAL) {
    navigator.serial.addEventListener('connect', () => { if (typeof listarPortas === 'function') listarPortas(); });
    navigator.serial.addEventListener('disconnect', () => { if (typeof listarPortas === 'function') listarPortas(); });
  }

  /* Pede ao navegador para escolher a placa (precisa vir de um clique). */
  function pedirPorta() {
    if (!TEM_SERIAL) { avisoSemSerial(); return Promise.resolve(null); }
    return navigator.serial.requestPort({}).then(async (porta) => {
      await atualizarPortas();
      const achada = PORTAS.find((p) => p.porta === porta);
      if (typeof listarPortas === 'function') await listarPortas();
      if (achada) { $('#porta').value = achada.rotulo; aoTrocarPorta(); }
      return achada;
    }).catch(() => null);
  }

  function avisoSemSerial() {
    log('Este navegador não grava em placas pela USB. Abra a MIDE EDU no Google Chrome ou no Microsoft Edge (computador).', 'erro');
  }

  /* ---------------- Monitor Serial ---------------- */
  const MONW = { con: null, porta: '', baud: 9600, linhas: [], total: 0, parcial: '', erro: '', dec: null };
  const estadoMon = () => ({ aberto: !!MONW.con, porta: MONW.porta, baud: MONW.baud, erro: MONW.erro });
  async function abrirMonitor(rotulo, baud) {
    await fecharMonitor();
    const porta = portaPorRotulo(rotulo);
    if (!porta) { MONW.erro = 'porta não encontrada'; return false; }
    const c = new Conexao(porta);
    MONW.dec = new TextDecoder('utf-8');
    c.aoDados = (bytes) => {
      MONW.parcial += MONW.dec.decode(bytes, { stream: true });
      const partes = MONW.parcial.split(/\r?\n/);
      MONW.parcial = partes.pop();
      for (const l of partes) guardarLinha(l);
      if (MONW.parcial.length > 300) { guardarLinha(MONW.parcial); MONW.parcial = ''; }
    };
    try { await c.abrir(baud); } catch (e) {
      MONW.erro = 'A porta está ocupada (outro programa ou outra aba usando a placa?)';
      return false;
    }
    MONW.con = c; MONW.porta = rotulo; MONW.baud = baud; MONW.erro = '';
    MONW.linhas = []; MONW.parcial = '';   // o total continua contando: a IDE pede ?desde=N
    return true;
  }
  function guardarLinha(l) {
    MONW.linhas.push(l.replace(/\r/g, ''));
    MONW.total++;
    if (MONW.linhas.length > 3000) MONW.linhas.shift();
  }
  async function fecharMonitor() {
    if (!MONW.con) return;
    const c = MONW.con; MONW.con = null;
    await c.fechar();
  }

  /* ---------------- api() no lugar do servidor ---------------- */
  async function apiWeb(rota, corpo) {
    const [caminho, qs] = rota.split('?');
    const q = new URLSearchParams(qs || '');
    corpo = corpo || null;
    switch (caminho) {
      case '/api/status':
        return {
          ok: true, versao_ide: VERSAO_IDE, arduino_cli: true, versao: 'web', caminho: '',
          fqbn: 'arduino:avr:uno', placas: [{ fqbn: 'arduino:avr:uno', nome: 'Arduino Uno' }],
          monitor: estadoMon(), micropython: false,
        };
      case '/api/portas':
        await atualizarPortas();
        return { portas: PORTAS.map((p) => ({ porta: p.rotulo, placa: p.placa, fqbn: '' })) };
      case '/api/progresso':
        return { fase: PROGRESSO.fase, porta: PROGRESSO.porta, segundos: PROGRESSO.desde ? (Date.now() - PROGRESSO.desde) / 1000 : 0 };
      case '/api/compilar': {
        marcar('compilando');
        await dormir(150);
        const r = compilarWeb(corpo.codigo || '');
        marcar(r.ok ? 'pronto' : 'erro');
        return { ok: r.ok, log: r.ok ? r.log + '\nCompilação concluída.' : r.log };
      }
      case '/api/gravar': {
        if (!TEM_SERIAL) { avisoSemSerial(); return { ok: false, log: 'Navegador sem Web Serial.' }; }
        marcar('compilando', corpo.porta);
        const r = compilarWeb(corpo.codigo || '');
        if (!r.ok) { marcar('erro'); return { ok: false, log: r.log }; }
        const porta = portaPorRotulo(corpo.porta);
        if (!porta) { marcar('erro'); return { ok: false, log: 'Gravando pela USB: a placa escolhida não está mais conectada. Clique em "Conectar o Arduino" e escolha de novo.' }; }
        const reabrir = MONW.con ? { porta: MONW.porta, baud: MONW.baud } : null;
        if (reabrir) await fecharMonitor();
        const linhas = [r.log, '', `Gravando pela USB em ${corpo.porta} (navegador, bootloader do Uno)…`];
        marcar('gravando', corpo.porta);
        try {
          const res = await gravarImagem(porta, r.img, r.trechos, (m) => linhas.push(m));
          linhas.push(`${res.escritas} página(s) gravada(s) e conferida(s), ${res.iguais} já estavam iguais.`);
          linhas.push('Upload concluído.');
          marcar('pronto', corpo.porta);
          if (reabrir) { await dormir(1200); await abrirMonitor(reabrir.porta, reabrir.baud); }
          return { ok: true, log: linhas.join('\n'), monitor_reaberto: !!reabrir };
        } catch (e) {
          linhas.push('Erro: ' + e.message);
          marcar('erro', corpo.porta);
          if (reabrir) await abrirMonitor(reabrir.porta, reabrir.baud);
          return { ok: false, log: linhas.join('\n') };
        }
      }
      case '/api/exportar': {
        const r = compilarWeb(corpo.codigo || '');
        if (!r.ok) return { ok: false, log: r.log };
        return { ok: true, arquivo: (corpo.nome || 'sketch') + '.ino.hex', conteudo: paraHex(r.img, r.trechos) };
      }
      case '/api/monitor': {
        if (!corpo) {
          const desde = +(q.get('desde') || 0);
          const primeiro = MONW.total - MONW.linhas.length;
          const ini = Math.max(desde, primeiro) - primeiro;
          return { linhas: MONW.linhas.slice(ini), proximo: MONW.total, estado: estadoMon() };
        }
        if (corpo.acao === 'abrir') { const ok = await abrirMonitor(corpo.porta, corpo.baud || 9600); return { ok, estado: estadoMon() }; }
        if (corpo.acao === 'fechar') { await fecharMonitor(); return { ok: true, estado: estadoMon() }; }
        if (corpo.acao === 'enviar') {
          if (!MONW.con) return { ok: false };
          const fim = { nl: '\n', cr: '\r', nlcr: '\r\n', nada: '' }[corpo.final];
          await MONW.con.escrever(new TextEncoder().encode((corpo.texto || '') + (fim === undefined ? '\n' : fim)));
          return { ok: true };
        }
        return { ok: false };
      }
      case '/api/libs':
        if (!corpo) return { libs: [{ nome: 'Servo', versao: 'incluída' }, { nome: 'LiquidCrystal_I2C', versao: 'incluída' }, { nome: 'Wire', versao: 'incluída' }] };
        return { ok: false, achados: [], log: 'Na MIDE EDU web não dá para instalar bibliotecas: Servo, Wire e LiquidCrystal_I2C já vêm incluídas.' };
      case '/api/cores':
        if (!corpo) return { cores: [{ id: 'arduino:avr', nome: 'Arduino Uno (navegador)', versao: 'web' }] };
        return { ok: false, achados: [], log: 'Na MIDE EDU web só o Arduino Uno está disponível.' };
      case '/api/info':
        return { ok: true, log: 'Arduino Uno — ATmega328P, 16 MHz, 32 KB de flash (0,5 KB do bootloader), 2 KB de RAM.\nGravação pela USB direto do navegador (Web Serial).' };
      case '/api/encerrar':
        return { ok: true };
      case '/api/micropython':
        return { ok: false, log: 'Na MIDE EDU web a K10 é programada pela USB do navegador: abra no Google Chrome ou no Microsoft Edge.' };
    }
    return { ok: false, log: 'Esta função não existe na MIDE EDU web.' };
  }

  /* Troca as funções da IDE (os scripts anteriores já foram carregados). */
  window.api = apiWeb;

  const checarOriginal = window.checarServidor;
  window.checarServidor = async function () {
    await checarOriginal();
    estado.servidorOk = true;
    $('#st-servidor').textContent = TEM_SERIAL ? 'gravação pelo navegador (Web Serial)' : 'navegador sem Web Serial';
    if (!TEM_SERIAL) avisoSemSerial();
  };

  // Upload sem placa escolhida: abre a janela do navegador para escolher (o clique ainda vale).
  const gravarOriginal = window.gravar;
  window.gravar = function () {
    if (estado.placaCurso === 'uno' && !$('#porta').value && typeof podeGravar === 'function' && podeGravar()) {
      if (!TEM_SERIAL) { avisoSemSerial(); return; }
      log('Escolha o Arduino na janela do navegador.', 'info');
      return pedirPorta().then((p) => { if (p) return gravarOriginal(); });
    }
    return gravarOriginal();
  };

  // Sem placa autorizada ainda: a lista de portas convida a conectar.
  const listarOriginal = window.listarPortas;
  window.listarPortas = async function () {
    await listarOriginal();
    if (estado.placaCurso === 'uno' && !PORTAS.length) {
      const sel = $('#porta');
      sel.innerHTML = '<option value="">Conectar o Arduino (USB)…</option>';
      $('#st-porta').textContent = 'clique em "Conectar o Arduino" para escolher a placa';
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // clicar na lista de portas vazia abre a janela do navegador para escolher a placa
    const sel = document.getElementById('porta');
    if (sel) {
      sel.addEventListener('mousedown', (ev) => {
        if (estado.placaCurso !== 'uno' || PORTAS.length) return;
        ev.preventDefault();
        pedirPorta();
      });
    }
    // botão "procurar placas": no navegador ele abre a janela de escolha da porta USB
    const bt = document.getElementById('bt-portas');
    if (bt) {
      bt.title = 'Conectar o Arduino (USB)';
      bt.addEventListener('click', (ev) => {
        if (estado.placaCurso !== 'uno') return;
        ev.stopImmediatePropagation();
        pedirPorta();
      }, true);
    }
    // K10 no site: só MicroPython (o C++ do ESP32 precisa do arduino-cli do laboratório)
    const cpp = document.querySelector('[data-language="cpp"]');
    if (cpp) { cpp.disabled = true; cpp.textContent = 'C++ (só na MIDE do laboratório)'; cpp.title = 'No site não há compilador C++ para o ESP32 da K10. Use o INSTALAR.bat no laboratório.'; }
    const opCpp = document.querySelector('#curso-linguagem option[value="cpp"]');
    if (opCpp) { opCpp.disabled = true; opCpp.textContent = 'C++ (laboratório)'; }
    document.documentElement.classList.add('mide-web');
  });

  window.MIDE_WEB_INTERNO = { compilarWeb, gravarImagem, paraHex, Conexao, apiWeb, PROGRESSO };
})();
