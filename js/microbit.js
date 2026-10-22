/* ============================================================
 * microbit.js — MIDE EDU, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Liga a IDE à micro:bit: conectar por USB (WebUSB, Chrome/Edge),
 * Verificar (compila no navegador), Enviar (grava o .hex sem
 * arduino-cli e sem pip), chip de estado, Monitor Serial e o
 * realce de sintaxe do JavaScript/MicroPython da placa.
 *
 * A placa é a BBC micro:bit V2. O aluno escolhe no card a linguagem
 * (JavaScript do MakeCode ou MicroPython); Treinamento, Código completo,
 * Blocos e Editor livre funcionam nas duas. Os Blocos são a fonte única:
 * o JavaScript e o MicroPython saem dos mesmos blocos.
 *
 * Depende de: ide.js (estado, log, ocupar…), monitor.js, barra.js,
 * blocos.js + blocos_mb_*.js, microbit_usb.js (MicrobitUSB),
 * microbit_hex.js (MicrobitHex), microbit_suporte.js e microbit_curso.js.
 * ============================================================ */
'use strict';

const MB = {
  ativo: false,
  conectando: false,
  conectandoBle: false,
};

const mbUSB = () => (typeof MicrobitUSB !== 'undefined' ? MicrobitUSB : null);
const mbSuportado = () => !!(mbUSB() && mbUSB().suportado());
const mbBLE = () => (typeof MicrobitBLE !== 'undefined' ? MicrobitBLE : null);
const mbBleSuportado = () => !!(mbBLE() && mbBLE().suportado());
const mbEhPython = () => estado.linguagem === 'micropython';

/* ------------------------------------------------------------
 * Realce de sintaxe (JavaScript do MakeCode e MicroPython)
 * ---------------------------------------------------------- */
const MB_PALAVRAS_JS = new Set(['let', 'const', 'function', 'if', 'else', 'for', 'while', 'return', 'new', 'true', 'false', 'null', 'undefined', 'namespace', 'export', 'break', 'continue']);
const MB_PALAVRAS_PY = new Set(['from', 'import', 'while', 'True', 'False', 'None', 'if', 'elif', 'else', 'def', 'return', 'and', 'or', 'not', 'pass', 'for', 'in', 'global', 'break', 'continue']);
const MB_OBJETOS = new Set(['basic', 'input', 'music', 'radio', 'led', 'pins', 'serial', 'game', 'bluetooth', 'control', 'Math',
  'soundExpression', 'lcd1602', 'sonar', 'sete_seg', 'randint', 'display', 'button_a', 'button_b', 'pin_logo', 'accelerometer',
  'compass', 'microphone', 'speaker', 'audio', 'Image', 'Sound', 'SoundEvent', 'utime', 'machine', 'random', 'math', 'sleep',
  'running_time', 'temperature', 'time_pulse_us', 'print', 'set_volume', 'distancia_cm', 'mapear', 'grafico_barras']);
const MB_CONSTANTES = new Set(['Button', 'Gesture', 'IconNames', 'ArrowNames', 'Dimension', 'DigitalPin', 'AnalogPin', 'PulseValue',
  'PinPullMode', 'BeatFraction', 'Note', 'Melodies', 'Direction', 'LedSpriteProperty', 'DetectedSound', 'TouchButtonEvent', 'NumberFormat', 'Delimiters']);

/* Divide uma linha em pedaços {texto, tipo}. tipo: keyword | func | const | num | com | str | null */
function mbTokenizar(linha, py) {
  const spans = [];
  const palavras = py ? MB_PALAVRAS_PY : MB_PALAVRAS_JS;
  const n = linha.length;
  let i = 0;
  while (i < n) {
    const c = linha[i];
    if ((!py && c === '/' && linha[i + 1] === '/') || (py && c === '#')) {
      spans.push({ texto: linha.slice(i), tipo: 'com' });
      break;
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < n && linha[j] !== c) { if (linha[j] === '\\') j++; j++; }
      j = Math.min(n, j + 1);
      spans.push({ texto: linha.slice(i, j), tipo: 'str' });
      i = j;
    } else if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[\w.]/.test(linha[j])) j++;
      const palavra = linha.slice(i, j);
      const raiz = palavra.split('.')[0];
      let tipo = null;
      if (palavras.has(palavra)) tipo = 'keyword';
      else if (MB_OBJETOS.has(raiz) || /^pin\d+$/.test(raiz)) tipo = 'func';
      else if (MB_CONSTANTES.has(raiz)) tipo = 'const';
      spans.push({ texto: palavra, tipo });
      i = j;
    } else if (/\d/.test(c)) {
      let j = i;
      while (j < n && /[\d.xA-Fa-f]/.test(linha[j])) j++;
      spans.push({ texto: linha.slice(i, j), tipo: 'num' });
      i = j;
    } else {
      let j = i;
      while (j < n && !/[A-Za-z_\d"'`]/.test(linha[j]) && !((!py && linha[j] === '/' && linha[j + 1] === '/') || (py && linha[j] === '#'))) j++;
      if (j === i) j = i + 1;
      spans.push({ texto: linha.slice(i, j), tipo: null });
      i = j;
    }
  }
  return spans;
}

const MB_CLASSE = { keyword: 't-keyword', func: 't-func', const: 't-const', num: 't-num', com: 't-com', str: 't-const' };

function realcarMicrobit(codigo, linguagem) {
  const py = linguagem === 'micropython';
  return codigo.split('\n').map((linha) =>
    mbTokenizar(linha, py).map((s) => (s.tipo ? `<span class="${MB_CLASSE[s.tipo]}">${escapar(s.texto)}</span>` : escapar(s.texto))).join('') || '&nbsp;'
  ).join('\n');
}

function mbCoresPorCaractere(linha) {
  const cores = [];
  for (const s of mbTokenizar(linha, mbEhPython())) {
    const cls = s.tipo ? MB_CLASSE[s.tipo] : '';
    for (let k = 0; k < s.texto.length; k++) cores.push(cls);
  }
  return cores;
}

/* ------------------------------------------------------------
 * Estado da placa na interface
 * ---------------------------------------------------------- */
function mbTextoEstado() {
  const usb = mbUSB();
  if (!mbSuportado()) return { texto: 'Use o Chrome ou o Edge', classe: 'aviso' };
  if (MB.conectando || (usb && usb.estado === 'conectando')) return { texto: 'Conectando…', classe: 'espera' };
  if (usb && usb.estado === 'gravando') return { texto: 'Enviando…', classe: 'gravando' };
  if (usb && usb.conectado) return { texto: 'Conectada (V2)', classe: 'ligado' };
  return { texto: 'Desconectada', classe: '' };
}

