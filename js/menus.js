/* ============================================================
 * menus.js — barra de menus, diálogos e ações do Arduino IDE
 * ------------------------------------------------------------
 * Arquivo, Editar, Sketch, Ferramentas e Ajuda, com os mesmos
 * itens e atalhos do Arduino IDE, funcionando de verdade.
 * ============================================================ */
'use strict';

/* ------------------------------------------------------------
 * Diálogo genérico
 * ---------------------------------------------------------- */
let fecharModalAtual = null;

function abrirModal(titulo, corpoHTML, botoes) {
  $('#modal-titulo').textContent = titulo;
  $('#modal-corpo').innerHTML = corpoHTML;
  const pe = $('#modal-pe');
  pe.innerHTML = '';
  (botoes || [{ rotulo: 'Fechar', primario: true }]).forEach((b) => {
    const el = criar('button', b.primario ? 'primario' : '');
    el.textContent = b.rotulo;
    el.addEventListener('click', () => {
      if (!b.acao || b.acao() !== false) fecharModal();
    });
    pe.appendChild(el);
  });
  $('#modal').classList.remove('oculto');
  fecharModalAtual = fecharModal;
  const primeiro = $('#modal-corpo').querySelector('input, select, button');
  if (primeiro) primeiro.focus();
}

function fecharModal() {
  $('#modal').classList.add('oculto');
  fecharModalAtual = null;
}

/* ------------------------------------------------------------
 * Ajudantes de arquivo
 * ---------------------------------------------------------- */
function baixarArquivo(nome, conteudo, tipo) {
  const blob = new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = criar('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function irParaEditorLivre() {
  if (estado.aba !== 'livre') trocarAba('livre');
  return $('#editor-livre');
}

function nomeEditorLivre() {
  if (estado.placaCurso === 'microbit') return estado.linguagem === 'micropython' ? 'Editor MicroPython' : 'Editor JavaScript';
  return estado.linguagem === 'micropython' ? 'Editor MicroPython' : 'Editor C++';
}

/* ------------------------------------------------------------
 * ARQUIVO
 * ---------------------------------------------------------- */
function acNovoSketch() {
  const ta = irParaEditorLivre();
  if (ta.value.trim() && ta.value !== ESQUELETO && !(estado.placaCurso === 'lego' && ta.value === LEGO_MODELO_PY) &&
      !confirm(`Começar um programa novo? O que está no ${nomeEditorLivre()} será perdido.`)) return;
  ta.value = estado.placaCurso === 'lego' ? LEGO_MODELO_PY
    : estado.placaCurso === 'microbit' ? (estado.linguagem === 'micropython' ? MB_STARTER.micropython : MB_STARTER.js)
    : estado.linguagem === 'micropython' ? '# Seu programa MicroPython\n' : (estado.placaCurso === 'k10' ? k10Cpp('') : ESQUELETO);
  renderLivre(); atualizarBotoes(); atualizarCursor();
  $('#rotulo-sketch').textContent = estado.placaCurso === 'microbit' ? (estado.linguagem === 'micropython' ? 'main.py' : 'main.js') : (estado.linguagem === 'micropython' ? 'main.py' : 'sketch_novo.ino');
  log(`Novo programa criado no ${nomeEditorLivre()}.`, 'info');
}

function acAbrirSketch() {
  const inp = criar('input');
  inp.type = 'file';
  inp.accept = estado.linguagem === 'micropython' ? '.py,.txt' : (estado.placaCurso === 'microbit' ? '.js,.ts,.txt' : '.ino,.cpp,.c,.h,.txt');
  inp.addEventListener('change', () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      const ta = irParaEditorLivre();
      ta.value = String(leitor.result);
      renderLivre(); atualizarBotoes(); atualizarCursor();
      $('#rotulo-sketch').textContent = f.name;
      log(`Aberto: ${f.name}`, 'info');
    };
    leitor.readAsText(f, 'utf-8');
  });
  inp.click();
}

function acSalvarComo() {
  const codigo = codigoAtual();
  if (!codigo.trim()) { log('Não há código para salvar.', 'aviso'); return; }
  let nome = $('#rotulo-sketch').textContent.trim() || 'sketch.ino';
  nome = prompt('Salvar como:', nome);
  if (!nome) return;
  if (!/\.(ino|cpp|c|h|txt|py|js|ts)$/i.test(nome)) nome += estado.linguagem === 'micropython' ? '.py' : (estado.placaCurso === 'microbit' ? '.js' : '.ino');
  baixarArquivo(nome, codigo);
  log(`Salvo: ${nome} (na pasta de downloads do navegador)`, 'ok');
}

function submenuExemplos() {
  if (estado.placaCurso === 'lego') return legoItensExemplos();
  if (estado.placaCurso === 'microbit') return mbItensExemplos();
  return [...MODULOS.map((m) => ({
    rotulo: m.nome,
    submenu: () => fasesDoModulo(m.id).map((f) => ({
      rotulo: `${f.missao} — ${f.nome}`,
      acao: () => {
        const ta = irParaEditorLivre();
        ta.value = f.solucao;
        renderLivre(); atualizarBotoes(); atualizarCursor();
        $('#rotulo-sketch').textContent = nomeSketch(f);
        log(`Exemplo carregado: ${f.missao} — ${f.nome}`, 'info');
      },
    })),
  }))];
}

async function acSair() {
  if (!confirm('Encerrar o MIDE EDU? O servidor local será desligado.')) return;
  try { await api('/api/encerrar', {}); } catch (e) { /* já caiu */ }
  document.body.innerHTML =
    '<div style="display:grid;place-items:center;height:100vh;font-family:system-ui;' +
    'color:#5B6C71;text-align:center;padding:24px">' +
    '<div><h2 style="color:#008184;margin:0 0 8px">MIDE EDU encerrado</h2>' +
    '<p>Pode fechar esta aba. Para abrir de novo, use o atalho ' +
    '<b>MIDE EDU</b> na pasta do programa.</p></div></div>';
}

