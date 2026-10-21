/* ============================================================
 * lego.js — MIDE EDU, placa LEGO Technic (Pybricks)
 * ------------------------------------------------------------
 * Liga a IDE ao hub: conectar por Bluetooth (Web Bluetooth,
 * Chrome/Edge), Verificar (compila .py → .mpy no navegador),
 * Enviar e rodar, Parar, chip de estado, lista de Exemplos na
 * lateral e a saída do hub (print) no Monitor Serial.
 *
 * Depende de: ide.js (estado, log, ocupar…), monitor.js,
 * barra.js, blocos.js, pybricks_ble.js (PybricksHub),
 * pybricks_mpy.js (PybricksMpy) e lego_exemplos.js.
 * ============================================================ */
'use strict';

const LEGO_CHAVE_PY = 'academy_lego_py_rascunho_v1';

const LEGO_MODELO_PY =
'# Programa Pybricks para o hub LEGO Technic.\n' +
'# Clique em "Enviar e rodar" com o hub conectado.\n' +
'from pybricks.hubs import TechnicHub\n' +
'from pybricks.parameters import Color\n' +
'from pybricks.tools import wait\n' +
'\n' +
'hub = TechnicHub()\n' +
'\n' +
'print("Ola, hub!")\n' +
'hub.light.on(Color.GREEN)\n' +
'wait(1000)\n' +
'hub.light.off()\n';

const LEGO = {
  ativo: false,
  conectando: false,
  ultimoAviso: '',
  temporizadorPy: null,
};

const legoHub = () => (typeof PybricksHub !== 'undefined' ? PybricksHub : null);
const legoSuportado = () => !!(legoHub() && legoHub().suportado());

/* ------------------------------------------------------------
 * Estado do hub na interface
 * ---------------------------------------------------------- */
function legoTextoEstado() {
  const hub = legoHub();
  if (!legoSuportado()) return { texto: 'Use o Chrome ou o Edge', classe: 'aviso' };
  if (LEGO.conectando) return { texto: 'Conectando…', classe: 'espera' };
  if (!hub || !hub.conectado) return { texto: 'Desconectado', classe: '' };
  const nome = (hub.info && hub.info.nome) || 'hub';
  if (hub.flags & 0x02) return { texto: 'Bateria acabando', classe: 'aviso' };
  if (hub.rodando) return { texto: '▶ Rodando', classe: 'rodando' };
  if (hub.flags & 0x01) return { texto: 'Conectado: ' + nome + ' · bateria fraca', classe: 'aviso' };
  return { texto: 'Conectado: ' + nome, classe: 'ligado' };
}

function legoAtualizarUI() {
  if (!LEGO.ativo) return;
  const hub = legoHub();
  const conectado = !!(hub && hub.conectado);
  const e = legoTextoEstado();

  const chip = $('#lego-estado');
  chip.textContent = e.texto;
  chip.className = 'lego-chip' + (e.classe ? ' ' + e.classe : '');

  const bt = $('#bt-lego-conectar');
  bt.querySelector('span').textContent = conectado ? 'Desconectar' : 'Conectar hub';
  bt.disabled = estado.ocupado || LEGO.conectando || !legoSuportado();
  bt.title = !legoSuportado()
    ? 'Use o Google Chrome ou o Microsoft Edge para conectar o hub'
    : (conectado ? 'Desconectar do hub' : 'Conectar o hub LEGO por Bluetooth');

  $('#bt-lego-parar').disabled = !(conectado && hub.rodando);

  $('#st-porta').textContent = conectado ? 'hub ' + ((hub.info && hub.info.nome) || '') + (hub.rodando ? ' · rodando' : '') : 'hub desconectado';

  const monEstado = conectado ? 'hub conectado' + (hub.rodando ? ' · programa rodando' : '') : 'hub desconectado';
  $('#mon-estado').textContent = monEstado;
  $('#mon-estado').classList.toggle('ligado', conectado);
  $('#trac-estado').textContent = conectado ? 'recebendo o print() do hub' : 'conecte o hub para receber dados';

  const up = $('#bt-upload');
  if (up) {
    up.title = conectado ? 'Compilar e enviar ao hub (Ctrl+U)' : 'Conecte o hub primeiro (botão “Conectar hub”)';
  }
}

