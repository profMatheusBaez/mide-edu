/* ============================================================
 * k10_web.js — UNIHIKER K10 (MicroPython) pela USB do navegador
 * ------------------------------------------------------------
 * Liga o k10_mp.js (REPL do MicroPython pela Web Serial) e o
 * k10_firmware.js (instalar o MicroPython) à tela da IDE:
 *   - barra de cima: "Conectar K10" + estado + "Parar"
 *   - Verificar: sintaxe conferida aqui (mpy-cross, sem placa)
 *   - Enviar: grava o main.py e reinicia o MicroPython da placa
 *   - Monitor Serial: o print() da placa, sem servidor
 *   - Preparar K10: testar a conexão e instalar o firmware
 *
 * Vale no site (sem servidor) e no laboratório (servidor local):
 * assim a trilha MicroPython não precisa do mpremote. Sem Web
 * Serial (Firefox, Safari) e com o servidor local, a IDE volta ao
 * caminho antigo (/api/micropython, mpremote).
 * C++ na K10 continua só no laboratório (arduino-cli).
 * ============================================================ */
'use strict';

const K10W = { ativo: false, mp: null, imagem: null, validacao: null, instalando: false };

function k10TemSerial() { return typeof navigator !== 'undefined' && 'serial' in navigator; }
function k10NoSite() { return typeof MIDE_WEB !== 'undefined' && MIDE_WEB; }

/* A trilha MicroPython da K10 está usando a USB do navegador? */
function k10Navegador() {
  return estado.placaCurso === 'k10' && estado.linguagem === 'micropython' && (k10TemSerial() || k10NoSite());
}

function k10MP() {
  if (!K10W.mp && typeof K10MP !== 'undefined') {
    K10W.mp = K10MP.criar();
    K10W.mp.on('texto', (t) => { if (K10W.ativo) monitorReceberTexto(t); });
    K10W.mp.on('estado', () => { if (K10W.ativo) k10WebAtualizarUI(); });
    if (k10TemSerial()) {
      navigator.serial.addEventListener('connect', () => { if (K10W.ativo && !K10W.instalando) K10W.mp.reconectar().then(k10WebAtualizarUI); });
    }
  }
  return K10W.mp;
}

/* ------------------------------------------------------------
 * Entrar e sair da trilha
 * ---------------------------------------------------------- */
function k10WebAtivar(sim) {
  const era = K10W.ativo;
  K10W.ativo = !!sim;
  $('#k10-hub').hidden = !sim;
  document.body.classList.toggle('modo-k10mp', !!sim);
  if (sim) {
    $('#bt-mon-ligar').hidden = true;
    $('#mon-baud').hidden = true;
    $('#mon-texto').placeholder = 'texto para o input() da K10… (Enter envia)';
    if (typeof MON_LEGO !== 'undefined') MON_LEGO.buffer = null;
    if (typeof api === 'function') api('/api/monitor', { acao: 'fechar' }).catch(() => {});   // a porta é do navegador agora
    const mp = k10MP();
    if (mp) mp.reconectar().then(k10WebAtualizarUI).catch(() => {});
    k10WebAtualizarUI();
    if (!k10TemSerial()) log('Este navegador não grava pela USB. Para enviar programas à K10, abra a MIDE EDU no Google Chrome ou no Microsoft Edge (computador). Você ainda pode estudar e usar Verificar.', 'aviso');
  } else if (era) {
    if (estado.placaCurso !== 'lego' && estado.placaCurso !== 'microbit') {   // essas placas cuidam da própria barra
      $('#bt-mon-ligar').hidden = false;
      $('#mon-baud').hidden = false;
      $('#mon-texto').placeholder = '';
    }
    if (typeof MON_LEGO !== 'undefined') MON_LEGO.buffer = null;
    const mp = k10MP();
    if (mp) mp.liberar().catch(() => {});   // só uma conexão por vez: a porta volta a ficar livre
  }
}