/* ------------------------------------------------------------
 * EDITAR
 * ---------------------------------------------------------- */
function comEditor(fn) {
  const ta = irParaEditorLivre();
  ta.focus();
  fn(ta);
  renderLivre(); atualizarBotoes(); atualizarCursor();
}

const acDesfazer = () => comEditor(() => document.execCommand('undo'));
const acRefazer  = () => comEditor(() => document.execCommand('redo'));
const acRecortar = () => comEditor((ta) => {
  navigator.clipboard.writeText(ta.value.slice(ta.selectionStart, ta.selectionEnd));
  ta.setRangeText('', ta.selectionStart, ta.selectionEnd, 'end');
});
const acCopiar = () => comEditor((ta) =>
  navigator.clipboard.writeText(ta.value.slice(ta.selectionStart, ta.selectionEnd)));
const acColar = () => {
  const ta = irParaEditorLivre();
  ta.focus();
  navigator.clipboard.readText().then((t) => {
    ta.setRangeText(t, ta.selectionStart, ta.selectionEnd, 'end');
    renderLivre(); atualizarBotoes(); atualizarCursor();
  }).catch(() => log('O navegador pediu permissão para acessar a área de transferência. ' +
                     'Use Ctrl+V direto no editor.', 'aviso'));
};
const acSelecionarTudo = () => comEditor((ta) => ta.select());

/* Comentar / descomentar as linhas selecionadas. */
function acComentar() {
  comEditor((ta) => {
    const ini = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
    let fim = ta.value.indexOf('\n', ta.selectionEnd);
    if (fim < 0) fim = ta.value.length;
    const trecho = ta.value.slice(ini, fim);
    const linhas = trecho.split('\n');
    const py = estado.placaCurso === 'microbit' && estado.linguagem === 'micropython';   // MicroPython comenta com #
    const reCom = py ? /^\s*#/ : /^\s*\/\//;
    const todasComentadas = linhas.every((l) => !l.trim() || reCom.test(l));
    const novo = linhas.map((l) => {
      if (!l.trim()) return l;
      return todasComentadas ? l.replace(py ? /^(\s*)# ?/ : /^(\s*)\/\/ ?/, '$1') : l.replace(/^(\s*)/, py ? '$1# ' : '$1// ');
    }).join('\n');
    ta.setRangeText(novo, ini, fim, 'end');
  });
}

/* Indentação automática por chaves, 2 espaços — como o Auto Format. */
function formatar(codigo) {
  let nivel = 0;
  return codigo.replace(/\r\n?/g, '\n').split('\n').map((bruta) => {
    const l = bruta.trim();
    if (!l) return '';
    if (/^[}\])]/.test(l)) nivel = Math.max(0, nivel - 1);
    const saida = '  '.repeat(nivel) + l;
    const abre = (l.match(/[{[(]/g) || []).length;
    const fecha = (l.match(/[}\])]/g) || []).length;
    let delta = abre - fecha;
    if (/^[}\])]/.test(l)) delta += 1;   // o fecha inicial já foi contado acima
    nivel = Math.max(0, nivel + delta);
    return saida;
  }).join('\n');
}

function acFormatar() {
  if (estado.linguagem === 'micropython') {
    log('A formatação automática fica desativada no MicroPython para preservar a indentação.', 'aviso');
    return;
  }
  comEditor((ta) => {
    const antes = ta.value;
    ta.value = formatar(antes);
  });
  log('Formatação automática aplicada.', 'info');
}

/* Localizar e substituir no Editor C++. */
function acLocalizar() {
  irParaEditorLivre();
  abrirModal('Localizar e substituir',
    '<div class="campo"><label>Localizar</label>' +
    '<input type="text" id="f-busca" autocomplete="off"></div>' +
    '<div class="campo"><label>Substituir por</label>' +
    '<input type="text" id="f-troca" autocomplete="off"></div>' +
    '<p class="campo aviso-campo" id="f-resultado">Busca sem diferenciar maiúsculas.</p>',
    [
      { rotulo: 'Localizar', acao: () => { buscarNoEditor(); return false; } },
      { rotulo: 'Substituir tudo', acao: () => { substituirNoEditor(); return false; } },
      { rotulo: 'Fechar', primario: true },
    ]);
}

function buscarNoEditor() {
  const termo = $('#f-busca').value;
  const ta = $('#editor-livre');
  if (!termo) return;
  const alvo = ta.value.toLowerCase();
  const de = alvo.indexOf(termo.toLowerCase(), ta.selectionEnd);
  const pos = de >= 0 ? de : alvo.indexOf(termo.toLowerCase());
  const res = $('#f-resultado');
  if (pos < 0) { res.textContent = 'Não encontrado.'; return; }
  const total = alvo.split(termo.toLowerCase()).length - 1;
  res.textContent = `${total} ocorrência(s). Selecionada no editor.`;
  ta.focus();
  ta.setSelectionRange(pos, pos + termo.length);
  atualizarCursor();
}

function substituirNoEditor() {
  const termo = $('#f-busca').value;
  const troca = $('#f-troca').value;
  if (!termo) return;
  const ta = $('#editor-livre');
  const partes = ta.value.split(termo);
  const n = partes.length - 1;
  ta.value = partes.join(troca);
  renderLivre(); atualizarBotoes();
  $('#f-resultado').textContent = `${n} substituição(ões) feita(s).`;
  log(`${n} substituição(ões) no ${nomeEditorLivre()}.`, 'info');
}

/* ------------------------------------------------------------
 * SKETCH
 * ---------------------------------------------------------- */