/* ------------------------------------------------------------
 * Conectar / desconectar
 * ---------------------------------------------------------- */
async function legoConectarOuDesconectar() {
  const hub = legoHub();
  if (!hub || estado.ocupado || LEGO.conectando) return;
  if (hub.conectado) {
    try { await hub.desconectar(); } catch (e) { /* já caiu */ }
    legoAtualizarUI();
    return;
  }
  /* requestDevice tem de ser a PRIMEIRA coisa após o clique: a
     ativação do usuário expira depois de esperas longas. */
  LEGO.conectando = true;
  legoAtualizarUI();
  mostrarPainelInf('saida');
  try {
    const info = await hub.conectar();
    log('✓ Hub conectado: ' + (info.nome || 'hub') + ' (Pybricks ' + (info.firmware || '?') + ').', 'ok');
    for (const a of (info.avisos || [])) log('Aviso: ' + a, 'aviso');
    escreverMonitor('— hub conectado: ' + (info.nome || 'hub') + ' —', 'sis');
    if (!info.temStdout) log('Este firmware é antigo e não envia o print() ao Monitor. Atualize o Pybricks do hub se quiser ver as mensagens.', 'aviso');
  } catch (e) {
    legoRelatarErro(e, 'Não foi possível conectar ao hub.');
  } finally {
    LEGO.conectando = false;
    legoAtualizarUI();
    atualizarBotoes();
  }
}

function legoRelatarErro(e, padrao) {
  const msg = (e && e.message) ? e.message : padrao;
  log('✗ ' + msg, 'erro');
  if (e && e.codigo === 'GATT') {
    log('Confira: o hub está ligado (luz piscando)? Ele não está pareado no Windows e nenhuma aba do code.pybricks.com está aberta? O hub aceita uma conexão só.', 'fraco');
  }
  return msg;
}

function legoAoStatus(st) {
  if (!LEGO.ativo) return;
  if (st.mudouRodando) {
    if (st.rodando) escreverMonitor('— programa rodando —', 'sis');
    else escreverMonitor('— programa terminou —', 'sis');
  }
  if (st.bateriaFraca && LEGO.ultimoAviso !== 'bateria') {
    LEGO.ultimoAviso = 'bateria';
    log('Aviso: a bateria do hub está fraca.', 'aviso');
  }
  if (!st.bateriaFraca) LEGO.ultimoAviso = '';
  legoAtualizarUI();
  atualizarBotoes();
}

function legoAoDesconectar() {
  if (!LEGO.ativo) return;
  log('Hub desconectado.', 'aviso');
  escreverMonitor('— hub desconectado —', 'sis');
  legoAtualizarUI();
  atualizarBotoes();
}

async function legoParar() {
  const hub = legoHub();
  if (!hub || !hub.conectado) return;
  try {
    await hub.parar();
    log('■ Programa parado.', 'info');
  } catch (e) {
    legoRelatarErro(e, 'Não foi possível parar o programa.');
  }
}

/* ------------------------------------------------------------
 * Verificar / Enviar e rodar
 * ---------------------------------------------------------- */
function legoPodeGravar() {
  const hub = legoHub();
  if (!hub || !hub.conectado) return false;
  if (estado.aba === 'livre') return $('#editor-livre').value.trim().length > 0;
  if (estado.aba === 'blocos') return typeof blocosPodeGravar === 'function' && blocosPodeGravar();
  return false;
}