function k10WebAtualizarUI() {
  if (!K10W.ativo) return;
  const mp = k10MP();
  const e = mp ? mp.estado : 'desconectado';
  const conectada = e !== 'desconectado';
  const chip = $('#k10-estado');
  const textos = {
    desconectado: k10TemSerial() ? 'Desconectada' : 'Sem USB neste navegador',
    conectado: 'K10 conectada · USB',
    enviando: 'Enviando…',
  };
  chip.textContent = K10W.instalando ? 'Instalando MicroPython…' : textos[e];
  chip.title = chip.textContent;
  chip.className = 'lego-chip' + (K10W.instalando || e === 'enviando' ? ' espera' : (conectada ? ' ligado' : ''));
  const bt = $('#bt-k10-conectar');
  bt.querySelector('span').textContent = conectada ? 'Desconectar' : 'Conectar K10';
  bt.disabled = estado.ocupado || K10W.instalando || !k10TemSerial() || e === 'enviando';
  bt.title = !k10TemSerial() ? 'Use o Google Chrome ou o Microsoft Edge para conectar a K10'
    : (conectada ? 'Soltar a porta USB da K10' : 'Conectar a UNIHIKER K10 pelo cabo USB-C');
  $('#bt-k10-parar').disabled = !conectada || e === 'enviando' || estado.ocupado;
  $('#st-porta').textContent = conectada ? 'UNIHIKER K10 · USB (MicroPython)' : 'K10 desconectada';
  $('#mon-estado').textContent = conectada ? 'K10 conectada · MicroPython' : 'K10 desconectada';
  $('#mon-estado').classList.toggle('ligado', conectada);
  $('#trac-estado').textContent = conectada ? 'recebendo o print() da K10' : 'conecte a K10 para receber dados';
  const up = $('#bt-upload');
  if (up) up.title = conectada ? 'Enviar para a K10 e executar (Ctrl+U)' : 'Enviar: na primeira vez o navegador pergunta qual é a K10';
}

/* ------------------------------------------------------------
 * Barra de cima
 * ---------------------------------------------------------- */
function k10WebBotaoConectar() {
  const mp = k10MP();
  if (!mp || estado.ocupado) return;
  if (mp.conectado) { mp.liberar().then(() => { escreverMonitor('— K10 desconectada —', 'sis'); k10WebAtualizarUI(); }); return; }
  mp.conectar().then((ok) => {
    if (ok) { escreverMonitor('— K10 conectada pela USB —', 'sis'); log('K10 conectada. O que ela escrever com print() aparece no Monitor Serial.', 'info'); }
    k10WebAtualizarUI();
  }).catch((e) => { mostrarPainelInf('saida'); log('✗ ' + e.message, 'erro'); k10WebAtualizarUI(); });
}

function k10WebParar() {
  const mp = k10MP();
  if (!mp || !mp.conectado) return;
  mp.parar().then(() => escreverMonitor('— programa parado (Ctrl+C) —', 'sis'));
}

async function k10WebStdin(texto, final) {
  const mp = k10MP();
  if (!mp || !mp.conectado) { escreverMonitor('Conecte a K10 antes de enviar.', 'sis'); return false; }
  const fim = { nl: '\n', cr: '\r', nlcr: '\r\n', nada: '' }[final];
  return mp.escrever(texto + (fim === undefined ? '\r\n' : fim));
}

/* ------------------------------------------------------------
 * Verificar e Enviar
 * ---------------------------------------------------------- */
async function k10VerificarLocal(codigo) {
  if (typeof PybricksMpy === 'undefined') return { ok: true, semChecagem: true };
  try {
    const r = await PybricksMpy.compilarPrograma(String(codigo));
    if (r.ok) return { ok: true };
    if (/^Não foi possível iniciar/.test((r.erros || [])[0] || '')) return { ok: true, semChecagem: true };
    return { ok: false, erros: r.erros || [], linha: r.linha };
  } catch (e) { return { ok: true, semChecagem: true }; }
}