function mbAtualizarUI() {
  if (!MB.ativo) return;
  const usb = mbUSB();
  const conectado = !!(usb && usb.conectado);
  const e = mbTextoEstado();

  const chip = $('#mb-estado');
  chip.textContent = e.texto;
  chip.title = e.texto;
  chip.className = 'lego-chip' + (e.classe ? ' ' + e.classe : '');

  const bt = $('#bt-mb-conectar');
  bt.querySelector('span').textContent = conectado ? 'Desconectar' : 'Conectar micro:bit';
  bt.disabled = estado.ocupado || MB.conectando || !mbSuportado() || (usb && usb.estado === 'gravando');
  bt.title = !mbSuportado()
    ? 'Use o Google Chrome ou o Microsoft Edge para conectar a micro:bit'
    : (conectado ? 'Desconectar da micro:bit' : 'Conectar a micro:bit pelo cabo USB');

  const ble = mbBLE();
  const porBle = !conectado && !!(ble && ble.conectado);
  $('#st-porta').textContent = conectado ? 'micro:bit V2 · USB' : (porBle ? 'micro:bit V2 · Bluetooth' : 'micro:bit desconectada');
  $('#mon-estado').textContent = conectado ? 'micro:bit conectada · 115200 baud' : (porBle ? 'micro:bit conectada · Bluetooth (UART)' : 'micro:bit desconectada');
  $('#mon-estado').classList.toggle('ligado', conectado || porBle);
  $('#trac-estado').textContent = (conectado || porBle) ? 'recebendo o que a micro:bit escreve na serial' : 'conecte a micro:bit para receber dados';

  const up = $('#bt-upload');
  if (up) up.title = conectado ? 'Compilar e enviar para a micro:bit (Ctrl+U)' : 'Enviar grava pelo cabo USB: clique antes em “Conectar micro:bit” (esta IDE ainda não grava por Bluetooth)';
  mbAtualizarBle();
}

/* ------------------------------------------------------------
 * Bluetooth (só JavaScript): Monitor sem fio + Painel ao vivo
 * ---------------------------------------------------------- */
function mbAtualizarBle() {
  if (!MB.ativo) return;
  const ble = mbBLE();
  const py = mbEhPython();
  const conectado = !!(ble && ble.conectado);
  const estadoBle = ble ? ble.estado : 'desconectado';

  const bt = $('#bt-mb-ble');
  const suportado = mbBleSuportado();
  const motivo = py ? 'O MicroPython da micro:bit V2 não tem Bluetooth de dados. Escolha a trilha JavaScript para usar o Monitor sem fio e o Painel ao vivo.'
    : !suportado ? 'Use o Google Chrome ou o Microsoft Edge para conectar por Bluetooth'
    : null;
  bt.setAttribute('aria-disabled', String(!!motivo));
  bt.disabled = !!(estado.ocupado || MB.conectandoBle);
  bt.querySelector('span').textContent = conectado ? 'Desconectar Bluetooth' : 'Bluetooth';
  bt.classList.toggle('ativo', conectado);
  bt.title = motivo || (conectado ? 'Desconectar o Bluetooth da micro:bit' : 'Conectar por Bluetooth (programa JavaScript com Bluetooth já gravado)');

  const chip = $('#mb-ble-estado');
  const texto = conectado ? 'Bluetooth: conectado' : (estadoBle === 'conectando' ? 'Bluetooth: conectando…' : 'Bluetooth: desconectado');
  chip.textContent = texto;
  chip.title = texto;
  chip.className = 'lego-chip' + (conectado ? ' ligado' : (estadoBle === 'conectando' ? ' espera' : ''));
  chip.hidden = !(conectado || estadoBle === 'conectando');

  /* a aba do painel existe só na trilha JavaScript */
  $('#aba-aovivo').hidden = py;
  if (py && estado.painelInf === 'aovivo') mostrarPainelInf('saida');
  $('#bt-av-calibrar').disabled = !conectado;
  $('#av-estado').textContent = conectado ? 'micro:bit conectada por Bluetooth' : (estadoBle === 'conectando' ? 'conectando…' : 'conecte por Bluetooth para ver a micro:bit ao vivo');
  $('#av-estado').classList.toggle('ligado', conectado);
}

/* O que conferir quando a micro:bit não aparece na lista de Bluetooth do computador. */
function mbDicasSemPlaca() {
  return [
    'Use a lista do próprio Chrome (botão Bluetooth da IDE). O “Adicionar dispositivo” do Windows costuma nem mostrar a micro:bit, porque o Windows esconde aparelhos que não são teclado, mouse ou fone: não precisa (nem adianta) parear por lá.',
    'Modo de pareamento: segure A + B, aperte e solte o botão de reset (atrás) e só solte A + B quando aparecer “PAIRING MODE!”. Fora dele, uma placa já pareada com outro aparelho (como o iPhone) não aparece para um computador novo.',
    'Desligue o Bluetooth do iPhone/celular (ou desconecte a micro:bit no app): a placa só fala com um aparelho por vez.',
    'Solução mais estável, recomendada pela própria equipe do MakeCode: programa SEM pareamento (“No Pairing Required”). Veja o passo a passo em “Bluetooth sem pareamento”, na ajuda.',
    'Programa gravado por USB com o bloco “Bluetooth: iniciar serviço UART” ou “iniciar painel ao vivo” e sem blocos de Rádio (sem isso a placa nem anuncia Bluetooth).',
    'Bluetooth do Windows ligado e adaptador com BLE. Se o Windows guardou uma micro:bit antiga, remova-a em Configurações → Bluetooth e dispositivos e regrave a placa.',
    'Para saber se a placa está mesmo anunciando, abra o app nRF Connect (celular ou PC): ela deve aparecer como “BBC micro:bit [nome]”. Se nem lá aparece, o problema é o programa gravado, não o computador.',
  ];
}