async function acExportarBinario() {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  const codigo = codigoAtual();
  if (estado.placaCurso === 'microbit') return mbBaixarHex();
  if (!codigo.trim()) { log('Não há código para exportar.', 'aviso'); return; }
  if (estado.linguagem === 'micropython') {
    baixarArquivo('main.py', codigo);
    log('Programa MicroPython salvo como main.py.', 'ok');
    return;
  }
  ocupar(true);
  log('Compilando para exportar o binário…', 'info');
  try {
    const r = await api('/api/exportar', {
      codigo, nome: estado.fase ? estado.fase.id : 'sketch', fqbn: estado.fqbn,
    });
    if (r.ok) {
      if (r.base64) {
        const bin = Uint8Array.from(atob(r.conteudo), c => c.charCodeAt(0));
        baixarArquivo(r.arquivo, bin, 'application/octet-stream');
      } else baixarArquivo(r.arquivo, r.conteudo);
      log(`Binário exportado: ${r.arquivo}`, 'ok');
    } else {
      logBloco(r.log, 'erro');
      log('✗ Não foi possível exportar.', 'erro');
    }
  } catch (e) {
    log('Servidor local não respondeu.', 'erro');
  }
  ocupar(false);
}

function submenuIncluirBiblioteca() {
  if (estado.linguagem === 'micropython') {
    return [{ rotulo: 'Use import no código Python', acao: () => log('No MicroPython, carregue módulos com import ou from ... import ....', 'info') }];
  }
  const libs = estado.libs || [];
  if (!libs.length) {
    return [{ rotulo: 'Carregando… abra de novo em instantes', acao: () => carregarLibs() }];
  }
  return libs.slice(0, 60).map((l) => ({
    rotulo: l.nome,
    acao: () => {
      const ta = irParaEditorLivre();
      const cabecalho = `#include <${l.nome.replace(/\s+/g, '')}.h>\n`;
      ta.value = cabecalho + ta.value;
      renderLivre(); atualizarBotoes();
      log(`Incluído: ${cabecalho.trim()} — confira o nome do arquivo .h da biblioteca.`, 'info');
    },
  }));
}

async function carregarLibs() {
  try {
    const r = await api('/api/libs');
    estado.libs = r.libs || [];
  } catch (e) { estado.libs = []; }
}

/* ------------------------------------------------------------
 * FERRAMENTAS
 * ---------------------------------------------------------- */
function submenuPlacas() {
  return [{ rotulo: 'Escolher placa e linguagem…', acao: mostrarSeletorPlaca }];
}

function submenuPlacasLegado() {
  return (estado.placas || []).map((b) => ({
    rotulo: b.nome,
    marcado: b.fqbn === estado.fqbn,
    acao: () => {
      estado.fqbn = b.fqbn;
      atualizarPlacaStatus();
      aoTrocarPorta();
      log(`Placa selecionada: ${b.nome} (${b.fqbn})`, 'info');
    },
  }));
}

function submenuPortas() {
  const portas = estado.portas || [];
  if (!portas.length) {
    return [{ rotulo: 'Nenhuma placa encontrada', acao: () => listarPortas() }];
  }
  return portas.map((p) => ({
    rotulo: `${p.placa} em ${p.porta}`,
    marcado: $('#porta').value === p.porta,
    acao: () => { $('#porta').value = p.porta; aoTrocarPorta(); },
  }));
}

async function acInfoPlaca() {
  log('Buscando informações da placa…', 'info');
  try {
    const r = await api(`/api/info?fqbn=${encodeURIComponent(estado.fqbn)}`);
    mostrarPainelInf('saida');
    logBloco(r.log, r.ok ? 'fraco' : 'erro');
  } catch (e) {
    log('Servidor local não respondeu.', 'erro');
  }
}

/* Gerenciador de bibliotecas / placas — mesma tela, dois alvos. */
function acGerenciador(tipo) {
  const titulo = tipo === 'lib' ? 'Gerenciador de bibliotecas' : 'Gerenciador de placas';
  const dica = tipo === 'lib'
    ? 'Busque pelo nome (ex.: <code>LiquidCrystal</code>, <code>Servo</code>, <code>DHT</code>).'
    : 'Busque pelo núcleo (ex.: <code>avr</code>, <code>esp32</code>, <code>samd</code>).';
  abrirModal(titulo,
    `<p>${dica} A instalação precisa de internet e pode levar alguns minutos.</p>` +
    '<div class="campo"><label>Procurar</label>' +
    '<input type="text" id="g-termo" autocomplete="off"></div>' +
    '<div id="g-resultados"><div class="vazio-lista">Digite um nome e clique em Procurar.</div></div>',
    [
      { rotulo: 'Atualizar índice', acao: () => { gerenciarIndice(tipo); return false; } },
      { rotulo: 'Procurar', acao: () => { gerenciarBuscar(tipo); return false; } },
      { rotulo: 'Fechar', primario: true },
    ]);
  const campo = $('#g-termo');
  campo.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); gerenciarBuscar(tipo); }
  });
  gerenciarInstalados(tipo);
}

async function gerenciarInstalados(tipo) {
  const alvo = $('#g-resultados');
  if (!alvo) return;
  alvo.innerHTML = '<div class="vazio-lista">Lendo o que já está instalado…</div>';
  try {
    const r = await api(tipo === 'lib' ? '/api/libs' : '/api/cores');
    const itens = (tipo === 'lib' ? r.libs : r.cores) || [];
    if (tipo === 'lib') estado.libs = itens;
    alvo.innerHTML = '<h4>Já instalado neste computador</h4>' + listaHTML(itens, false);
  } catch (e) {
    alvo.innerHTML = '<div class="vazio-lista">Servidor local não respondeu.</div>';
  }
}