function k10MostrarErroDeSintaxe(r) {
  mostrarPainelInf('saida');
  for (const e of (r.erros || []).slice(0, 6)) log('✗ ' + e, 'erro');
  if (!(r.erros || []).length) log('✗ O programa tem erro de escrita.', 'erro');
  if (r.linha && estado.aba === 'livre' && typeof legoMostrarLinhaComErro === 'function') legoMostrarLinhaComErro(r.linha);
}

async function k10WebExecutar(enviar) {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  const mp = k10MP();
  const codigo = codigoAtual();
  if (!codigo.trim()) { log('Escreva um programa antes de continuar.', 'aviso'); return; }

  if (enviar) {
    if (!k10TemSerial()) { mostrarPainelInf('saida'); log('Este navegador não grava pela USB. Use o Google Chrome ou o Microsoft Edge.', 'aviso'); return; }
    if (!mp.conectado) {
      /* a janela de escolha da porta precisa vir direto do clique: nada de await antes */
      let ok = false;
      try { ok = await mp.conectar(); } catch (e) { mostrarPainelInf('saida'); log('✗ ' + e.message, 'erro'); }
      k10WebAtualizarUI();
      if (!ok) { mostrarPainelInf('saida'); log('Escolha a K10 na janela do navegador para enviar. Ela aparece como “USB JTAG/serial debug unit” ou “ESP32-S3”.', 'aviso'); return; }
    }
  }

  ocupar(true);
  mostrarPainelInf('saida');
  barraIniciar(enviar ? 'gravar' : 'compilar');
  let ok = false, recado = '';
  try {
    const v = await k10VerificarLocal(codigo);
    if (!v.ok) { k10MostrarErroDeSintaxe(v); recado = 'O código tem erros — veja a Saída.'; return; }
    if (!enviar) {
      ok = true;
      log(v.semChecagem ? 'Não consegui conferir a sintaxe aqui; ela será conferida na K10 ao enviar.' : '✓ Sintaxe Python conferida. As bibliotecas da K10 são conferidas na placa, ao enviar.', v.semChecagem ? 'aviso' : 'ok');
      recado = 'Sintaxe conferida.';
      return;
    }
    $('#barra-acao').textContent = 'Enviando para a K10…';
    BARRA.teto = 0.97;
    BARRA.alvo = 0.05;
    const r = await mp.enviar(codigo, (pct, texto) => {
      BARRA.alvo = Math.min(0.97, pct / 100);
      if (texto) $('#barra-acao').textContent = texto;
    });
    logBloco(r.log, r.ok ? 'ok' : 'erro');
    if (!r.ok) {
      recado = 'O envio falhou — veja a Saída.';
      if (r.linha && estado.aba === 'livre' && typeof legoMostrarLinhaComErro === 'function') legoMostrarLinhaComErro(r.linha);
      if (r.semMicroPython) log('Para instalar o MicroPython na K10, clique em “Preparar K10” (barra do currículo).', 'info');
      return;
    }
    ok = true;
    recado = 'Programa enviado. Confira a K10.';
    escreverMonitor('— programa enviado —', 'sis');
    zerarTracador();
    if (/\bprint\(/.test(codigo)) mostrarPainelInf('monitor');
  } catch (e) {
    log('✗ ' + (e && e.message ? e.message : 'Não foi possível enviar o programa.'), 'erro');
    recado = 'Não foi possível enviar.';
  } finally {
    barraFinalizar(ok, recado);
    ocupar(false);
    k10WebAtualizarUI();
  }
  if (ok && enviar) {
    if (estado.aba === 'treino' && estado.treino?.idx >= estado.treino?.linhas.length) concluirFase();
    else if (estado.aba === 'completo') oferecerConfirmacaoK10();
  }
}

/* ------------------------------------------------------------
 * Preparar K10 (MicroPython): testar e instalar o firmware
 * ---------------------------------------------------------- */
function k10WebPreparar() {
  if (estado.ocupado) return;
  const html =
    '<p>Para programar em Python, a K10 precisa do <b>firmware MicroPython da UNIHIKER</b>. Basta instalar <b>uma vez</b> em cada placa. ' +
    'Se ela já tem MicroPython, use só <b>Testar conexão</b>.</p>' +
    '<div class="k10-notice"><b>Atenção:</b> instalar o firmware apaga tudo o que está na placa (o programa C++ de fábrica e os arquivos Python). Depois, para voltar ao C++, é só gravar um programa C++ no laboratório.</div>' +
    '<ol class="k10-passos">' +
      '<li id="k10-fw-passo1"><b>Firmware:</b> <span id="k10-fw-arquivo">procurando…</span>' +
        '<div class="k10-fw-acoes"><label class="k10-arquivo">Escolher o arquivo .bin…<input type="file" id="k10-fw-input" accept=".bin,application/octet-stream" hidden></label>' +
        '<a href="https://www.unihiker.com/wiki/K10/GettingStarted/gettingstarted_mpy/" target="_blank" rel="noopener">Baixar o firmware oficial ↗</a></div></li>' +
      '<li>Ligue a K10 no computador com um cabo <b>USB-C de dados</b>.</li>' +
      '<li>Clique em <b>Instalar MicroPython na K10</b> e escolha a placa na janela do navegador. Leva de 2 a 5 minutos: não desligue o cabo.</li>' +
      '<li>Se a K10 não aparecer ou a gravação não começar: segure <b>BOOT</b>, aperte e solte <b>RST</b>, solte <b>BOOT</b> e tente de novo. No fim, aperte <b>RST</b>.</li>' +
    '</ol>' +
    '<div class="k10-fw-barra" hidden><div id="k10-fw-progresso"></div></div>' +
    '<pre id="k10-preparo-resultado" class="k10-result" aria-live="polite"></pre>';

  abrirModal('Preparar UNIHIKER K10 · MicroPython', html, [
    { rotulo: 'Fechar', acao: () => !K10W.instalando },
    { rotulo: 'Testar conexão', acao: () => { k10WebTestar(); return false; } },
    { rotulo: 'Instalar MicroPython na K10', primario: true, acao: () => { k10WebInstalarFirmware(); return false; } },
  ]);
  const botoes = $('#modal-pe').querySelectorAll('button');
  K10W.botaoInstalar = botoes[2];
  K10W.botaoTestar = botoes[1];
  if (!k10TemSerial()) {
    botoes[1].disabled = true; botoes[2].disabled = true;
    $('#k10-preparo-resultado').textContent = 'Este navegador não grava pela USB. Abra a MIDE EDU no Google Chrome ou no Microsoft Edge (computador).';
  }
  $('#k10-fw-input').addEventListener('change', async (ev) => {
    const arq = ev.target.files && ev.target.files[0];
    if (!arq) return;
    const u8 = new Uint8Array(await arq.arrayBuffer());
    k10UsarImagem(u8, arq.name);
  });
  k10MostrarImagem();
  if (!K10W.imagem && typeof K10Firmware !== 'undefined') {
    K10Firmware.procurarLocal().then((achado) => {
      if (achado && !K10W.imagem) { K10W.imagem = achado.imagem; K10W.validacao = achado.validacao; }
      k10MostrarImagem();
    });
  }
}

function k10UsarImagem(u8, nome) {
  const v = K10Firmware.validar(u8, nome);
  const saida = $('#k10-preparo-resultado');
  if (!v.ok) {
    K10W.imagem = null; K10W.validacao = null;
    saida.textContent = '✗ ' + v.erro;
  } else {
    K10W.imagem = u8; K10W.validacao = v;
    saida.textContent = v.avisos.length ? '⚠ ' + v.avisos.join('\n') : '';
  }
  k10MostrarImagem();
}

function k10MostrarImagem() {
  const alvo = $('#k10-fw-arquivo');
  if (!alvo) return;
  const v = K10W.validacao;
  alvo.textContent = v
    ? `✓ ${v.info.nome} (${v.info.megas} MB, ESP32-S3${v.info.temBibliotecaK10 ? ', com a biblioteca unihiker_k10' : ''})`
    : 'baixe o arquivo .bin do MicroPython da K10 no site oficial e escolha-o aqui.';
  alvo.classList.toggle('ok', !!v);
  if (K10W.botaoInstalar) K10W.botaoInstalar.disabled = !v || K10W.instalando || !k10TemSerial();
}

async function k10WebTestar() {
  const saida = $('#k10-preparo-resultado');
  const mp = k10MP();
  if (!mp.conectado) {
    let ok = false;
    try { ok = await mp.conectar(); } catch (e) { saida.textContent = e.message; return; }
    if (!ok) { saida.textContent = 'Escolha a K10 na janela do navegador.'; return; }
  }
  saida.textContent = 'Conferindo a K10…';
  const r = await mp.testar();
  saida.textContent = (r.ok ? '✓ ' : '✗ ') + r.log;
  k10WebAtualizarUI();
}

async function k10WebInstalarFirmware() {
  if (K10W.instalando || !K10W.imagem || !k10TemSerial()) return;
  const saida = $('#k10-preparo-resultado');
  /* a janela de escolha vem primeiro, direto do clique */
  let porta;
  try {
    porta = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x303A }] });
  } catch (e) { saida.textContent = 'Escolha a K10 na janela do navegador para instalar.'; return; }

  K10W.instalando = true;
  ocupar(true);
  for (const b of $('#modal-pe').querySelectorAll('button')) b.disabled = true;
  k10WebAtualizarUI();
  const barra = $('.k10-fw-barra');
  const prog = $('#k10-fw-progresso');
  if (barra) barra.hidden = false;
  const linhas = [];
  const escrever = (l) => { linhas.push(l); if (linhas.length > 12) linhas.shift(); const s = $('#k10-preparo-resultado'); if (s) s.textContent = linhas.join('\n'); };
  try {
    await k10MP().liberar();   // a porta precisa estar livre para o gravador
    escrever('Conectando ao ESP32-S3 da K10…');
    await K10Firmware.instalar({
      porta, imagem: K10W.imagem,
      aoLog: (l) => { if (!/^\s*$/.test(l) && !/Writing at|Wrote \d/.test(l)) escrever(l); },
      aoProgresso: (f) => { const pct = Math.round(f * 100); if (prog) prog.style.width = pct + '%'; const c = $('#k10-estado'); if (c) c.textContent = `Instalando MicroPython… ${pct}%`; },
    });
    escrever('✓ MicroPython instalado. Se a tela da K10 continuar apagada, aperte RST. Depois clique em “Testar conexão”.');
    log('✓ Firmware MicroPython instalado na K10.', 'ok');
  } catch (e) {
    escrever('✗ ' + (e && e.message ? e.message : e));
    if (e && e.causa) console.warn(e.causa);
    log('✗ A instalação do MicroPython não terminou: ' + (e && e.message ? e.message : e), 'erro');
  } finally {
    K10W.instalando = false;
    ocupar(false);
    for (const b of $('#modal-pe').querySelectorAll('button')) b.disabled = false;
    k10MostrarImagem();
    k10WebAtualizarUI();
    setTimeout(() => { k10MP().reconectar().then(k10WebAtualizarUI).catch(() => {}); }, 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const c = document.getElementById('bt-k10-conectar');
  if (c) c.addEventListener('click', k10WebBotaoConectar);
  const p = document.getElementById('bt-k10-parar');
  if (p) p.addEventListener('click', k10WebParar);
});