/* Marca no Editor Python a linha em que o compilador achou o erro. */
function legoMostrarLinhaComErro(linha) {
  if (!linha || estado.aba !== 'livre') return;
  const ta = $('#editor-livre');
  const linhas = ta.value.split('\n');
  if (linha > linhas.length) return;
  const ini = linhas.slice(0, linha - 1).join('\n').length + (linha > 1 ? 1 : 0);
  const fim = ini + linhas[linha - 1].length;
  ta.focus();
  ta.setSelectionRange(ini, fim);
  const alturaLinha = parseFloat(getComputedStyle(ta).lineHeight) || 18;
  ta.scrollTop = Math.max(0, (linha - 3) * alturaLinha);
  if (typeof atualizarCursor === 'function') atualizarCursor();
}

async function legoCompilar(codigo) {
  const r = await PybricksMpy.compilarPrograma(codigo);
  if (!r.ok) {
    mostrarPainelInf('saida');
    for (const m of r.erros) log('✗ ' + m, 'erro');
    if (estado.aba === 'blocos') log('O Python gerado pelos blocos não passou no compilador. Isso não deveria acontecer: avise o professor.', 'fraco');
    else legoMostrarLinhaComErro(r.linha);
  }
  return r;
}

async function legoVerificar() {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  const codigo = codigoAtual();
  if (!codigo.trim()) { mostrarPainelInf('saida'); log('Não há código para verificar.', 'aviso'); return; }
  ocupar(true);
  barraIniciar('compilar');
  try {
    const r = await legoCompilar(codigo);
    if (r.ok) {
      log('✓ Código Python conferido (' + r.mpy.length + ' bytes). Nomes de módulos e portas só são checados no hub.', 'ok');
      barraFinalizar(true, 'Código conferido.');
    } else {
      barraFinalizar(false, 'O código tem erros — veja a Saída.');
    }
  } catch (e) {
    log('✗ Falha ao compilar: ' + (e && e.message ? e.message : e), 'erro');
    barraFinalizar(false, 'Falha ao compilar.');
  }
  ocupar(false);
}