function listaHTML(itens, comBotao) {
  if (!itens.length) return '<div class="vazio-lista">Nada encontrado.</div>';
  return '<div class="lista-itens">' + itens.map((i) =>
    '<div class="item-lista"><span class="nome">' + escapar(i.nome || i.id || '') +
    (i.resumo ? '<span class="resumo">' + escapar(i.resumo) + '</span>' : '') + '</span>' +
    '<span class="ver">' + escapar(i.versao || '') + '</span>' +
    (comBotao ? '<button data-instalar="' + escapar(i.nome || i.id || '') + '">Instalar</button>'
              : '<span class="ver">✓</span>') +
    '</div>').join('') + '</div>';
}

async function gerenciarBuscar(tipo) {
  const termo = $('#g-termo').value.trim();
  const alvo = $('#g-resultados');
  alvo.innerHTML = '<div class="vazio-lista">Procurando…</div>';
  try {
    const r = await api(tipo === 'lib' ? '/api/libs' : '/api/cores',
                        { acao: 'buscar', alvo: termo });
    alvo.innerHTML = '<h4>Resultados</h4>' + listaHTML(r.achados || [], true);
    alvo.querySelectorAll('[data-instalar]').forEach((b) => {
      b.addEventListener('click', () => gerenciarInstalar(tipo, b.dataset.instalar, b));
    });
  } catch (e) {
    alvo.innerHTML = '<div class="vazio-lista">Servidor local não respondeu.</div>';
  }
}

async function gerenciarInstalar(tipo, nome, botao) {
  botao.disabled = true;
  botao.textContent = 'Instalando…';
  log(`Instalando ${nome}…`, 'info');
  try {
    const r = await api(tipo === 'lib' ? '/api/libs' : '/api/cores',
                        { acao: 'instalar', alvo: nome });
    logBloco(r.log, r.ok ? 'fraco' : 'erro');
    log(r.ok ? `✓ ${nome} instalado.` : `✗ Falha ao instalar ${nome}.`, r.ok ? 'ok' : 'erro');
    botao.textContent = r.ok ? 'Instalado' : 'Tentar de novo';
    botao.disabled = r.ok;
    if (r.ok && tipo === 'lib') carregarLibs();
  } catch (e) {
    botao.textContent = 'Erro';
    botao.disabled = false;
  }
}

async function gerenciarIndice(tipo) {
  log('Atualizando o índice…', 'info');
  const r = await api(tipo === 'lib' ? '/api/libs' : '/api/cores', { acao: 'atualizar' });
  logBloco(r.log, r.ok ? 'fraco' : 'erro');
}

/* Preferências */
function acPreferencias() {
  const placas = (estado.placas || []).map((b) =>
    `<option value="${escapar(b.fqbn)}"${b.fqbn === estado.fqbn ? ' selected' : ''}>` +
    `${escapar(b.nome)}</option>`).join('');
  const zooms = [80, 90, 100, 110, 125, 150, 175, 200].map((z) =>
    `<option value="${z / 100}"${Math.round(estado.zoom * 100) === z ? ' selected' : ''}>${z}%</option>`
  ).join('');
  const bauds = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400]
    .map((b) => `<option${String(b) === $('#mon-baud').value ? ' selected' : ''}>${b}</option>`).join('');

  abrirModal('Preferências',
    '<div class="campo"><label>Tema</label><select id="p-tema">' +
      `<option value="claro"${estado.tema === 'claro' ? ' selected' : ''}>Claro</option>` +
      `<option value="escuro"${estado.tema === 'escuro' ? ' selected' : ''}>Escuro</option>` +
    '</select></div>' +
    `<div class="campo"><label>Tamanho do texto</label><select id="p-zoom">${zooms}</select></div>` +
    `<div class="campo"><label>Placa</label><select id="p-placa" disabled>${placas}</select></div>` +
    `<div class="campo"><label>Velocidade do monitor</label><select id="p-baud">${bauds}</select></div>` +
    '<h4>Progresso</h4>' +
    `<p>Você tem <b>${progresso.xp} XP</b> e ${Object.keys(progresso.feitas).length} de ` +
    `${FASES.length} missões concluídas neste computador.</p>`,
    [
      { rotulo: 'Zerar progresso', acao: () => { zerarProgresso(); return true; } },
      { rotulo: 'Cancelar' },
      { rotulo: 'Salvar', primario: true, acao: () => {
          aplicarTema($('#p-tema').value);
          aplicarZoom(parseFloat($('#p-zoom').value));
          // A placa é escolhida na tela inicial para manter currículo e compilador coerentes.
          $('#mon-baud').value = $('#p-baud').value;
          atualizarPlacaStatus(); aoTrocarPorta();
          log('Preferências salvas.', 'ok');
        } },
    ]);
}

function zerarProgresso() {
  if (!confirm('Zerar o progresso (XP e missões concluídas) deste computador?')) return;
  progresso.xp = 0;
  progresso.feitas = {};
  progresso.modos = {};
  salvarProgresso();
  renderLateral();
  abrirFase(0);
}

/* ------------------------------------------------------------
 * AJUDA
 * ---------------------------------------------------------- */
function acGuia() {
  if (estado.placaCurso === 'lego') return legoAjuda();
  if (estado.placaCurso === 'microbit') return mbAjuda();
  abrirModal('Guia de introdução',
    '<h4>O caminho de uma missão</h4>' +
    '<ul>' +
    '<li>Escolha o módulo e a missão na lista da esquerda.</li>' +
    '<li>Leia a <b>instrução</b> no painel da direita: montagem, objetivo e cada linha de código explicada.</li>' +
    '<li>Clique em <b>Começar o treinamento</b> e digite o código linha por linha. ' +
    'Você não precisa digitar a indentação; linhas em branco só pedem Enter.</li>' +
    '<li>Quando o código terminar, o botão <b>Upload</b> na barra do editor fica disponível. ' +
    'Clique nele para gravar na placa de verdade.</li>' +
    '<li>Gravou? Ganha XP e a próxima missão desbloqueia.</li>' +
    '</ul>' +
    '<h4>Antes do primeiro upload</h4>' +
    '<p>Ligue a placa no cabo USB e confira se ela aparece na barra de cima. ' +
    'Se não aparecer, clique no botão de atualizar (⟳) ao lado da porta.</p>' +
    '<h4>Editor livre</h4>' +
    '<p>No Arduino Uno ele trabalha em C++. Na UNIHIKER K10, ele acompanha a linguagem escolhida: ' +
    'C++ ou MicroPython. Use <code>Ctrl+R</code> para verificar e <code>Ctrl+U</code> para enviar.</p>');
}