function mbAjudaBluetooth() {
  abrirModal('Como usar o Bluetooth da micro:bit', `
    <p>O Bluetooth mostra o <strong>Monitor Serial</strong> e o <strong>Painel ao vivo</strong> sem cabo. Nesta IDE ele <strong>ainda não grava</strong> programas: gravar é pelo cabo USB. (O app da micro:bit no celular grava por Bluetooth; a IDE ainda não faz isso.)</p>
    <ol>
      <li>Na trilha <strong>JavaScript</strong>, monte um programa com os blocos <em>Bluetooth: iniciar serviço UART</em> e/ou <em>Bluetooth: iniciar painel ao vivo</em> (ou abra Arquivo → Exemplos → Programas prontos → Painel ao vivo por Bluetooth).</li>
      <li>Grave o programa <strong>por USB</strong> (Conectar micro:bit → Enviar).</li>
      <li>Coloque a placa no <strong>modo de pareamento</strong> (segure A + B, aperte e solte o botão de reset atrás e só solte A + B quando aparecer a mensagem “PAIRING MODE!” e um desenho na tela), depois clique em <strong>Bluetooth</strong> e escolha “BBC micro:bit [nome]”. O computador pede para parear: confirme.</li>
      <li>Depois de pareada, ela conecta sem repetir o pareamento. Se o Windows “esquecer” a placa, remova-a nas configurações de Bluetooth e pareie de novo.</li>
    </ol>
    <p><strong>Regras:</strong> Bluetooth e Rádio não funcionam juntos no mesmo programa; feche outras abas que usam a micro:bit (makecode.microbit.org, python.microbit.org); o MicroPython não tem Bluetooth de dados.</p>
    <p><strong>Se nada aparecer</strong> no painel, o programa gravado não liga aquele serviço: use o bloco <em>iniciar painel ao vivo</em> e grave de novo.</p>
    <p><strong>Enviar por Bluetooth (experimental)</strong>: em Ferramentas → <em>Enviar por Bluetooth</em> (ou no botão do Painel ao vivo). Usa o mesmo serviço de gravação parcial do app do celular: placa em modo de pareamento e já rodando um programa com Bluetooth. Se a IDE disser que precisa do cabo, use o USB.</p>
    <p><strong>Bluetooth sem pareamento (o jeito mais estável no computador)</strong></p>
    <ol>
      <li>Abra <em>makecode.microbit.org</em> → Novo projeto → Extensões → <em>bluetooth</em> (isso troca o Rádio pelo Bluetooth).</li>
      <li>Engrenagem → <em>Configurações do projeto</em> → marque <strong>No Pairing Required</strong>.</li>
      <li>Mude para JavaScript e cole o código do exemplo <em>Painel ao vivo por Bluetooth</em> (Arquivo → Exemplos → Programas prontos, aba Editor).</li>
      <li>Baixe o .hex e <strong>arraste para a unidade MICROBIT</strong>. Nesse modo, dispensa A+B+reset e o Windows não pede pareamento: é só clicar em <strong>Bluetooth</strong> na IDE.</li>
    </ol>
    <p>Aviso: se você gravar de novo pelo <em>Enviar</em> da IDE, a placa volta ao modo com pareamento. Enquanto a IDE não gera esse modo sozinha, use a gravação por arrastar.</p>
    <p><strong>A placa não aparece na lista do computador?</strong> (o celular achou, o PC não)</p>
    <ul>${mbDicasSemPlaca().map((d) => '<li>' + d + '</li>').join('')}</ul>`,
    [{ rotulo: 'Entendi', primario: true }]);
}

/* IMPORTANTE: requestDevice (dentro de ble.conectar) tem de ser a PRIMEIRA coisa depois do clique. */
function mbConectarOuDesconectarBle() {
  const ble = mbBLE();
  if (estado.ocupado || MB.conectandoBle) return Promise.resolve();
  if (mbEhPython()) {
    mostrarPainelInf('saida');
    log('O MicroPython da micro:bit V2 não tem Bluetooth de dados. Para o Monitor sem fio e o Painel ao vivo, escolha a trilha JavaScript.', 'aviso');
    return Promise.resolve();
  }
  if (!ble || !ble.suportado()) {
    mostrarPainelInf('saida');
    log('Este navegador não tem Web Bluetooth. Use o Google Chrome ou o Microsoft Edge.', 'aviso');
    return Promise.resolve();
  }
  if (ble.conectado) return ble.desconectar().then(mbAtualizarBle);
  MB.conectandoBle = true;
  mbAtualizarBle();
  return ble.conectar().then(() => {
    log('✓ Bluetooth conectado. O Monitor mostra o que a micro:bit escreve pelo UART e o Painel ao vivo mostra os sensores. (Para enviar um programa novo, use o cabo USB: esta IDE ainda não grava por Bluetooth.)', 'ok');
    escreverMonitor('— micro:bit conectada por Bluetooth —', 'sis');
    mostrarPainelInf('aovivo');
  }, (e) => {
    if (e && e.cancelou) {
      mostrarPainelInf('saida');
      log('Nenhuma micro:bit foi escolhida por Bluetooth. Se ela não apareceu na lista do Chrome:', 'aviso');
      mbDicasSemPlaca().forEach((d) => log('  • ' + d, 'fraco'));
      return;
    }
    mostrarPainelInf('saida');
    log('✗ ' + ((e && e.mensagem) || 'Não foi possível conectar por Bluetooth.'), 'erro');
    log('Dica: confira se o programa com Bluetooth foi gravado por USB e se a placa está no modo de pareamento (Como usar, no Painel ao vivo).', 'fraco');
  }).finally(() => { MB.conectandoBle = false; mbAtualizarBle(); });
}

/* ------------------------------------------------------------
 * Conectar / desconectar
 * ---------------------------------------------------------- */
function mbConectarOuDesconectar() {
  const usb = mbUSB();
  if (!usb || estado.ocupado || MB.conectando) return Promise.resolve();
  if (usb.conectado) {
    return usb.desconectar().then(mbAtualizarUI);
  }
  /* requestDevice tem de ser a PRIMEIRA coisa depois do clique: nada de await antes. */
  MB.conectando = true;
  mbAtualizarUI();
  mostrarPainelInf('saida');
  return usb.conectar().then(async (info) => {
    if (info && info.versao && info.versao !== 'V2') {
      log('✗ Esta placa é a micro:bit ' + info.versao + '. A IDE só funciona com a micro:bit V2.', 'erro');
      await usb.desconectar();
      return;
    }
    log('✓ micro:bit V2 conectada por USB.', 'ok');
    escreverMonitor('— micro:bit conectada —', 'sis');
  }, (e) => {
    if (!(e && e.cancelou)) log('✗ ' + ((e && (e.mensagem || e.message)) || 'Não foi possível conectar.'), 'erro');
    else log('Nenhuma micro:bit foi escolhida.', 'aviso');
  }).finally(() => {
    MB.conectando = false;
    mbAtualizarUI();
    atualizarBotoes();
  });
}

function mbPodeGravar() {
  /* Sem USB o botão continua clicável: o clique explica que gravar é pelo cabo (mbEnviar). */
  if (estado.aba === 'livre') return $('#editor-livre').value.trim().length > 0;
  if (estado.aba === 'blocos') return typeof blocosPodeGravar === 'function' && blocosPodeGravar();
  if (estado.aba === 'completo') return !!(estado.fase && estado.fase.solucao);
  return !!estado.treino && estado.treino.idx >= estado.treino.linhas.length;
}