async function legoEnviar() {
  const hub = legoHub();
  if (estado.ocupado || !estado.selecionouPlaca) return;
  if (!hub || !hub.conectado) {
    mostrarPainelInf('saida');
    log('Conecte o hub antes: clique em “Conectar hub”, na barra de cima.', 'aviso');
    return;
  }
  const codigo = codigoAtual();
  if (!codigo.trim()) { mostrarPainelInf('saida'); log('Não há código para enviar.', 'aviso'); return; }
  ocupar(true);
  barraIniciar('gravar');
  let ok = false, recado = '';
  try {
    const r = await legoCompilar(codigo);
    if (!r.ok) { recado = 'O código tem erros — veja a Saída.'; return; }
    $('#barra-acao').textContent = 'Enviando ao hub…';
    BARRA.teto = 0.97;
    BARRA.alvo = 0.15;
    await hub.enviarERodar(r.blob, (fracao) => { BARRA.alvo = Math.min(0.97, 0.15 + 0.82 * fracao); });
    ok = true;
    recado = 'Programa rodando no hub.';
    log('✓ Programa enviado (' + r.blob.length + ' bytes). Rodando no hub!', 'ok');
    escreverMonitor('— programa enviado —', 'sis');
    zerarTracador();
    if (/\bprint\s*\(/.test(codigo) && hub.info && hub.info.temStdout) mostrarPainelInf('monitor');
  } catch (e) {
    recado = legoRelatarErro(e, 'Não foi possível enviar o programa.');
  } finally {
    barraFinalizar(ok, recado);
    ocupar(false);
    legoAtualizarUI();
  }
}

/* ------------------------------------------------------------
 * Monitor Serial: o print() do hub e o input() do aluno
 * ---------------------------------------------------------- */
async function legoEnviarStdin(texto, final) {
  const hub = legoHub();
  if (!hub || !hub.conectado) { escreverMonitor('Conecte o hub antes de enviar.', 'sis'); return false; }
  const fim = { nada: '', nl: '\n', cr: '\r', nlcr: '\r\n' }[final] ?? '\n';
  try {
    await hub.escreverStdin(texto + fim);
    return true;
  } catch (e) {
    escreverMonitor('Não foi possível enviar: ' + (e && e.message ? e.message : e), 'sis');
    return false;
  }
}

/* ------------------------------------------------------------
 * Exemplos (menu Arquivo → Exemplos e lista da lateral)
 * ---------------------------------------------------------- */
function legoAbrirExemplo(id) {
  if (estado.ocupado) return;
  const ex = (typeof LEGO_EXEMPLOS !== 'undefined' ? LEGO_EXEMPLOS : []).find((x) => x.id === id);
  if (!ex) return;
  if (ex.tipo === 'python') {
    trocarAba('livre');
    const ta = $('#editor-livre');
    if (ta.value.trim() && ta.value !== ex.python && ta.value !== LEGO_MODELO_PY &&
        !confirm('Abrir o exemplo “' + ex.nome + '”? O que está no Editor Python será substituído.')) return;
    ta.value = ex.python;
    renderLivre(); atualizarBotoes(); atualizarCursor();
    legoSalvarPy();
    $('#rotulo-sketch').textContent = ex.arquivo || 'main.py';
  } else {
    trocarAba('blocos');
    const ws = typeof estadoBlocos !== 'undefined' ? estadoBlocos.workspace : null;
    if (ws && ws.getTopBlocks(false).length &&
        !confirm('Abrir o exemplo “' + ex.nome + '”? Os blocos que estão na tela serão substituídos.')) return;
    if (!blocosCarregarWorkspace(JSON.parse(JSON.stringify(ex.blocos)))) {
      log('Não consegui abrir o exemplo: a área de blocos ainda não carregou.', 'erro');
      return;
    }
    $('#rotulo-sketch').textContent = 'blocos_' + ex.id + '.py';
  }
  log('Exemplo carregado: ' + ex.nome + '.', 'info');
  if (ex.id === 'guindaste_controle') log('Confira as portas dos motores com o exemplo “Descobrir portas” antes de rodar. Ligue o controle remoto (botão verde) quando o programa pedir.', 'fraco');
}

function legoItensExemplos() {
  return (typeof LEGO_EXEMPLOS !== 'undefined' ? LEGO_EXEMPLOS : []).map((ex) => ({
    rotulo: ex.nome + (ex.tipo === 'python' ? ' (Python)' : ' (blocos)'),
    acao: () => legoAbrirExemplo(ex.id),
  }));
}

/* ------------------------------------------------------------
 * Ajuda (Ajuda → Guia de introdução / Solução de problemas)
 * ---------------------------------------------------------- */
function legoAjuda() {
  abrirModal('LEGO Technic · conectar e programar',
    '<h4>Conectar o hub</h4>' +
    '<ul><li>Use o <b>Google Chrome</b> ou o <b>Microsoft Edge</b>: são os que têm Bluetooth para páginas da web.</li>' +
    '<li>Ligue o Bluetooth do computador. <b>Não pareie</b> o hub nas configurações do Windows.</li>' +
    '<li>Feche qualquer aba do code.pybricks.com: o hub aceita uma conexão só.</li>' +
    '<li>Ligue o hub (botão central); a luz pisca. Clique em <b>Conectar hub</b> e escolha o hub na lista.</li></ul>' +
    '<h4>Programar</h4>' +
    '<ul><li><b>Blocos</b> montam o Python pra você; o código aparece ao lado.</li>' +
    '<li><b>Editor Python</b> é para escrever o programa à mão.</li>' +
    '<li><b>Verificar</b> confere o código sem precisar do hub. <b>Enviar e rodar</b> manda o programa para o hub e já executa.</li>' +
    '<li><b>Parar</b> interrompe o programa. O botão do hub também para o programa.</li>' +
    '<li>O que o programa escreve com <code>print()</code> aparece no <b>Monitor Serial</b> (e números viram linhas no Gráfico Serial).</li></ul>' +
    '<h4>O hub não aparece na lista</h4>' +
    '<ul><li>Confira se ele está ligado e com a luz piscando.</li>' +
    '<li>Se ele já foi pareado no Windows, remova-o em Configurações → Bluetooth e dispositivos.</li>' +
    '<li>O hub precisa ter o firmware Pybricks (o do LEGO original não serve).</li></ul>' +
    '<h4>Nada acontece no motor</h4>' +
    '<ul><li>Rode o exemplo <b>Descobrir portas</b> e veja no Monitor qual porta tem motor.</li>' +
    '<li>Confira se a bateria do hub não está fraca.</li></ul>');
}

/* ------------------------------------------------------------
 * Rascunho do Editor Python (um só para a placa LEGO)
 * ---------------------------------------------------------- */
function legoSalvarPy() {
  if (!LEGO.ativo) return;
  clearTimeout(LEGO.temporizadorPy);
  try { localStorage.setItem(LEGO_CHAVE_PY, $('#editor-livre').value); } catch (e) { /* sem storage */ }
}

function legoCarregarPy() {
  let texto = null;
  try { texto = localStorage.getItem(LEGO_CHAVE_PY); } catch (e) { /* sem storage */ }
  return texto && texto.trim() ? texto : LEGO_MODELO_PY;
}

/* ------------------------------------------------------------
 * Lateral: hub + exemplos (no lugar da lista de missões)
 * ---------------------------------------------------------- */
function legoRenderLateral() {
  const lista = $('#lista-fases');
  lista.innerHTML = '';

  const cartao = criar('div', 'lego-cartao');
  cartao.innerHTML =
    '<img src="assets/boards/lego.png" alt="Technic Hub da LEGO" width="72" height="72">' +
    '<div><strong>Technic Hub</strong><small>Liebherr LR 13000 · Pybricks</small></div>';
  lista.appendChild(cartao);

  if (!legoSuportado()) {
    const av = criar('div', 'lego-aviso');
    av.textContent = 'Este navegador não tem Bluetooth para páginas da web. Abra a IDE no Google Chrome ou no Microsoft Edge para conectar o hub.';
    lista.appendChild(av);
  }

  const passos = criar('details', 'lego-passos');
  passos.innerHTML =
    '<summary>Como conectar o hub</summary>' +
    '<ol><li>Ligue o Bluetooth do computador. <b>Não pareie</b> o hub nas configurações do Windows.</li>' +
    '<li>Feche abas do code.pybricks.com: o hub aceita uma conexão só.</li>' +
    '<li>Ligue o hub (botão central). A luz pisca quando ele está esperando.</li>' +
    '<li>Clique em <b>Conectar hub</b> e escolha o hub na lista.</li>' +
    '<li>Monte um programa em <b>Blocos</b> (ou no <b>Editor Python</b>) e clique em <b>Enviar e rodar</b>.</li></ol>' +
    '<p>O botão do hub é o de liga/desliga e também <b>para o programa</b>.</p>';
  lista.appendChild(passos);

  const tit = criar('div', 'lego-titulo');
  tit.textContent = 'Exemplos';
  lista.appendChild(tit);

  for (const ex of (typeof LEGO_EXEMPLOS !== 'undefined' ? LEGO_EXEMPLOS : [])) {
    const bt = criar('button', 'lego-exemplo');
    bt.disabled = estado.ocupado;
    bt.innerHTML =
      '<span class="tit">' + escapar(ex.nome) + '</span>' +
      '<span class="tipo">' + (ex.tipo === 'python' ? 'Python' : 'Blocos') + '</span>' +
      '<small>' + escapar(ex.descricao || '') + '</small>';
    bt.addEventListener('click', () => legoAbrirExemplo(ex.id));
    lista.appendChild(bt);
  }
}

/* ------------------------------------------------------------
 * Ligar / desligar o modo LEGO (chamado por selecionarCurso)
 * ---------------------------------------------------------- */
function legoAtivar(sim) {
  const era = LEGO.ativo;
  LEGO.ativo = !!sim;
  $('#lego-hub').hidden = !sim;
  $('#seletor-placa').hidden = !!sim;
  document.body.classList.toggle('modo-lego', !!sim);

  if (sim) {
    $('#curso-barra').hidden = true;
    $('#aba-treino').hidden = true;
    $('#aba-completo').hidden = true;
    $('#aba-blocos').hidden = false;
    $('#mon-texto').placeholder = 'texto para o input() do hub… (Enter envia)';
    $('#bt-mon-ligar').hidden = true;
    $('#mon-baud').hidden = true;
    legoAtualizarUI();
    if (!legoSuportado()) log('Este navegador não tem Web Bluetooth. Use o Google Chrome ou o Microsoft Edge para conectar o hub. Você ainda pode montar programas e usar Verificar.', 'aviso');
  } else {
    $('#aba-treino').hidden = false;
    $('#bt-mon-ligar').hidden = false;
    $('#mon-baud').hidden = false;
    $('#mon-texto').placeholder = 'mensagem para a placa… (Enter envia)';
    /* sair da placa LEGO solta o hub: ele aceita uma conexão só */
    const hub = legoHub();
    if (era && hub && hub.conectado) hub.desconectar().catch(() => {});
    if (era) {
      const e = $('#mon-estado');
      e.textContent = 'desconectado';
      e.classList.remove('ligado');
      $('#trac-estado').textContent = 'use o Monitor Serial para conectar';
    }
  }
}

/* Editor Python e blocos da placa LEGO ao entrar nela. */
function legoAoEntrar(rascunho) {
  estado.fase = null;
  estado.indice = -1;
  estado.treino = null;
  estado.etapa = 'instrucao';
  const ta = $('#editor-livre');
  ta.value = rascunho && typeof rascunho.codigo === 'string' && rascunho.codigo.trim() ? rascunho.codigo : legoCarregarPy();
  renderLivre();
  $('#rotulo-sketch').textContent = 'main.py';
  $('.curriculo-cab h2').innerHTML = 'LEGO TECHNIC<small>Pybricks · Exemplos</small>';
  consoleEl.innerHTML = '';
  log('LEGO Technic (Pybricks) — conecte o hub, monte um programa e clique em “Enviar e rodar”.', 'info');
  log('Sem hub por perto? “Verificar” confere o Python aqui mesmo, sem Bluetooth.', 'fraco');
  trocarAba('blocos');
  legoAtualizarUI();
}

document.addEventListener('DOMContentLoaded', () => {
  const hub = legoHub();
  $('#bt-lego-conectar').addEventListener('click', legoConectarOuDesconectar);
  $('#bt-lego-parar').addEventListener('click', legoParar);
  $('#editor-livre').addEventListener('input', () => {
    if (!LEGO.ativo) return;
    clearTimeout(LEGO.temporizadorPy);
    LEGO.temporizadorPy = setTimeout(legoSalvarPy, 800);
  });
  window.addEventListener('pagehide', legoSalvarPy);

  if (hub) {
    hub.on('status', legoAoStatus);
    hub.on('desconectou', legoAoDesconectar);
    hub.on('conectou', () => { legoAtualizarUI(); atualizarBotoes(); });
    hub.on('stdout', (texto) => { if (LEGO.ativo && typeof monitorReceberTexto === 'function') monitorReceberTexto(texto); });
  }

  /* aviso no card da tela inicial, quando o navegador não tem Bluetooth */
  const aviso = document.getElementById('lego-card-aviso');
  if (aviso) aviso.hidden = legoSuportado();
});