function acReferencia() {
  if (estado.placaCurso === 'microbit') return mbReferencia();
  if (estado.linguagem === 'micropython') {
    const linhasPy = [
      ['import time', 'Carrega recursos de tempo, como pausas.'],
      ['from unihiker_k10 import screen, rgb, button', 'Carrega os controles da tela, dos LEDs RGB e dos botões da K10.'],
      ['screen.init(dir=2)', 'Prepara a tela colorida da K10.'],
      ['screen.draw_text(...)', 'Desenha texto na tela.'],
      ['screen.show_draw()', 'Mostra na tela o que foi desenhado.'],
      ['rgb.write(num=0, color=0x00FF00)', 'Acende um LED RGB com a cor escolhida.'],
      ['button(button.a).status()', 'Lê o botão A.'],
      ['while True:', 'Repete o bloco para sempre.'],
      ['print("texto")', 'Envia texto ao Monitor Serial.'],
      ['time.sleep(1)', 'Espera 1 segundo.'],
    ];
    abrirModal('Referência rápida do MicroPython',
      '<p>Comandos usados no currículo da UNIHIKER K10.</p>' +
      '<div class="lista-itens">' + linhasPy.map(([c, d]) =>
        `<div class="item-lista"><span class="nome"><code>${escapar(c)}</code>` +
        `<span class="resumo">${escapar(d)}</span></span><span></span><span></span></div>`
      ).join('') + '</div>');
    return;
  }
  const linhas = [
    ['pinMode(pino, MODO)', 'Configura um pino como OUTPUT (saída), INPUT (entrada) ou INPUT_PULLUP.'],
    ['digitalWrite(pino, HIGH/LOW)', 'Liga (HIGH, 5V) ou desliga (LOW, 0V) um pino digital.'],
    ['digitalRead(pino)', 'Lê um pino digital e devolve HIGH ou LOW.'],
    ['analogWrite(pino, 0..255)', 'PWM: controla o brilho de um LED ou a força de um motor. Só nos pinos com ~.'],
    ['analogRead(A0..A5)', 'Lê uma entrada analógica e devolve um número de 0 a 1023.'],
    ['delay(ms)', 'Espera esse tanto de milissegundos. 1000 ms = 1 segundo.'],
    ['delayMicroseconds(us)', 'Espera microssegundos — usado no pulso do sensor ultrassônico.'],
    ['pulseIn(pino, HIGH)', 'Mede quanto tempo o pino ficou em HIGH, em microssegundos.'],
    ['map(v, de1, de2, para1, para2)', 'Converte um número de uma faixa para outra.'],
    ['constrain(v, min, max)', 'Prende um valor dentro de uma faixa.'],
    ['tone(pino, frequencia)', 'Toca uma nota no buzzer passivo. noTone(pino) silencia.'],
    ['Serial.begin(9600)', 'Liga a comunicação com o computador. Vai no setup().'],
    ['Serial.print / println', 'Envia texto ou número para o Monitor Serial.'],
    ['#include <Servo.h>', 'Carrega a biblioteca do servo. Depois: Servo motor; motor.attach(9); motor.write(90);'],
    ['#include <LiquidCrystal.h>', 'Carrega a biblioteca do LCD. Depois: lcd.begin(16,2); lcd.setCursor(0,0); lcd.print("...");'],
    ['void setup()', 'Roda uma vez no início — é onde se configura tudo.'],
    ['void loop()', 'Repete para sempre — é onde ficam as ações.'],
    ['if / else', 'Escolhe entre dois caminhos conforme uma condição.'],
    ['for (int i = 0; i < 10; i++)', 'Repete um bloco contando.'],
    ['int nome = valor;', 'Cria uma variável inteira.'],
  ];
  abrirModal('Referência rápida do Arduino',
    '<p>Os comandos usados no currículo. A referência completa fica em ' +
    '<code>arduino.cc/reference</code> (precisa de internet).</p>' +
    '<div class="lista-itens">' + linhas.map(([c, d]) =>
      `<div class="item-lista"><span class="nome"><code>${escapar(c)}</code>` +
      `<span class="resumo">${escapar(d)}</span></span><span></span><span></span></div>`
    ).join('') + '</div>');
}

function acAtalhos() {
  const linhas = [
    ['Ctrl + R', 'Verificar (compilar sem gravar)'],
    ['Ctrl + U', 'Carregar para a placa'],
    ['Ctrl + Shift + M', 'Monitor Serial'],
    ['Ctrl + O', 'Abrir sketch'],
    ['Ctrl + S', 'Salvar como'],
    ['Alt + N', 'Novo sketch (Ctrl+N costuma ser capturado pelo navegador)'],
    ['Ctrl + F', 'Localizar e substituir'],
    ['Ctrl + T', 'Formatação automática'],
    ['Ctrl + /', 'Comentar ou descomentar as linhas'],
    ['Ctrl + +  /  Ctrl + −', 'Aumentar ou diminuir o texto'],
    ['Ctrl + 0', 'Voltar ao tamanho normal'],
    ['Ctrl + ,', 'Preferências'],
    ['Enter', 'No treinamento: confere a linha digitada'],
  ];
  abrirModal('Atalhos de teclado',
    '<div class="lista-itens">' + linhas.map(([a, d]) =>
      `<div class="item-lista"><span class="nome">${escapar(d)}</span>` +
      `<span class="ver"><code>${escapar(a)}</code></span><span></span></div>`
    ).join('') + '</div>');
}