/* ------------------------------------------------------------
 * Do código ao .hex
 * ---------------------------------------------------------- */

/* O programa que vale agora, na linguagem do curso (nos Blocos, o painel pode estar mostrando
   a outra linguagem só para leitura). → { ok, codigo } | { ok:false, erro } */
function mbCodigoParaPlaca() {
  if (estado.aba === 'blocos') {
    const ws = typeof estadoBlocos !== 'undefined' ? estadoBlocos.workspace : null;
    if (!ws) return { ok: false, erro: 'A área de blocos ainda não carregou.' };
    const r = mbEhPython() ? blocosGerarMbPy(ws) : blocosGerarMbJs(ws);
    if (!r.codigo || !r.codigo.trim()) return { ok: false, erro: r.aviso || 'Monte um programa com blocos primeiro.' };
    if (r.impossivel) return { ok: false, erro: r.aviso || 'Estes blocos não podem ser enviados nesta linguagem.' };
    return { ok: true, codigo: r.codigo, avisoBlocos: r.aviso || '' };
  }
  const codigo = codigoAtual();
  if (!codigo || !codigo.trim()) return { ok: false, erro: 'Não há código para enviar.' };
  return { ok: true, codigo };
}

/* Compila (JS) ou monta (Python) o .hex. → { ok, hex } | { ok:false, erros:[{linha,texto}], mensagem } */
/* "Incluir Bluetooth ao vivo em todo envio": a micro:bit guarda UM programa só (o Bluetooth faz parte
   dele e é apagado a cada gravação), então a IDE junta os serviços ao programa na hora de compilar. */
const MB_CHAVE_BLE_SEMPRE = 'mide_mb_ble_sempre';
const MB_SERVICOS_AO_VIVO = [
  'bluetooth.startUartService()', 'bluetooth.startAccelerometerService()', 'bluetooth.startButtonService()',
  'bluetooth.startMagnetometerService()', 'bluetooth.startTemperatureService()',
];
function mbBleSempre() { try { return localStorage.getItem(MB_CHAVE_BLE_SEMPRE) === '1'; } catch (e) { return false; } }
function mbDefinirBleSempre(v) { try { localStorage.setItem(MB_CHAVE_BLE_SEMPRE, v ? '1' : '0'); } catch (e) { /* segue sem guardar */ } }

/* → { codigo, linhasAdicionadas, incluiu, motivoNao } */
function mbComBleAoVivo(codigo, forcar) {
  if (!forcar && !mbBleSempre()) return { codigo, linhasAdicionadas: 0, incluiu: false };
  if (/\bradio\./.test(codigo)) return { codigo, linhasAdicionadas: 0, incluiu: false, motivoNao: 'o programa usa Rádio, que não funciona junto com o Bluetooth' };
  const faltam = MB_SERVICOS_AO_VIVO.filter((c) => codigo.indexOf(c.slice(0, c.indexOf('('))) < 0);
  if (!faltam.length) return { codigo, linhasAdicionadas: 0, incluiu: false };
  return { codigo: faltam.join('; ') + ';\n' + codigo, linhasAdicionadas: 1, incluiu: true };
}

async function mbConstruirHex(codigo, opcoes) {
  if (!mbEhPython()) {
    const ao = mbComBleAoVivo(codigo, !!(opcoes && opcoes.forcarBle));
    if (ao.motivoNao) log('Bluetooth ao vivo não incluído: ' + ao.motivoNao + '.', 'fraco');
    const r = await MicrobitHex.compilarHexJS(ao.codigo, {
      bluetooth: /\bbluetooth\./.test(ao.codigo),
      arquivosExtras: mbArquivosExtrasJS(ao.codigo),
    });
    if (ao.incluiu) {
      if (r.ok) log('Bluetooth ao vivo incluído neste programa (opção do Painel ao vivo).', 'fraco');
      else if (r.erros) r.erros = r.erros.filter((e) => !(e.linha && e.linha <= ao.linhasAdicionadas))
        .map((e) => (e.linha ? Object.assign({}, e, { linha: e.linha - ao.linhasAdicionadas }) : e));
    }
    return r;
  }
  const v = await MicrobitHex.verificarPython(codigo);
  if (!v.ok) {
    return { ok: false, erros: (v.erros || []).map((t) => ({ linha: v.linha, texto: t })), mensagem: 'O código tem erros.', linhaUnica: v.linha };
  }
  const arquivos = Object.assign({ 'main.py': codigo }, mbArquivosExtrasPy(codigo));
  const r = await MicrobitHex.montarHexPython(arquivos);
  if (!r.ok) return { ok: false, erros: [], mensagem: r.erro };
  return { ok: true, hex: r.hex };
}

function mbMostrarErros(r) {
  mostrarPainelInf('saida');
  const erros = r.erros || [];
  if (!erros.length) log('✗ ' + (r.mensagem || 'O programa tem erros.'), 'erro');
  for (const e of erros.slice(0, 8)) log('✗ ' + (e.linha ? 'linha ' + e.linha + ': ' : '') + e.texto, 'erro');
  if (erros.length > 8) log('… e mais ' + (erros.length - 8) + ' erro(s).', 'fraco');
  if (estado.aba === 'blocos') log('O código gerado pelos Blocos não passou no compilador. Isso não deveria acontecer: avise o professor.', 'fraco');
  else if (erros[0] && erros[0].linha && typeof legoMostrarLinhaComErro === 'function') legoMostrarLinhaComErro(erros[0].linha);
}

/* Blocos: se o programa montado é o da missão aberta, a missão conta como concluída (uma vez). */
function mbTentarConcluirPorBlocos(codigo) {
  const fase = estado.fase;
  if (!fase || estado.aba !== 'blocos') return;
  if (typeof blocosGuiaConcluiu === 'function' && blocosGuiaConcluiu()) { blocosGuiaConcluirMissao(); return; }
  if (mbNormalizarCodigo(codigo) === mbNormalizarCodigo(fase.solucao)) {
    if (progresso.feitas[fase.id]) {
      registrarModoConcluido(fase, 'blocos');
      log('✓ Este é o programa da missão “' + fase.nome + '” — agora também feito em Blocos.', 'ok');
    } else concluirFase('blocos');
  } else {
    log('Missão aberta: “' + fase.nome + '”. Para concluí-la pelos Blocos, monte o mesmo programa da missão.', 'fraco');
  }
}

