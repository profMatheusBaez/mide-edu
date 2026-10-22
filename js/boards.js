'use strict';
const rascunhosCursos = new Map();
let chaveCursoAtual = 'uno-cpp';

function realcarPython(codigo) {
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|\b(?:from|import|while|True|False|None|if|elif|else|def|return|and|or|not|pass|for|in)\b|\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)\b)/g;
  return codigo.split('\n').map(l => {
    let html = '', ultimo = 0;
    for (const m of l.matchAll(regex)) {
      html += escapar(l.slice(ultimo, m.index));
      const tipo = m[0][0] === '#' ? 't-com' : /^['"]/.test(m[0]) ? 't-const' : /^\d/.test(m[0]) ? 't-num' : 't-keyword';
      html += `<span class="${tipo}">${escapar(m[0])}</span>`;
      ultimo = m.index + m[0].length;
    }
    return html + escapar(l.slice(ultimo)) || '&nbsp;';
  }).join('\n');
}

function mostrarSeletorPlaca() {
  if (estado.ocupado) return;
  const dialog = $('#board-picker');
  $('#app').inert = true;
  $('#board-cancel').hidden = !estado.selecionouPlaca;
  $('#board-language').hidden = true;
  $('#board-language-mb').hidden = true;
  $('#choose-k10').setAttribute('aria-pressed', 'false');
  $('#choose-microbit').setAttribute('aria-pressed', 'false');
  if (!dialog.open) dialog.showModal();
  $('#choose-uno').focus();
}