function acProblemas() {
  if (estado.placaCurso === 'lego') return legoAjuda();
  if (estado.placaCurso === 'microbit') return mbAjuda();
  const extraK10 = estado.placaCurso === 'k10'
    ? '<h4>UNIHIKER K10 não envia</h4>' +
      '<ul><li>Em C++, use <b>Preparar K10</b> para instalar o suporte oficial UNIHIKER.</li>' +
      '<li>Em MicroPython, a placa precisa estar com o firmware MicroPython da K10.</li>' +
      '<li>Trocar entre C++ e MicroPython substitui o programa que está na placa.</li></ul>'
    : '';
  abrirModal('Solução de problemas',
    '<h4>A placa não aparece na lista</h4>' +
    '<ul><li>Alguns cabos USB são só de carga e não têm fios de dados — troque o cabo.</li>' +
    '<li>Clique no botão ⟳ ao lado da porta.</li>' +
    '<li>Clone com chip CH340 precisa do driver CH341SER instalado no Windows.</li></ul>' +
    '<h4>“programmer is not responding” no upload</h4>' +
    '<ul><li>Outro programa está segurando a porta: feche o Arduino IDE.</li>' +
    '<li>O Monitor Serial daqui fecha sozinho durante o upload e reabre depois — se travar, ' +
    'clique em Desconectar e tente de novo.</li></ul>' +
    '<h4>“Platform arduino:avr not found”</h4>' +
    '<p>Falta instalar o núcleo. Use <b>Ferramentas → Gerenciador de placas</b>, procure por ' +
    '<code>avr</code> e instale — ou rode <code>arduino-cli core install arduino:avr</code>.</p>' +
    extraK10 +
    '<h4>“Servo.h: No such file”</h4>' +
    '<p>Use <b>Ferramentas → Gerenciar bibliotecas</b>, procure por <code>Servo</code> e instale.</p>' +
    '<h4>“servidor local offline”</h4>' +
    '<p>O servidor foi encerrado. Abra de novo pelo atalho <b>MIDE EDU</b> na pasta ' +
    'do programa. Ele se desliga sozinho depois de 15 minutos sem uso.</p>');
}

function acSobre() {
  abrirModal('Sobre',
    '<p><b>MIDE EDU</b> — <i>Multipurpose Integrated Development Environment for Education</i>: currículo web para Arduino Uno, UNIHIKER K10, LEGO Technic e BBC micro:bit V2, com ' +
    MODULOS.length + ' módulos e ' + FASES.length + ' missões nesta trilha.</p>' +
    '<h4>Nesta máquina</h4>' +
    '<ul>' +
    `<li>Servidor local: <code>${escapar($('#st-servidor').textContent)}</code></li>` +
    `<li>Placa: <code>${escapar(estado.fqbn)}</code></li>` +
    (estado.placaCurso === 'lego' ? '<li>Conexão: <code>Bluetooth (Web Bluetooth)</code></li>' : (estado.placaCurso === 'microbit' ? '<li>Conexão: <code>USB (WebUSB)</code></li>' : `<li>Porta: <code>${escapar($('#porta').value || 'nenhuma')}</code></li>`)) +
    '</ul>' +
    '<h4>Créditos</h4>' +
    '<p>O currículo Arduino Uno vem do mod <code>arduino_edu</code>. O currículo K10 usa fotos locais ' +
    'e exemplos montados a partir das referências oficiais da UNIHIKER. A compilação e a gravação ' +
    'em C++ são feitas pelo <code>arduino-cli</code>.</p>' +
    '<p>Placa LEGO Technic: programas em Python para hubs com firmware <b>Pybricks</b> (pybricks.com). ' +
    'O Python é compilado no navegador com o <code>mpy-cross</code> do Pybricks (licença MIT) e a foto do hub vem do ' +
    'pacote <code>@pybricks/images</code> (MIT). LEGO® e Technic™ são marcas do Grupo LEGO, que não tem relação com este curso.</p>' +
    mbSobre());
}

/* ------------------------------------------------------------
 * Modo professor (senha) — liga e desliga o botão "Pular"
 * do Modo Treinamento.
 * ---------------------------------------------------------- */
const SENHA_PROFESSOR = '7812';

function acModoProfessor() {
  if (estado.professor) {
    abrirModal('Modo professor',
      '<p>O modo professor está <b>ligado</b>:</p><ul>' +
      '<li><b>Todas as missões abertas</b> — dá para ir direto a qualquer módulo, ' +
      'sem precisar concluir os anteriores.</li>' +
      '<li>O botão <b>Pular</b> aparece no Modo Treinamento e avança uma linha sem ' +
      'digitá-la; as linhas puladas são contadas no placar.</li></ul>' +
      '<p>Desligue antes de entregar a máquina para a turma. Ao reabrir a IDE, esse modo começa desligado.</p>',
      [
        { rotulo: 'Manter ligado' },
        { rotulo: 'Desligar o modo professor', primario: true, acao: () => {
            aplicarProfessor(false);
            log('Modo professor desligado — as missões voltaram a desbloquear em ordem.', 'info');
          } },
      ]);
    return;
  }

  abrirModal('Modo professor',
    '<p>Digite a senha do professor para liberar:</p><ul>' +
    '<li><b>Todas as missões</b>, sem esperar a progressão — para demonstrar qualquer ' +
    'módulo em aula.</li>' +
    '<li>O botão <b>Pular</b> no Modo Treinamento, que avança uma linha sem que ela ' +
    'precise ser digitada.</li></ul>' +
    '<div class="campo"><label>Senha</label>' +
    '<input type="password" id="prof-senha" autocomplete="off" inputmode="numeric"></div>' +
    '<p class="campo aviso-campo" id="prof-recado">O modo professor vale apenas para esta sessão.</p>',
    [
      { rotulo: 'Cancelar' },
      { rotulo: 'Entrar', primario: true, acao: () => {
          if ($('#prof-senha').value.trim() !== SENHA_PROFESSOR) {
            const r = $('#prof-recado');
            r.textContent = 'Senha incorreta.';
            r.style.color = 'var(--erro)';
            $('#prof-senha').value = '';
            $('#prof-senha').focus();
            return false;                // mantém o diálogo aberto
          }
          aplicarProfessor(true);
          log('Modo professor ligado — todas as missões abertas e botão Pular liberado.', 'ok');
        } },
    ]);

  const campo = $('#prof-senha');
  campo.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return;
    ev.preventDefault();
    $('#modal-pe').querySelector('button.primario').click();
  });
}