async function mbVerificar() {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  const c = mbCodigoParaPlaca();
  if (!c.ok) { mostrarPainelInf('saida'); log(c.erro, 'aviso'); return; }
  ocupar(true);
  barraIniciar('compilar');
  let ok = false;
  try {
    const r = await mbConstruirHex(c.codigo);
    if (r.ok) {
      ok = true;
      log('✓ Código conferido: compila sem erros' + (r.hex ? ' (' + Math.round(r.hex.length / 2048) + ' KB de .hex)' : '') + '.', 'ok');
      if (c.avisoBlocos) log('Aviso: ' + c.avisoBlocos, 'aviso');
      barraFinalizar(true, 'Código conferido.');
    } else {
      mbMostrarErros(r);
      barraFinalizar(false, 'O código tem erros — veja a Saída.');
    }
  } catch (e) {
    log('✗ Falha ao compilar: ' + (e && e.message ? e.message : e), 'erro');
    barraFinalizar(false, 'Falha ao compilar.');
  } finally { ocupar(false); }
  if (ok) mbTentarConcluirPorBlocos(c.codigo);
}

async function mbEnviar() {
  const usb = mbUSB();
  if (estado.ocupado || !estado.selecionouPlaca) return;
  if (!usb || !usb.conectado) {
    mostrarPainelInf('saida');
    const ble = mbBLE();
    if (ble && ble.conectado) {
      log('Nesta IDE o Bluetooth só mostra dados (Monitor e Painel ao vivo); a gravação por Bluetooth, que o app do celular faz, ainda não está implementada aqui. Para enviar, ligue o cabo USB e clique em “Conectar micro:bit” (ou tente Ferramentas → Enviar por Bluetooth, experimental). O Bluetooth cai durante a gravação e você reconecta depois.', 'aviso');
    } else {
      log('Conecte a micro:bit pelo cabo USB antes: clique em “Conectar micro:bit”, na barra de cima.', 'aviso');
    }
    return;
  }
  const c = mbCodigoParaPlaca();
  if (!c.ok) { mostrarPainelInf('saida'); log(c.erro, 'aviso'); return; }
  ocupar(true);
  barraIniciar('gravar');
  let ok = false, recado = '';
  try {
    const r = await mbConstruirHex(c.codigo);
    if (!r.ok) { mbMostrarErros(r); recado = 'O código tem erros — veja a Saída.'; return; }
    const ble = mbBLE();
    if (ble && ble.conectado) {
      /* gravar reinicia a placa e derruba o Bluetooth: melhor soltar antes, com aviso */
      log('Bluetooth desconectado: a micro:bit vai reiniciar ao receber o programa. Conecte de novo depois.', 'fraco');
      await ble.desconectar();
    }
    $('#barra-acao').textContent = 'Enviando para a micro:bit…';
    BARRA.teto = 0.97;
    BARRA.alvo = 0.3;
    const g = await usb.gravar(r.hex, (fracao) => { BARRA.alvo = Math.min(0.97, 0.3 + 0.67 * fracao); });
    if (!g.ok) { log('✗ ' + g.erro, 'erro'); recado = 'O envio falhou — veja a Saída.'; return; }
    ok = true;
    recado = 'Programa enviado! Olhe para a micro:bit.';
    log('✓ Programa enviado. A micro:bit reinicia sozinha e já roda.', 'ok');
    if (c.avisoBlocos) log('Aviso: ' + c.avisoBlocos, 'aviso');
    escreverMonitor('— programa enviado —', 'sis');
    zerarTracador();
    if (/\bserial\.|\bprint\(|bluetooth\.uart/.test(c.codigo)) mostrarPainelInf('monitor');
  } catch (e) {
    log('✗ ' + (e && e.message ? e.message : 'Não foi possível enviar o programa.'), 'erro');
    recado = 'Não foi possível enviar.';
  } finally {
    barraFinalizar(ok, recado);
    ocupar(false);
    mbAtualizarUI();
  }
  if (!ok) return;
  if (estado.aba === 'treino' && estado.treino && estado.treino.idx >= estado.treino.linhas.length) concluirFase('treino');
  else if (estado.aba === 'completo') oferecerConfirmacaoMb();
  else mbTentarConcluirPorBlocos(c.codigo);
}

/* ------------------------------------------------------------
 * Enviar por Bluetooth (EXPERIMENTAL): o mesmo serviço de gravação parcial que o app
 * do celular usa. Só JavaScript, placa em modo de pareamento, e só quando o runtime da
 * placa é o mesmo (a IDE monta o programa com o Bluetooth para isso). Passo 1: compila;
 * passo 2: um segundo clique abre a janela do Chrome (a janela exige um clique fresco).
 * ---------------------------------------------------------- */
async function mbEnviarPorBle() {
  if (estado.ocupado || !estado.selecionouPlaca || MB.conectandoBle) return;
  const ble = mbBLE();
  mostrarPainelInf('saida');
  if (mbEhPython()) { log('O MicroPython da micro:bit V2 não tem Bluetooth. Para enviar sem cabo, use a trilha JavaScript.', 'aviso'); return; }
  if (!ble || !ble.suportado() || typeof ble.gravar !== 'function') {
    log('Este navegador não tem Web Bluetooth. Use o Google Chrome ou o Microsoft Edge.', 'aviso'); return;
  }
  const c = mbCodigoParaPlaca();
  if (!c.ok) { log(c.erro, 'aviso'); return; }
  if (/\bradio\./.test(c.codigo)) { log('Este programa usa Rádio, que não funciona junto com o Bluetooth. Envie-o pelo cabo USB.', 'aviso'); return; }
  ocupar(true);
  barraIniciar('compilar');
  let r;
  try { r = await mbConstruirHex(c.codigo, { forcarBle: true }); }
  catch (e) {
    log('✗ Falha ao compilar: ' + (e && e.message ? e.message : e), 'erro');
    barraFinalizar(false, 'Falha ao compilar.'); ocupar(false); return;
  }
  if (!r.ok) { mbMostrarErros(r); barraFinalizar(false, 'O código tem erros — veja a Saída.'); ocupar(false); return; }
  barraFinalizar(true, 'Programa pronto para enviar.');
  ocupar(false);
  abrirModal('Enviar por Bluetooth (experimental)', `
    <p>O programa está pronto (com o Bluetooth ao vivo incluído). Antes de continuar:</p>
    <ol>
      <li>Ponha a micro:bit em <strong>modo de pareamento</strong>: segure <strong>A + B</strong>, aperte e solte o reset (atrás) e só solte A + B quando aparecer “PAIRING MODE!”.</li>
      <li>Desligue o Bluetooth do celular.</li>
      <li>Clique em <strong>Escolher a micro:bit e enviar</strong>, escolha “BBC micro:bit [nome]” e confirme o pareamento se o Windows pedir.</li>
    </ol>
    <p>Só funciona se a placa já estiver rodando um programa <strong>com Bluetooth</strong> (grave uma vez por USB com “Incluir em todo envio” ligado). Se o navegador não conseguir, a IDE avisa e você usa o cabo.</p>`,
    [{ rotulo: 'Cancelar' }, { rotulo: 'Escolher a micro:bit e enviar', primario: true, acao: () => { mbGravarPorBle(r.hex, c); } }]);
}

/* IMPORTANTE: chamado direto do clique do modal: ble.gravar abre a janela do Chrome. */
async function mbGravarPorBle(hex, c) {
  const ble = mbBLE();
  ocupar(true);
  barraIniciar('gravar');
  let ok = false, recado = '';
  try {
    if (ble.conectado) await ble.desconectar();
    $('#barra-acao').textContent = 'Escolha a micro:bit na janela do Chrome…';
    BARRA.teto = 0.97;
    BARRA.alvo = 0.15;
    await ble.gravar(hex, (p) => {
      $('#barra-acao').textContent = p.texto;
      if (typeof p.fracao === 'number') BARRA.alvo = Math.min(0.97, 0.3 + 0.67 * p.fracao);
    });
    ok = true;
    recado = 'Programa enviado por Bluetooth! Olhe para a micro:bit.';
    log('✓ Programa enviado por Bluetooth. A micro:bit reinicia sozinha. Para ver os dados ao vivo, clique em Bluetooth de novo (ela volta ao modo normal).', 'ok');
    if (c && c.avisoBlocos) log('Aviso: ' + c.avisoBlocos, 'aviso');
    escreverMonitor('— programa enviado por Bluetooth —', 'sis');
    zerarTracador();
  } catch (e) {
    mostrarPainelInf('saida');
    if (e && e.cancelou) { log('Envio por Bluetooth cancelado.', 'fraco'); recado = 'Envio cancelado.'; }
    else {
      log('✗ ' + ((e && e.mensagem) || 'Não foi possível enviar por Bluetooth.'), e && e.precisaUsb ? 'aviso' : 'erro');
      log('O envio por Bluetooth é experimental: se não der, use o cabo USB (Conectar micro:bit → Enviar).', 'fraco');
      recado = 'Não foi possível enviar por Bluetooth.';
    }
  } finally {
    barraFinalizar(ok, recado);
    ocupar(false);
    mbAtualizarUI();
  }
  if (!ok) return;
  if (estado.aba === 'treino' && estado.treino && estado.treino.idx >= estado.treino.linhas.length) concluirFase('treino');
  else if (estado.aba === 'completo') oferecerConfirmacaoMb();
  else mbTentarConcluirPorBlocos(c.codigo);
}

function oferecerConfirmacaoMb() {
  const fase = estado.fase;
  const contexto = chaveCursoAtual;
  if (!fase) return;
  abrirModal('Observe sua micro:bit', `<p>${escapar(fase.resultado)}</p><p>O envio terminou. Confira o resultado físico antes de concluir a atividade.</p>`, [
    { rotulo: 'Continuar explorando' },
    { rotulo: 'Observei o resultado', primario: true, acao: () => { if (fase === estado.fase && contexto === chaveCursoAtual) concluirFase('completo'); } },
  ]);
}

/* Baixar o .hex: para quem não usa a conexão USB (arrastar o arquivo para a unidade MICROBIT). */
async function mbBaixarHex() {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  const c = mbCodigoParaPlaca();
  if (!c.ok) { mostrarPainelInf('saida'); log(c.erro, 'aviso'); return; }
  ocupar(true);
  barraIniciar('compilar');
  try {
    const r = await mbConstruirHex(c.codigo);
    if (!r.ok) { mbMostrarErros(r); barraFinalizar(false, 'O código tem erros — veja a Saída.'); return; }
    baixarArquivo('programa.hex', r.hex, 'application/octet-stream');
    log('✓ Arquivo programa.hex baixado. Conecte a micro:bit e arraste o arquivo para a unidade MICROBIT.', 'ok');
    barraFinalizar(true, 'Arquivo .hex baixado.');
  } catch (e) {
    log('✗ Falha ao gerar o .hex: ' + (e && e.message ? e.message : e), 'erro');
    barraFinalizar(false, 'Falha ao gerar o .hex.');
  } finally { ocupar(false); }
}

/* ------------------------------------------------------------
 * Monitor Serial: o que a micro:bit escreve e o que o aluno digita
 * ---------------------------------------------------------- */
async function mbEnviarStdin(texto, final) {
  const usb = mbUSB();
  const ble = mbBLE();
  /* USB tem preferência; sem cabo, o texto vai pelo UART do Bluetooth */
  const canal = usb && usb.conectado ? usb : (ble && ble.conectado ? ble : null);
  if (!canal) { escreverMonitor('Conecte a micro:bit (USB ou Bluetooth) antes de enviar.', 'sis'); return false; }
  const fim = { nada: '', nl: '\n', cr: '\r', nlcr: '\r\n' }[final] ?? '\n';
  const r = await canal.escrever(texto + fim);
  if (!r.ok) { escreverMonitor('Não foi possível enviar: ' + r.erro, 'sis'); return false; }
  return true;
}

/* ------------------------------------------------------------
 * Exemplos (menu Arquivo → Exemplos): cada missão, no Editor ou em Blocos
 * ---------------------------------------------------------- */
function mbAbrirExemploEditor(f) {
  const ta = irParaEditorLivre();
  ta.value = f.solucao;
  renderLivre(); atualizarBotoes(); atualizarCursor();
  $('#rotulo-sketch').textContent = mbNomeArquivo(f);
  log(`Exemplo carregado: ${f.missao} — ${f.nome}`, 'info');
}

function mbAbrirExemploBlocos(f) {
  if (!f.blocos) return;
  trocarAba('blocos');
  const ws = estadoBlocos.workspace;
  if (ws && ws.getTopBlocks(false).length && !confirm('Abrir “' + f.nome + '” em blocos? Os blocos que estão na tela serão substituídos.')) return;
  if (!blocosCarregarWorkspace(JSON.parse(JSON.stringify(f.blocos)))) { log('Não consegui abrir o exemplo: a área de blocos ainda não carregou.', 'erro'); return; }
  $('#rotulo-sketch').textContent = 'blocos_' + f.id + (mbEhPython() ? '.py' : '.js');
  log(`Exemplo em blocos: ${f.missao} — ${f.nome}`, 'info');
}

/* Programas prontos (js/microbit_exemplos.js): em JavaScript ou MicroPython, conforme a trilha. */
function mbAbrirProgramaPronto(ex) {
  const py = mbEhPython();
  const codigo = py ? ex.py : ex.js;
  if (!codigo) { log('“' + ex.nome + '” só existe na trilha JavaScript.', 'aviso'); return; }
  const ta = irParaEditorLivre();
  ta.value = codigo;
  renderLivre(); atualizarBotoes(); atualizarCursor();
  $('#rotulo-sketch').textContent = 'exemplo_' + ex.id.replace(/-/g, '_') + (py ? '.py' : '.js');
  log('Programa pronto carregado: ' + ex.nome + '. ' + ex.descricao, 'info');
}

function mbItensProgramasProntos() {
  const py = mbEhPython();
  return MB_EXEMPLOS.map((ex) => ({
    rotulo: ex.nome + ((py ? ex.py : ex.js) ? '' : ' (só JavaScript)'),
    acao: () => mbAbrirProgramaPronto(ex),
  }));
}

function mbItensExemplos() {
  return [{ rotulo: 'Programas prontos', submenu: mbItensProgramasProntos }, { sep: true }].concat(MODULOS.map((m) => ({
    rotulo: m.nome,
    submenu: () => fasesDoModulo(m.id).flatMap((f) => [
      { rotulo: `${f.missao} — ${f.nome} (código)`, acao: () => mbAbrirExemploEditor(f) },
      { rotulo: `${f.missao} — ${f.nome} (blocos)`, acao: () => mbAbrirExemploBlocos(f) },
    ]),
  })));
}

function mbNomeArquivo(fase) {
  const slug = fase.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `${fase.id}_${slug}.${mbEhPython() ? 'py' : 'js'}`;
}

/* ------------------------------------------------------------
 * Ajuda
 * ---------------------------------------------------------- */
function mbTabelaLigacoes() {
  const P = MB_PINOS;
  const linhas = [
    ['LED vermelho / amarelo / verde', `P${P.led.vermelho} / P${P.led.amarelo} / P${P.led.verde}`],
    ['Botões externos', `P${P.botao.um} e P${P.botao.dois}`],
    ['Potenciômetro', `P${P.pot}`],
    ['Ultrassônico (trig / echo)', `P${P.ultra.trig} / P${P.ultra.echo}`],
    ['Buzzer', `P${P.buzzer}`],
    ['Servo motor', `P${P.servo}`],
    ['Display de 7 segmentos (a b c d e f g DP)', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((k) => 'P' + P.seteSeg[k]).join(' · ')],
    ['LCD 16x2 I2C (SCL / SDA)', `P${P.lcd.scl} / P${P.lcd.sda} · endereço 0x${P.lcd.endereco.toString(16).toUpperCase()}`],
  ];
  return '<table class="mb-ligacao"><tr><th>Componente</th><th>Pino(s)</th></tr>' +
    linhas.map(([a, b]) => `<tr><td>${escapar(a)}</td><td>${escapar(b)}</td></tr>`).join('') + '</table>';
}

function mbAjuda() {
  abrirModal('micro:bit V2 · conectar e programar',
    '<h4>Conectar a micro:bit</h4>' +
    '<ul><li>Use o <b>Google Chrome</b> ou o <b>Microsoft Edge</b>: são os que conversam com a USB pela página da web.</li>' +
    '<li>Ligue a micro:bit ao computador com um cabo USB <b>de dados</b> (cabos só de carga não funcionam).</li>' +
    '<li>Feche as abas do makecode.microbit.org e do python.microbit.org: a micro:bit aceita uma conexão só.</li>' +
    '<li>Clique em <b>Conectar micro:bit</b> e escolha “BBC micro:bit CMSIS-DAP” na lista.</li></ul>' +
    '<h4>Programar</h4>' +
    '<ul><li><b>Verificar</b> compila o programa aqui no navegador, sem precisar da placa. <b>Upload</b> envia para a micro:bit, que reinicia e já roda.</li>' +
    '<li>Em <b>Blocos</b> o código aparece ao lado, em JavaScript ou MicroPython (botões JS e Py).</li>' +
    '<li>O que o programa escreve na serial (<code>serial.writeLine</code> / <code>print</code>) aparece no <b>Monitor Serial</b>.</li>' +
    '<li>Sem conexão USB? <b>Sketch → Baixar .hex</b> e arraste o arquivo para a unidade MICROBIT.</li></ul>' +
    '<h4>A micro:bit não aparece na lista</h4>' +
    '<ul><li>Troque o cabo e a porta USB. Confira se a luz de trás da placa está acesa.</li>' +
    '<li>Se ela aparece como unidade MICROBIT no computador, a conexão está boa.</li>' +
    '<li>Só a micro:bit <b>V2</b> funciona nesta IDE.</li></ul>' +
    '<h4>Ligações dos componentes externos</h4>' + mbTabelaLigacoes() +
    '<p><small>A tabela vem do adaptador da sala. Se o seu adaptador for diferente, avise o professor.</small></p>');
}

function mbReferencia() {
  const py = mbEhPython();
  const cats = MB_CATEGORIAS.filter((c) => !c.custom);
  let html = '<p>Blocos da micro:bit e o código de cada um em ' + (py ? 'MicroPython' : 'JavaScript') + '. Os blocos marcados com — não existem em MicroPython.</p>';
  for (const c of cats) {
    const blocos = MB_BLOCOS.filter((b) => b.cat === c.id && b.forma !== 'evento');
    if (!blocos.length) continue;
    html += '<h4>' + escapar(c.rotulo) + '</h4><div class="lista-itens">' + blocos.map((b) => {
      const modelo = py ? b.py : b.js;
      return `<div class="item-lista"><span class="nome">${escapar(b.msg.replace(/[{}]/g, ''))}</span><span class="ver"><code>${modelo ? escapar(modelo) : '—'}</code></span><span></span></div>`;
    }).join('') + '</div>';
  }
  abrirModal('Referência rápida da micro:bit', html);
}

function mbSobre() {
  return '<p>Placa BBC micro:bit V2: o JavaScript é compilado aqui no navegador pelo compilador do <b>MakeCode</b> (Microsoft, licença MIT), ' +
    'e o MicroPython usa o firmware oficial <b>MicroPython for micro:bit</b> (MIT). O envio pela USB usa ' +
    '<code>@microbit/microbit-connection</code> e os arquivos do MicroPython, <code>@microbit/microbit-fs</code> (MIT). ' +
    'BBC micro:bit é marca da Micro:bit Educational Foundation, que não tem relação com este curso.</p>';
}

/* ------------------------------------------------------------
 * Ligar / desligar o modo micro:bit (chamado por selecionarCurso)
 * ---------------------------------------------------------- */
function mbAtivar(sim) {
  const era = MB.ativo;
  MB.ativo = !!sim;
  $('#mb-hub').hidden = !sim;
  document.body.classList.toggle('modo-microbit', !!sim);
  if (sim) {
    $('#curso-barra').hidden = true;
    $('#aba-treino').hidden = false;
    $('#aba-completo').hidden = false;
    $('#aba-blocos').hidden = false;
    $('#bt-mon-ligar').hidden = true;
    $('#mon-baud').hidden = true;
    $('#mon-texto').placeholder = 'texto para a micro:bit… (Enter envia)';
    if (typeof MON_LEGO !== 'undefined') MON_LEGO.buffer = null;
    mbAtualizarUI();
    mbAtualizarBotaoPaleta();
    if (!mbSuportado()) log('Este navegador não tem WebUSB. Use o Google Chrome ou o Microsoft Edge para conectar a micro:bit. Você ainda pode montar programas, usar Verificar e baixar o .hex.', 'aviso');
  } else if (era) {
    /* sair da placa solta a USB: só uma conexão por vez */
    const usb = mbUSB();
    if (usb) usb.liberar().catch(() => {});
    const ble = mbBLE();
    if (ble) ble.liberar().catch(() => {});
    if (typeof MbAoVivo !== 'undefined') MbAoVivo.zerar();
    $('#aba-aovivo').hidden = true;
    if (estado.painelInf === 'aovivo') mostrarPainelInf('saida');
    $('#bt-mon-ligar').hidden = false;
    $('#mon-baud').hidden = false;
    $('#mon-texto').placeholder = 'mensagem para a placa… (Enter envia)';
    const e = $('#mon-estado');
    e.textContent = 'desconectado';
    e.classList.remove('ligado');
    $('#trac-estado').textContent = 'use o Monitor Serial para conectar';
    if (typeof MON_LEGO !== 'undefined') MON_LEGO.buffer = null;
    mbAtualizarBotaoPaleta();
  }
}

/* ------------------------------------------------------------
 * Blocos por missão: rascunho próprio e paleta da missão
 * ---------------------------------------------------------- */
/* Tipos de bloco da missão (o que o aluno precisa para montar o programa). Os números e textos
   já vêm prontos nos encaixes da toolbox, então não entram na paleta. */
function mbPaletaDaFase(fase) {
  const tipos = mbTiposDoWorkspace(fase.blocos);
  tipos.delete('math_number');
  tipos.delete('text');
  return tipos;
}

/* Os blocos da missão (paleta e rascunho por missão) agora são o modo Guiado de blocos_guia.js;
   o modo Livre tem todos os blocos e um rascunho só. */
function mbAtualizarBotaoPaleta() {
  const linha = document.getElementById('mb-paleta-linha');
  if (linha) linha.hidden = true;
}

/* Mensagens ao entrar na placa (depois de abrir a primeira missão). */
function mbAoEntrar() {
  log('BBC micro:bit V2 — ' + (mbEhPython() ? 'MicroPython' : 'JavaScript') + '. Conecte o cabo USB e clique em “Conectar micro:bit”.', 'info');
  log('Sem a placa por perto? “Verificar” confere o programa aqui mesmo, e você pode baixar o .hex.', 'fraco');
}

document.addEventListener('DOMContentLoaded', () => {
  const usb = mbUSB();
  $('#bt-mb-conectar').addEventListener('click', mbConectarOuDesconectar);

  if (usb) {
    usb.on('estado', () => { mbAtualizarUI(); if (MB.ativo) atualizarBotoes(); });
    usb.on('texto', (t) => { if (MB.ativo && typeof monitorReceberTexto === 'function') monitorReceberTexto(t); });
    usb.on('erro', (msg) => { if (MB.ativo) log('Aviso da micro:bit: ' + msg, 'aviso'); });
    usb.on('desconectou', () => {
      if (!MB.ativo) return;
      log('micro:bit desconectada.', 'aviso');
      escreverMonitor('— micro:bit desconectada —', 'sis');
      mbAtualizarUI();
      atualizarBotoes();
    });
  }

  const ble = mbBLE();
  const btBle = $('#bt-mb-ble');
  if (btBle) btBle.addEventListener('click', mbConectarOuDesconectarBle);
  $('#bt-av-ajuda').addEventListener('click', mbAjudaBluetooth);
  const btAvEnviar = $('#bt-av-enviar');
  if (btAvEnviar) btAvEnviar.addEventListener('click', mbEnviarPorBle);
  const chkSempre = $('#av-sempre');
  if (chkSempre) {
    chkSempre.checked = mbBleSempre();
    chkSempre.addEventListener('change', () => {
      mbDefinirBleSempre(chkSempre.checked);
      log(chkSempre.checked
        ? 'Bluetooth ao vivo será incluído em todo programa JavaScript enviado por USB (menos os que usam Rádio).'
        : 'Bluetooth ao vivo não será mais incluído automaticamente.', 'fraco');
    });
  }
  $('#bt-av-calibrar').addEventListener('click', async () => {
    const r = ble && await ble.calibrarBussola();
    if (r && !r.ok) log('✗ ' + r.erro, 'erro');
    else log('Calibração da bússola pedida: incline a placa até encher a tela de LEDs.', 'info');
  });
  if (ble) {
    ble.on('estado', () => { mbAtualizarBle(); if (MB.ativo) atualizarBotoes(); });
    ble.on('texto', (t) => { if (MB.ativo && typeof monitorReceberTexto === 'function') monitorReceberTexto(t); });
    ble.on('dados', (d) => { if (MB.ativo && typeof MbAoVivo !== 'undefined') MbAoVivo.aplicar(d); });
    ble.on('erro', (msg) => { if (MB.ativo) log('Aviso do Bluetooth: ' + msg, 'aviso'); });
    ble.on('desconectou', () => {
      if (!MB.ativo) return;
      log('Bluetooth desconectado (a micro:bit reiniciou, desligou ou saiu do alcance).', 'aviso');
      escreverMonitor('— Bluetooth desconectado —', 'sis');
      if (typeof MbAoVivo !== 'undefined') MbAoVivo.zerar();
      mbAtualizarBle();
    });
  }

  /* alternar JS | Python no painel de código dos Blocos (só para ler) */
  const visao = document.getElementById('mb-visao');
  if (visao) visao.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-visao]');
    if (!b || typeof blocosMbReconfigurar !== 'function') return;
    const doCurso = mbEhPython() ? 'micropython' : 'js';
    blocosMbReconfigurar({ visao: b.dataset.visao === doCurso ? null : b.dataset.visao });
  });


  const aviso = document.getElementById('mb-card-aviso');
  if (aviso) aviso.hidden = mbSuportado();
});