function selecionarCurso(placa, linguagem = 'cpp') {
  if (placa === 'microbit' && linguagem === 'cpp') linguagem = 'js';   // micro:bit: JavaScript (MakeCode) ou MicroPython
  const linguagensOk = placa === 'microbit' ? ['js', 'micropython'] : ['cpp', 'micropython'];
  if (estado.ocupado || !['uno', 'k10', 'lego', 'microbit'].includes(placa) || !linguagensOk.includes(linguagem)) return;
  if (placa === 'uno') linguagem = 'cpp';
  if (placa === 'lego') linguagem = 'micropython';   // Pybricks: só Python
  if (placa === 'k10' && linguagem === 'cpp' && typeof MIDE_WEB !== 'undefined' && MIDE_WEB) {
    /* no site não há arduino-cli para compilar C++ do ESP32: a K10 vai em MicroPython */
    linguagem = 'micropython';
    if (typeof log === 'function') log('No site, a K10 é programada em MicroPython. O C++ da K10 funciona na MIDE instalada no laboratório (INSTALAR.bat).', 'info');
  }
  if (estado.selecionouPlaca) {
    salvarProgresso();
    rascunhosCursos.set(chaveCursoAtual, { indice: estado.indice, codigo: $('#editor-livre').value });
  }
  const mudou = estado.placaCurso !== placa || estado.linguagem !== linguagem;
  if (mudou && typeof api === 'function') api('/api/monitor', { acao: 'fechar' }).catch(() => {});
  estado.placaCurso = placa;
  estado.linguagem = linguagem;
  estado.selecionouPlaca = true;
  chaveCursoAtual = `${placa}-${linguagem}`;
  CHAVE = placa === 'uno' ? 'arduino_academy_ide_v1' : (placa === 'lego' ? 'academy_lego_v1' : (placa === 'microbit' ? `academy_microbit_${linguagem}_v1` : `academy_k10_${linguagem}_v1`));
  let salvo = {};
  try { salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (_) {}
  progresso.xp = Number.isFinite(salvo.xp) ? salvo.xp : 0;
  progresso.feitas = salvo.feitas && typeof salvo.feitas === 'object' ? salvo.feitas : {};
  progresso.modos = salvo.modos && typeof salvo.modos === 'object' ? salvo.modos : {};   // micro:bit: em que modo cada missão foi feita
  /* LEGO: sem currículo nesta versão — só exploração + Exemplos (lego.js) */
  MODULOS = placa === 'uno' ? CURSO_UNO.modulos : (placa === 'lego' ? [] : (placa === 'microbit' ? MB_MODULOS : K10_MODULOS));
  FASES = placa === 'uno' ? CURSO_UNO.fases : (placa === 'lego' ? [] : (placa === 'microbit' ? criarCursoMicrobit(linguagem) : criarCursoK10(linguagem)));
  estado.fqbn = placa === 'uno' ? 'arduino:avr:uno' : (placa === 'lego' ? 'lego:pybricks:technichub' : (placa === 'microbit' ? MB_FQBN : K10_FQBN));
  estado.abertos = new Set();
  estado.treino = null;
  $('#overlay').classList.add('oculto');
  document.body.dataset.placa = placa;
  $('#curso-barra').hidden = placa !== 'k10';
  if (placa === 'k10') $('#curso-linguagem').value = linguagem;
  $('#aba-completo').hidden = placa !== 'k10' && placa !== 'microbit';
  $('#aba-blocos').hidden = placa === 'k10';
  $('#aba-joystick').hidden = placa !== 'uno';
  if (typeof legoAtivar === 'function') legoAtivar(placa === 'lego');
  if (typeof blocosTrocarPerfil === 'function') blocosTrocarPerfil(placa === 'lego' ? 'lego' : (placa === 'microbit' ? 'microbit' : 'uno'));
  if (placa === 'microbit' && typeof blocosMbReconfigurar === 'function') blocosMbReconfigurar({ visao: null, paleta: null });   // a linguagem do curso pode ter mudado
  if (typeof mbAtivar === 'function') mbAtivar(placa === 'microbit');
  if (typeof k10WebAtivar === 'function') k10WebAtivar(typeof k10Navegador === 'function' && k10Navegador());   // depois do LEGO e da micro:bit, que também mexem na barra
  $('#aba-livre').innerHTML = placa === 'microbit'
    ? (linguagem === 'micropython' ? 'Editor MicroPython' : 'Editor JavaScript')
    : (linguagem === 'micropython' ? 'Editor Python' : 'Editor C++');
  $('#editor-livre').setAttribute('aria-label', placa === 'microbit'
    ? (linguagem === 'micropython' ? 'Editor de código MicroPython' : 'Editor de código JavaScript')
    : (linguagem === 'micropython' ? 'Editor MicroPython' : 'Editor de código C++'));
  if (placa === 'k10' || placa === 'microbit') $('#mon-baud').value = '115200';
  if (placa === 'lego') $('#mon-baud').value = '115200';
  $('.curriculo-cab h2').innerHTML = `${placa === 'uno' ? 'CURRÍCULO ARDUINO' : (placa === 'microbit' ? 'CURRÍCULO MICRO:BIT' : 'CURRÍCULO K10')}<small>${MODULOS.length} módulos · ${FASES.length} missões</small>`;
  const rascunho = rascunhosCursos.get(chaveCursoAtual);
  if (placa === 'lego') {
    legoAoEntrar(rascunho);
    renderLateral();
  } else {
    let indice = rascunho?.indice ?? FASES.findIndex(f => !progresso.feitas[f.id]);
    if (indice < 0 || !desbloqueada(indice)) indice = 0;
    abrirFase(indice);
    if (rascunho) { $('#editor-livre').value = rascunho.codigo; renderLivre(); }
  }
  if (placa === 'microbit' && typeof mbAoEntrar === 'function') mbAoEntrar();
  atualizarPlacaStatus();
  aoTrocarPorta();
  atualizarControlesCurso();
  $('#app').inert = false;
  if ($('#board-picker').open) $('#board-picker').close();
  (placa === 'lego' ? $('#aba-blocos') : $('#aba-treino')).focus();
}

function atualizarControlesCurso() {
  const py = estado.linguagem === 'micropython';
  const lego = estado.placaCurso === 'lego';
  const mb = estado.placaCurso === 'microbit';
  $('#bt-upload span').textContent = lego ? 'Enviar e rodar' : (mb ? 'Enviar' : (py ? 'Enviar e executar' : 'Upload'));
  $('#bt-compilar').title = lego ? 'Verificar: compila o Python aqui no navegador, sem precisar do hub' : (mb ? 'Verificar: compila o programa aqui no navegador, sem precisar da micro:bit (Ctrl+R)' : (py ? 'Conferir a sintaxe Python (bibliotecas são verificadas na placa)' : 'Compilar sem gravar'));
  if (lego && typeof legoAtualizarUI === 'function') legoAtualizarUI();
  if (mb && typeof mbAtualizarUI === 'function') mbAtualizarUI();
  for (const id of ['bt-trocar-placa', 'curso-linguagem', 'bt-preparar-k10', 'bt-mapa-k10']) {
    if ($('#' + id)) $('#' + id).disabled = estado.ocupado;
  }
}

function oferecerConfirmacaoK10() {
  const fase = estado.fase;
  const contexto = chaveCursoAtual;
  abrirModal('Observe sua K10', `<p>${escapar(fase.resultado)}</p><p>O envio terminou. Confira o resultado físico antes de concluir a atividade.</p>`, [
    { rotulo: 'Continuar explorando' },
    { rotulo: 'Observei o resultado', primario: true, acao: () => { if (fase === estado.fase && contexto === chaveCursoAtual) concluirFase(); } },
  ]);
}

async function executarMicroPython(enviar) {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  if (typeof k10Navegador === 'function' && k10Navegador()) return k10WebExecutar(enviar);   // Chrome/Edge: direto pela USB, sem mpremote
  const codigo = codigoAtual();
  if (!codigo.trim()) return log('Escreva um programa antes de continuar.', 'aviso');
  ocupar(true);
  mostrarPainelInf('saida');
  barraIniciar(enviar ? 'gravar' : 'compilar');
  try {
    const r = await api('/api/micropython', { acao: enviar ? 'enviar' : 'verificar', codigo, porta: $('#porta').value, placa: 'k10' });
    logBloco(r.log, r.ok ? 'ok' : 'erro');
    barraFinalizar(r.ok, r.ok ? (enviar ? 'Programa enviado. Confira a K10.' : 'Sintaxe conferida. Teste as bibliotecas na placa.') : 'Veja a explicação na Saída.');
    if (r.ok && enviar) {
      if (estado.aba === 'treino' && estado.treino?.idx >= estado.treino?.linhas.length) concluirFase();
      else if (estado.aba === 'completo') oferecerConfirmacaoK10();
    }
  } catch (e) {
    log('Não foi possível conversar com o servidor: ' + e.message, 'erro');
    barraFinalizar(false, 'Servidor indisponível.');
  } finally { ocupar(false); }
}

function prepararK10() {
  if (estado.ocupado) return;
  const py = estado.linguagem === 'micropython';
  if (py && typeof k10Navegador === 'function' && k10Navegador()) return k10WebPreparar();
  const corpo = py
    ? '<p>Para executar Python, a K10 precisa do firmware MicroPython específico da placa e de suas bibliotecas.</p><ol><li>Conecte a K10 e selecione a porta USB.</li><li>Se ela ainda estiver em C++, prepare o firmware seguindo o guia oficial abaixo.</li><li>Use <b>Testar conexão</b>. Depois envie a atividade.</li></ol><p><a href="https://www.unihiker.com/wiki/K10/GettingStarted/gettingstarted_mpy/" target="_blank" rel="noopener">Abrir preparação oficial do MicroPython ↗</a></p><div class="k10-notice">A troca de linguagem na IDE preserva seus estudos. Instalar outro firmware altera o programa que está na placa. Salve seus arquivos antes dessa preparação.</div>'
    : '<p>O curso usa o pacote oficial UNIHIKER 0.0.5 e habilita a comunicação USB para o Monitor Serial.</p><ol><li>Conecte a placa e selecione a porta.</li><li>Instale o suporte C++ neste computador.</li><li>Abra a atividade, confira o código e clique em Upload.</li></ol><p>Se a placa estiver em MicroPython, o upload C++ substitui esse ambiente. Guarde seus arquivos Python antes de mudar.</p>';
  abrirModal('Preparar UNIHIKER K10 · ' + (py ? 'MicroPython' : 'C++'), corpo + '<pre id="k10-preparo-resultado" class="k10-result" aria-live="polite"></pre>', [
    { rotulo: 'Fechar' },
    { rotulo: py ? 'Testar conexão' : 'Instalar suporte C++', primario: true, acao: () => {
      if (estado.ocupado) return false;
      if (py && !$('#porta').value) { $('#k10-preparo-resultado').textContent = 'Selecione a porta da placa na barra da IDE.'; return false; }
      ocupar(true);
      const campo = $('#k10-preparo-resultado');
      campo.textContent = py ? 'Verificando a K10…' : 'Preparando o suporte. O primeiro download pode demorar alguns minutos…';
      api(py ? '/api/micropython' : '/api/k10/preparar', { acao: 'conectar', porta: $('#porta').value }).then(r => { campo.textContent = r.log; }).catch(e => { campo.textContent = e.message; }).finally(() => ocupar(false));
      return false;
    } },
  ]);
}

function mostrarMapaK10() {
  abrirModal('Sua trilha UNIHIKER K10',
    `<p><b>Disponível agora:</b> ${K10_MODULOS.length} módulos e ${FASES.length || K10_MODULOS.length * 5} atividades, cada uma com versão C++ e MicroPython.</p>` +
    '<ol class="k10-next">' + K10_MODULOS.map(n => `<li>${escapar(n.nome)}</li>`).join('') + '</ol>' +
    '<p><b>Próxima camada:</b> ' + K10_PROXIMOS.map(escapar).join(', ') + '.</p>');
}

document.addEventListener('DOMContentLoaded', () => {
  $('#bt-trocar-placa').addEventListener('click', mostrarSeletorPlaca);
  $('#choose-uno').addEventListener('click', () => selecionarCurso('uno'));
  $('#choose-lego').addEventListener('click', () => selecionarCurso('lego', 'micropython'));
  $('#choose-microbit').addEventListener('click', () => {
    $('#choose-microbit').setAttribute('aria-pressed', 'true');
    $('#choose-k10').setAttribute('aria-pressed', 'false');
    $('#board-language').hidden = true;
    $('#board-language-mb').hidden = false;
    $('#board-language-mb').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('[data-mb-language="js"]').focus();
  });
  document.querySelectorAll('[data-mb-language]').forEach(b => b.addEventListener('click', () => selecionarCurso('microbit', b.dataset.mbLanguage)));
  $('#choose-k10').addEventListener('click', () => {
    $('#choose-k10').setAttribute('aria-pressed', 'true');
    $('#choose-microbit').setAttribute('aria-pressed', 'false');
    $('#board-language-mb').hidden = true;
    $('#board-language').hidden = false;
    $('#board-language').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('#board-language button:not(:disabled)').focus();   // no site o C++ fica desativado
  });
  document.querySelectorAll('[data-language]').forEach(b => b.addEventListener('click', () => selecionarCurso('k10', b.dataset.language)));
  $('#board-theme').addEventListener('click', alternarTema);
  $('#board-cancel').addEventListener('click', () => { $('#board-picker').close(); $('#app').inert = false; $('#bt-trocar-placa').focus(); });
  $('#board-picker').addEventListener('cancel', e => { if (!estado.selecionouPlaca) e.preventDefault(); else $('#app').inert = false; });
  $('#curso-linguagem').addEventListener('change', e => selecionarCurso('k10', e.target.value));
  $('#bt-preparar-k10').addEventListener('click', prepararK10);
  $('#bt-mapa-k10').addEventListener('click', mostrarMapaK10);
  mostrarSeletorPlaca();
});