/* ------------------------------------------------------------
 * Definição dos menus
 * ---------------------------------------------------------- */
const MENUS = [
  {
    rotulo: 'Arquivo',
    itens: () => [
      { rotulo: 'Novo sketch', atalho: 'Alt+N', acao: acNovoSketch },
      { rotulo: 'Abrir…', atalho: 'Ctrl+O', acao: acAbrirSketch },
      { rotulo: 'Exemplos', submenu: submenuExemplos },
      { sep: true },
      { rotulo: 'Salvar como…', atalho: 'Ctrl+S', acao: acSalvarComo },
      { sep: true },
      { rotulo: 'Preferências…', atalho: 'Ctrl+,', acao: acPreferencias },
      { sep: true },
      { rotulo: 'Sair', acao: acSair },
    ],
  },
  {
    rotulo: 'Editar',
    itens: () => [
      { rotulo: 'Desfazer', atalho: 'Ctrl+Z', acao: acDesfazer },
      { rotulo: 'Refazer', atalho: 'Ctrl+Y', acao: acRefazer },
      { sep: true },
      { rotulo: 'Recortar', atalho: 'Ctrl+X', acao: acRecortar },
      { rotulo: 'Copiar', atalho: 'Ctrl+C', acao: acCopiar },
      { rotulo: 'Colar', atalho: 'Ctrl+V', acao: acColar },
      { rotulo: 'Selecionar tudo', atalho: 'Ctrl+A', acao: acSelecionarTudo },
      { sep: true },
      { rotulo: 'Comentar/Descomentar', atalho: 'Ctrl+/', acao: acComentar },
      { rotulo: 'Localizar…', atalho: 'Ctrl+F', acao: acLocalizar },
      { sep: true },
      { rotulo: 'Aumentar o texto', atalho: 'Ctrl++', acao: () => mudarZoom(+ZOOM_PASSO) },
      { rotulo: 'Diminuir o texto', atalho: 'Ctrl+−', acao: () => mudarZoom(-ZOOM_PASSO) },
      { rotulo: 'Tamanho normal', atalho: 'Ctrl+0', acao: () => aplicarZoom(1) },
    ],
  },
  {
    rotulo: 'Sketch',
    itens: () => [
      { rotulo: 'Verificar/Compilar', atalho: 'Ctrl+R', acao: compilar },
      { rotulo: estado.placaCurso === 'lego' ? 'Enviar e rodar' : (estado.placaCurso === 'microbit' ? 'Enviar para a micro:bit' : 'Carregar'), atalho: 'Ctrl+U', acao: gravar },
      { sep: true },
      { rotulo: estado.placaCurso === 'microbit' ? 'Baixar .hex' : (estado.linguagem === 'micropython' ? 'Salvar main.py' : 'Exportar binário compilado'), acao: acExportarBinario },
      { sep: true },
      ...(estado.linguagem === 'micropython' || estado.placaCurso === 'microbit' ? [] : [
        { rotulo: 'Incluir biblioteca', submenu: submenuIncluirBiblioteca },
        { rotulo: 'Gerenciar bibliotecas…', acao: () => acGerenciador('lib') },
      ]),
    ],
  },
  {
    rotulo: 'Ferramentas',
    itens: () => [
      { rotulo: 'Formatação automática', atalho: 'Ctrl+T', acao: acFormatar },
      { sep: true },
      { rotulo: 'Monitor Serial', atalho: 'Ctrl+Shift+M', acao: () => mostrarPainelInf('monitor') },
      { rotulo: 'Traçador Serial', acao: () => mostrarPainelInf('tracador') },
      { sep: true },
      { rotulo: 'Placa', submenu: submenuPlacas },
      ...(estado.placaCurso === 'lego' ? [
        { rotulo: legoHub() && legoHub().conectado ? 'Desconectar o hub' : 'Conectar hub…', acao: legoConectarOuDesconectar },
        { rotulo: 'Parar o programa do hub', acao: legoParar },
      ] : estado.placaCurso === 'microbit' ? [
        { rotulo: mbUSB() && mbUSB().conectado ? 'Desconectar a micro:bit' : 'Conectar micro:bit…', acao: mbConectarOuDesconectar },
        { rotulo: mbBLE() && mbBLE().conectado ? 'Desconectar o Bluetooth' : 'Conectar por Bluetooth…', acao: mbConectarOuDesconectarBle },
        { rotulo: 'Enviar por Bluetooth (experimental)…', acao: mbEnviarPorBle },
        { rotulo: 'Painel ao vivo (Bluetooth)', acao: () => { if (mbEhPython()) mbConectarOuDesconectarBle(); else mostrarPainelInf('aovivo'); } },
      ] : [
        { rotulo: 'Porta', submenu: submenuPortas },
        { rotulo: 'Obter informações da placa', acao: acInfoPlaca },
        { sep: true },
        ...(estado.linguagem === 'micropython' ? [] : [{ rotulo: 'Gerenciar bibliotecas…', acao: () => acGerenciador('lib') }]),
        { rotulo: 'Gerenciador de placas…', acao: () => acGerenciador('core') },
      ]),
    ],
  },
  {
    rotulo: 'Ajuda',
    itens: () => [
      { rotulo: 'Guia de introdução', acao: acGuia },
      { rotulo: 'Referência rápida do Arduino', acao: acReferencia },
      { rotulo: 'Atalhos de teclado', acao: acAtalhos },
      { sep: true },
      { rotulo: 'Modo professor…', marcado: estado.professor, acao: acModoProfessor },
      { sep: true },
      { rotulo: 'Solução de problemas', acao: acProblemas },
      { rotulo: 'Sobre', acao: acSobre },
    ],
  },
];

/* ------------------------------------------------------------
 * Montagem e comportamento dos menus
 * ---------------------------------------------------------- */
function fecharMenus() {
  document.querySelectorAll('.menu.aberto, .submenu.aberto')
    .forEach((m) => m.classList.remove('aberto'));
}

function montarDropdown(itens, caixa) {
  caixa.innerHTML = '';
  itens.forEach((it) => {
    if (it.sep) { caixa.appendChild(criar('div', 'dd-sep')); return; }
    if (it.titulo) {
      const t = criar('div', 'dd-titulo');
      t.textContent = it.titulo;
      caixa.appendChild(t);
      return;
    }
    if (it.submenu) {
      const env = criar('div', 'submenu');
      const bt = criar('button', 'dd-item');
      bt.innerHTML = `<span class="marca"></span><span>${escapar(it.rotulo)}</span>` +
                     '<span class="seta">▸</span>';
      const sub = criar('div', 'dropdown');
      env.appendChild(bt);
      env.appendChild(sub);
      const abrir = () => {
        if (env.classList.contains('aberto')) return;
        caixa.querySelectorAll('.submenu.aberto').forEach((s) => s.classList.remove('aberto'));
        montarDropdown(it.submenu(), sub);
        env.classList.add('aberto');
      };
      bt.addEventListener('click', (ev) => { ev.stopPropagation(); abrir(); });
      env.addEventListener('mouseenter', abrir);
      caixa.appendChild(env);
      return;
    }
    const bt = criar('button', 'dd-item');
    bt.innerHTML =
      `<span class="marca">${it.marcado ? '✓' : ''}</span>` +
      `<span>${escapar(it.rotulo)}</span>` +
      (it.atalho ? `<span class="atalho">${escapar(it.atalho)}</span>` : '');
    bt.disabled = !!it.desativado;
    bt.addEventListener('click', (ev) => {
      ev.stopPropagation();
      fecharMenus();
      if (it.acao) it.acao();
    });
    caixa.appendChild(bt);
  });
}

function montarMenus() {
  const nav = $('#menus');
  nav.innerHTML = '';
  MENUS.forEach((m) => {
    const env = criar('div', 'menu');
    const bt = criar('button', 'rotulo');
    bt.textContent = m.rotulo;
    const dd = criar('div', 'dropdown');
    env.appendChild(bt);
    env.appendChild(dd);

    const abrir = (porHover) => {
      fecharMenus();
      montarDropdown(m.itens(), dd);
      env.classList.add('aberto');
      env.dataset.hover = porHover ? '1' : '';
    };
    bt.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (env.classList.contains('aberto')) {
        // se o menu acabou de abrir pelo passar do mouse, o clique confirma
        // em vez de fechar (senão trocar de menu com o mouse fecharia tudo)
        if (env.dataset.hover === '1') { env.dataset.hover = ''; return; }
        fecharMenus();
        return;
      }
      abrir(false);
    });
    env.addEventListener('mouseenter', () => {
      // com um menu já aberto, passar o mouse troca de menu (como no desktop)
      if (document.querySelector('.menu.aberto') && !env.classList.contains('aberto')) abrir(true);
    });
    nav.appendChild(env);
  });

  document.addEventListener('click', fecharMenus);
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.menu.aberto')) { fecharMenus(); return; }
    if (fecharModalAtual) fecharModalAtual();
  });
}

/* ------------------------------------------------------------
 * Atalhos de teclado
 * ---------------------------------------------------------- */
function ligarAtalhos() {
  document.addEventListener('keydown', (ev) => {
    const ctrl = ev.ctrlKey || ev.metaKey;
    if (ctrl && !ev.shiftKey && !ev.altKey) {
      const k = ev.key.toLowerCase();
      if (k === 'o') { ev.preventDefault(); acAbrirSketch(); return; }
      if (k === 's') { ev.preventDefault(); acSalvarComo(); return; }
      if (k === 'r') { ev.preventDefault(); compilar(); return; }
      if (k === 'f') { ev.preventDefault(); acLocalizar(); return; }
      if (k === 't') { ev.preventDefault(); acFormatar(); return; }
      if (k === ',') { ev.preventDefault(); acPreferencias(); return; }
      if (ev.key === '/') { ev.preventDefault(); acComentar(); return; }
    }
    if (ctrl && ev.shiftKey && ev.key.toLowerCase() === 'm') {
      ev.preventDefault(); mostrarPainelInf('monitor'); return;
    }
    if (ev.altKey && ev.key.toLowerCase() === 'n') { ev.preventDefault(); acNovoSketch(); }
  });
}

/* ------------------------------------------------------------
 * Início
 * ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  montarMenus();
  ligarAtalhos();
  $('#modal-fechar').addEventListener('click', fecharModal);
  $('#modal').addEventListener('click', (ev) => { if (ev.target.id === 'modal') fecharModal(); });
  setTimeout(carregarLibs, 2500);
});
