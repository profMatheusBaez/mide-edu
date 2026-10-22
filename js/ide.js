/* ============================================================
 * ide.js — MIDE EDU
 * ------------------------------------------------------------
 * Réplica no navegador do fluxo do mod arduino_edu:
 *   painel de instrução  ->  Modo Treinamento (linha por linha)
 *   ->  Upload para o Arduino UNO real (via servidor local).
 *
 * Não depende de nenhuma biblioteca externa.
 * ============================================================ */
'use strict';

/* Versão desta página. Precisa bater com a VERSAO do servidor.py —
   se não bater, o navegador está mostrando uma cópia velha em cache. */
const VERSAO_IDE = '16';

/* ------------------------------------------------------------
 * Atalhos
 * ---------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const criar = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
const escapar = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Marcação leve do mod: **destaque** e ~~perigo~~ */
function marcacao(texto) {
  return escapar(texto)
    .replace(/\*\*([^*]+?)\*\*/g, '<span class="destaque">$1</span>')
    .replace(/__([^_]+?)__/g, '<span class="destaque">$1</span>')
    .replace(/~~([^~]+?)~~/g, '<span class="perigo">$1</span>')
    .replace(/\n/g, '<br>');
}

/* ------------------------------------------------------------
 * Realce de sintaxe — mesmo dicionário fechado do mod
 * (tutorial_text.lua: ARDUINO_FUNCS / ARDUINO_CONST)
 * ---------------------------------------------------------- */
const FUNCS = new Set(['pinMode', 'digitalWrite', 'digitalRead', 'analogRead',
  'analogWrite', 'delay', 'delayMicroseconds', 'pulseIn', 'map', 'constrain',
  'millis', 'micros', 'attach', 'write', 'begin', 'print', 'println',
  'Serial.begin', 'Serial.print', 'Serial.println']);
const CONSTS = new Set(['HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP']);

/* Divide uma linha em pedaços {texto, tipo}. */
function tokenizar(linha) {
  const spans = [];
  let i = 0;
  const n = linha.length;
  while (i < n) {
    const c = linha[i];
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[\w.]/.test(linha[j])) j++;
      const palavra = linha.slice(i, j);
      let tipo = null;
      if (FUNCS.has(palavra)) tipo = 'func';
      else if (['void', 'if', 'else', 'int', 'for', 'return', 'const', 'bool', 'float', 'long', 'unsigned', 'String', 'from', 'import', 'while', 'True', 'False', 'None', 'elif', 'def', 'and', 'or', 'not', 'pass'].includes(palavra)) tipo = 'keyword';
      else if (CONSTS.has(palavra)) tipo = 'const';
      else if (/^A\d+$/.test(palavra)) tipo = 'num';
      spans.push({ texto: palavra, tipo });
      i = j;
    } else if (/\d/.test(c)) {
      let j = i;
      while (j < n && /\d/.test(linha[j])) j++;
      spans.push({ texto: linha.slice(i, j), tipo: 'num' });
      i = j;
    } else {
      let j = i;
      while (j < n && !/[A-Za-z_\d]/.test(linha[j])) j++;
      spans.push({ texto: linha.slice(i, j), tipo: null });
      i = j;
    }
  }
  return spans;
}

const CLASSE = { keyword: 't-keyword', func: 't-func', const: 't-const', num: 't-num' };

function realcar(codigo) {
  if (typeof estado !== 'undefined' && estado.placaCurso === 'microbit') return realcarMicrobit(codigo, estado.linguagem);
  if (typeof estado !== 'undefined' && estado.linguagem === 'micropython') return realcarPython(codigo);
  return codigo.split('\n').map((linha) => {
    const com = linha.indexOf('//');
    let corpo = linha, rabo = '';
    if (com >= 0) { corpo = linha.slice(0, com); rabo = linha.slice(com); }
    let html = tokenizar(corpo).map((s) =>
      s.tipo ? `<span class="${CLASSE[s.tipo]}">${escapar(s.texto)}</span>` : escapar(s.texto)
    ).join('');
    if (rabo) html += `<span class="t-com">${escapar(rabo)}</span>`;
    return html || '&nbsp;';
  }).join('\n');
}

/* Cor de cada caractere de uma linha, pela mesma tokenização. */
function coresPorCaractere(linha) {
  if (estado.placaCurso === 'microbit') return mbCoresPorCaractere(linha);
  const cores = [];
  for (const s of tokenizar(linha)) {
    const cls = s.tipo ? CLASSE[s.tipo] : '';
    for (let k = 0; k < s.texto.length; k++) cores.push(cls);
  }
  return cores;
}

/* ------------------------------------------------------------
 * Progresso (localStorage)
 * ---------------------------------------------------------- */
let CHAVE = 'arduino_academy_ide_v1';

const progresso = (() => {
  let p = { xp: 0, feitas: {} };
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) p = Object.assign(p, JSON.parse(bruto));
  } catch (e) { /* navegador sem storage: segue em memória */ }
  return p;
})();

function salvarProgresso() {
  try { localStorage.setItem(CHAVE, JSON.stringify(progresso)); } catch (e) { /* ignora */ }
}

const nivelDe = (xp) => 1 + Math.floor(xp / XP_POR_NIVEL);

function desbloqueada(indice) {
  // No modo professor a trava de progressão sai do caminho: dá para abrir
  // qualquer missão de qualquer módulo para demonstrar em aula.
  if (estado.professor) return true;
  if (indice === 0) return true;
  if (progresso.feitas[FASES[indice].id]) return true;
  return !!progresso.feitas[FASES[indice - 1].id];
}

/* ------------------------------------------------------------
 * Estado da sessão
 * ---------------------------------------------------------- */
const estado = {
  fase: null,          // objeto da fase aberta
  indice: -1,
  aba: 'treino',       // 'treino' | 'livre' | 'completo'
  placaCurso: 'uno',
  linguagem: 'cpp',
  selecionouPlaca: false,
  etapa: 'instrucao',  // 'conceito' | 'instrucao' | 'treino' | 'concluido'
  treino: null,        // { linhas, idx, erros, digitados, corretos }
  servidorOk: false,
  ocupado: false,
  zoom: 1,
  abertos: new Set(),   // módulos expandidos na lista lateral
  fqbn: 'arduino:avr:uno',
  placas: [],
  painelInf: 'saida',   // 'saida' | 'monitor' | 'tracador'
  portas: [],
  portaAtual: undefined,
  tema: 'claro',
  professor: false,   // modo professor: libera o botão Pular
};

/* ------------------------------------------------------------
 * Console
 * ---------------------------------------------------------- */
const consoleEl = $('#console');

function log(texto, classe) {
  const linha = criar('div', classe ? 'l-' + classe : '');
  linha.textContent = texto;
  consoleEl.appendChild(linha);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function logBloco(texto, classe) {
  String(texto).replace(/\s+$/, '').split('\n').forEach((l) => log(l, classe));
}

/* ------------------------------------------------------------
 * Lista de missões
 * ---------------------------------------------------------- */
function renderLateral() {
  if (estado.placaCurso === 'lego' && typeof legoRenderLateral === 'function') {
    legoRenderLateral();   // LEGO: hub e Exemplos no lugar das missões
    return;
  }
  const lista = $('#lista-fases');
  lista.innerHTML = '';

  MODULOS.forEach((modulo, mi) => {
    const fases = fasesDoModulo(modulo.id);
    if (!fases.length) return;   // módulo ainda sem missões: não aparece
    const feitas = fases.filter((f) => progresso.feitas[f.id]).length;
    const primeiro = FASES.indexOf(fases[0]);
    const aberto = estado.abertos.has(modulo.id);
    const liberado = desbloqueada(primeiro);

    const cab = criar('button', 'grupo-mod' + (aberto ? ' aberto' : '') +
      (feitas === fases.length ? ' completo' : ''));
    cab.style.setProperty('--module-color', ['#ffbf16', '#009aac', '#895de6', '#0aba9a', '#e85985', '#28669b', '#f3a114', '#059ac5'][mi % 8]);
    cab.setAttribute('aria-expanded', String(aberto));
    cab.classList.toggle('selecionado', estado.fase?.setor === modulo.id);
    cab.innerHTML =
      `<span class="seta">${aberto ? '▾' : '▸'}</span>` +
      `<img src="${ASSETS}${modulo.icone}" alt="">` +
      `<span class="nm">${escapar(modulo.nome)}` +
      `<small>Módulo ${mi + 1}${liberado ? '' : ' — bloqueado'}</small></span>` +
      `<span class="cnt">${feitas}/${fases.length}</span>`;
    cab.addEventListener('click', () => {
      if (estado.abertos.has(modulo.id)) estado.abertos.delete(modulo.id);
      else estado.abertos.add(modulo.id);
      renderLateral();
    });
    lista.appendChild(cab);

    if (!aberto) return;

    fases.forEach((fase) => {
      const i = FASES.indexOf(fase);
      const livre = desbloqueada(i);
      const feita = !!progresso.feitas[fase.id];
      const bt = criar('button', 'fase-item' + (feita ? ' feita' : '') +
        (estado.indice === i ? ' ativa' : ''));
      bt.disabled = !livre || estado.ocupado;
      bt.innerHTML =
        `<span class="num">${feita ? '✓' : (livre ? fase.missao.replace(/\D/g, '') : '🔒')}</span>` +
        `<span class="tit">${escapar(fase.nome)}<small>${escapar(fase.missao)}</small></span>` +
        `<span class="xp">${fase.xp} XP</span>`;
      bt.addEventListener('click', () => abrirFase(i));
      lista.appendChild(bt);
    });
  });

  if (typeof atualizarAcademyProgresso === 'function') atualizarAcademyProgresso();
  $('#xp').textContent = progresso.xp;
  $('#nivel').textContent = nivelDe(progresso.xp);
  $('#medalhas').textContent = Object.keys(progresso.feitas).length + '/' + FASES.length;
}

/* ------------------------------------------------------------
 * Painel didático — instrução (espelha fs_instrucao_missao do mod)
 * ---------------------------------------------------------- */
function cabecalhoDidatico(fase, subtitulo) {
  const modulo = MODULOS.find(m => m.id === fase.setor);
  return `<div class="did-cab">` +
    (fase.iconeSetor ? `<img src="${ASSETS}${fase.iconeSetor}" alt="">` : '') +
    `<div><div class="missao">${escapar(fase.missao)}</div>` +
    `<div class="nome">${escapar(subtitulo || fase.nome)}</div></div>` +
    (modulo ? `<span class="module-badge"><b>Módulo ${MODULOS.indexOf(modulo) + 1}</b><span>${escapar(modulo.nome)}</span></span>` : '') + '</div>';
}

function renderConceito() {
  rotuloPainel('Conceito');
  const fase = estado.fase;
  const c = fase.conceito;
  const d = $('#did-conteudo');
  d.innerHTML = cabecalhoDidatico(fase, c.titulo) +
    `<div class="did-corpo">` +
    `<img class="conceito-img" src="${ASSETS}${c.imagem}" alt="">` +
    c.texto.map((t) => `<p class="conceito-txt">${marcacao(t)}</p>`).join('') +
    `<button class="bt destaque-pulsar" id="bt-entendi">Entendi, ver a missão →</button>` +
    `</div>`;
  $('#didatico').scrollTop = 0;
  atualizarDicaRolar();
  $('#bt-entendi').addEventListener('click', () => { estado.etapa = 'instrucao'; renderInstrucao(); });
}

function renderInstrucao() {
  rotuloPainel('Instrução');
  const fase = estado.fase;
  const d = $('#did-conteudo');
  let html = cabecalhoDidatico(fase) + '<div class="did-corpo">';

  if (fase.diagrama) {
    html += `<img class="diagrama" src="${ASSETS}${fase.diagrama.img}" alt="Montagem do circuito">`;
  }

  html += `<div class="bloco-titulo">Objetivo</div>` +
    `<div class="card-info">` +
    (fase.iconeObjetivo
      ? `<img src="${ASSETS}${fase.iconeObjetivo.img}" alt="">`
      : `<img src="${ASSETS}${fase.iconeSetor}" alt="">`) +
    `<div>${marcacao(fase.objetivo)}</div></div>`;

  if (fase.aviso) {
    html += `<div class="card-info alerta" style="margin-top:8px">` +
      `<img src="${ASSETS}${fase.iconeAlerta}" alt="">` +
      `<div>${marcacao(fase.aviso)}</div></div>`;
  }

  html += `<div class="bloco-titulo">Passo a passo</div>`;
  for (const secao of fase.secoes) {
    const tituloSecao = secao.titulo ||
      `No <b>${escapar(secao.funcao || 'programa')}</b>:`;
    html += `<div class="secao-funcao">${secao.titulo ? escapar(secao.titulo) : tituloSecao}</div>`;
    for (const linha of secao.linhas) {
      const ico = linha.icone || resolverIcone(linha.codigo, fase.kit);
      html += `<div class="linha-card">` +
        (ico ? `<img class="ico" src="${ASSETS}${ico.img}" alt="">` : `<span class="ico vazio"></span>`) +
        `<div><code>${realcar(linha.codigo)}</code>` +
        `<div class="exp">${marcacao(linha.explicacao || '')}</div></div></div>`;
    }
  }

  if (fase.dica) {
    html += `<div class="bloco-titulo">Dica</div>` +
      `<div class="card-info dica"><img src="${ASSETS}${fase.iconeDica}" alt="">` +
      `<div>${marcacao(fase.dica)}</div></div>`;
  }

  html += `<button class="bt destaque-pulsar" id="bt-treinar">Começar o treinamento →</button>`;
  if (fase.conceito) {
    html += `<button class="bt neutro" id="bt-voltar-conceito">← Rever o conceito</button>`;
  }
  html += '</div>';

  d.innerHTML = html;
  $('#didatico').scrollTop = 0;
  atualizarDicaRolar();
  $('#bt-treinar').addEventListener('click', iniciarTreino);
  const bv = $('#bt-voltar-conceito');
  if (bv) bv.addEventListener('click', () => { estado.etapa = 'conceito'; renderConceito(); });
}

/* Mostra a seta "role para baixo" só quando o conteúdo do painel
 * didático não cabe inteiro na tela — some assim que o aluno rola. */
function atualizarDicaRolar() {
  const caixa = $('#didatico');
  const dica = $('#dica-rolar');
  if (!caixa || !dica) return;
  requestAnimationFrame(() => {
    dica.hidden = caixa.scrollTop > 16 || caixa.scrollHeight <= caixa.clientHeight + 24;
  });
}

/* ------------------------------------------------------------
 * Abrir fase
 * ---------------------------------------------------------- */
function nomeSketch(fase) {
  const slug = fase.nome.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (estado.placaCurso === 'microbit') return mbNomeArquivo(fase);
  return `${fase.id}_${slug}.${estado.linguagem === 'micropython' ? 'py' : 'ino'}`;
}

function abrirFase(i) {
  if (estado.ocupado || !FASES[i]) return;
  if (!desbloqueada(i)) return;
  estado.indice = i;
  estado.fase = FASES[i];
  if (typeof blocosAoAbrirFase === 'function') blocosAoAbrirFase(estado.fase);   // modo Guiado dos blocos: passos da missão
  estado.abertos.add(estado.fase.setor);
  estado.treino = null;
  estado.etapa = estado.fase.conceito ? 'conceito' : 'instrucao';
  $('#rotulo-sketch').textContent = nomeSketch(estado.fase);
  $('#editor-livre').value = estado.fase.starter;
  renderLateral();
  trocarAba('treino');
  renderEditorTreino();
  autoLargurarEditor();   // largura da coluna de código ajustada à missão que acabou de abrir
  if (estado.etapa === 'conceito') renderConceito(); else renderInstrucao();
  $('#faixa-treino').classList.add('oculto');
  atualizarBotoes();
  const mod = MODULOS.find((m) => m.id === estado.fase.setor);
  log(`— ${mod ? mod.nome : ''} · ${estado.fase.missao}: ${estado.fase.nome} —`, 'info');
}

/* ------------------------------------------------------------
 * Modo Treinamento
 * ---------------------------------------------------------- */
/* Separa a solução em linhas, preservando a indentação original
 * (split_lines em board.lua). */
function dividirLinhas(codigo) {
  const linhas = codigo.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, ''));
  while (linhas.length > 1 && linhas[linhas.length - 1] === '') linhas.pop();
  return linhas;
}

/* O aluno nunca digita a indentação: o alvo de digitação é a linha
 * sem os espaços da esquerda (alvo_digitacao em board.lua). */
const alvoDigitacao = (s) => String(s || '').replace(/^\s+/, '');

function iniciarTreino() {
  if (estado.ocupado) return;
  const linhas = dividirLinhas(estado.fase.solucao);
  estado.treino = { linhas, idx: 0, erros: 0, puladas: 0, digitados: 0, corretos: 0 };
  estado.etapa = 'treino';
  $('#faixa-treino').classList.remove('oculto');
  $('#entrada').value = '';
  $('#recado').textContent = '';
  $('#recado').className = '';
  $('#c-total').textContent = linhas.length;
  renderTreino();
  $('#entrada').focus();
}

function renderTreino() {
  renderEditorTreino();
  renderAlvo();
  renderCardLinha();
  atualizarDicaRolar();
  atualizarBotoes();
  const t = estado.treino;
  $('#c-linha').textContent = Math.min(t.idx + 1, t.linhas.length);
  $('#c-puladas').textContent = t.puladas || 0;
  $('#cx-puladas').hidden = !estado.professor;
  $('#bt-pular').hidden = !estado.professor || t.idx >= t.linhas.length;
}

/* Editor: linhas já digitadas aparecem; as próximas ficam mascaradas. */
function renderEditorTreino() {
  const fase = estado.fase;
  const t = estado.treino;
  const linhas = t ? t.linhas : dividirLinhas(fase ? fase.solucao : '');
  const total = linhas.length;

  $('#gutter-treino').textContent = Array.from({ length: total }, (_, i) => i + 1).join('\n');

  const html = linhas.map((linha, i) => {
    const revelada = t ? i < t.idx : false;
    const atual = t ? i === t.idx : false;
    let conteudo;
    if (revelada) conteudo = realcar(linha) || '&nbsp;';
    else if (linha === '') conteudo = '&nbsp;';
    else conteudo = `<span class="oculto">${linha.match(/^\s*/)[0]}······</span>`;
    return `<div class="ln${atual ? ' atual' : ''}">${conteudo}</div>`;
  }).join('');

  $('#codigo-treino').innerHTML = html;
}

/* Caixa "TEXTO PARA DIGITAR": cada caractere ganha verde (certo),
 * vermelho (errado) ou a cor de sintaxe (ainda não digitado). */
function renderAlvo() {
  const t = estado.treino;
  const caixa = $('#alvo');
  $('#faixa-treino').classList.toggle('completo', !!t && t.idx >= t.linhas.length);
  $('#c-erros').textContent = t ? t.erros : 0;
  $('#entrada').disabled = !!t && t.idx >= t.linhas.length;
  $('#bt-verificar').disabled = $('#entrada').disabled;
  if (!t) { caixa.innerHTML = ''; return; }

  if (t.idx >= t.linhas.length) {
    const puladas = t.puladas || 0;
    const nota = puladas > 0
      ? ` (${puladas} ${puladas === 1 ? 'linha pulada' : 'linhas puladas'})` : '';
    caixa.innerHTML = `<span class="certo">✓ Parabéns! Você digitou todo o código${nota}. ` +
      `Agora clique em <b>Upload</b> (a seta na barra de cima) para gravar na placa.</span>`;
    return;
  }

  const alvo = alvoDigitacao(t.linhas[t.idx]);
  const digitado = $('#entrada').value;

  if (alvo === '') {
    caixa.innerHTML = `<span class="vazia">(linha em branco — apenas tecle Enter)</span>`;
    return;
  }

  const cores = coresPorCaractere(alvo);
  let html = '';
  for (let i = 0; i < alvo.length; i++) {
    const ch = escapar(alvo[i]) === ' ' ? '&nbsp;' : escapar(alvo[i]);
    if (i < digitado.length) {
      html += `<span class="${digitado[i] === alvo[i] ? 'certo' : 'errado'}">${ch}</span>`;
    } else {
      html += cores[i] ? `<span class="${cores[i]}">${ch}</span>` : ch;
    }
  }
  if (digitado.length > alvo.length) {
    html += `<span class="sobra">${'_'.repeat(digitado.length - alvo.length)}</span>`;
  }
  caixa.innerHTML = html;

  /* contadores ao vivo */
  let certos = 0;
  for (let i = 0; i < Math.min(digitado.length, alvo.length); i++) {
    if (digitado[i] === alvo[i]) certos++;
  }
  const prec = digitado.length > 0 ? Math.floor(certos / digitado.length * 100) : 100;
  $('#c-precisao').textContent = prec + '%';
  $('#c-precisao').style.color = prec >= 90 ? 'var(--ok)' : 'var(--aviso)';
  $('#c-erros').textContent = t.erros;
  $('#c-erros').style.color = t.erros > 0 ? 'var(--erro)' : 'var(--ok)';
}

/* Card de ícone + explicação da linha atual (mesmo do painel). */
function renderCardLinha() {
  rotuloPainel('Treinamento');
  const t = estado.treino;
  const fase = estado.fase;
  const d = $('#did-conteudo');

  if (t.idx >= t.linhas.length) {
    $('#didatico').scrollTop = 0;
    d.innerHTML = cabecalhoDidatico(fase, 'Código completo') +
      `<div class="did-corpo concluido-corpo">` +
      `<p class="conclusao-texto">Parabéns! Você escreveu o código completo.</p>` +
      `<div class="card-info dica"><img src="${ASSETS}${fase.iconeDica}" alt="">` +
      `<div>Confira a montagem física e clique em <span class="destaque">Upload</span> ` +
      `para gravar o programa na placa selecionada.</div></div>` +
      `<button class="bt" id="bt-upload2">↥ Upload para a placa</button>` +
      `<button class="bt aviso" id="bt-treinar-de-novo">▶ Treinar de novo</button>` +
      `<button class="bt neutro" id="bt-ver-instrucao">▣ Ver a instrução completa</button>` +
      `<div class="maker-celebration"><img src="assets/academy/maker-board.png" alt=""><span class="idea-bubble">Pequenos circuitos,<br><b>grandes ideias!</b></span><p>Pratique hoje,<br>crie o amanhã!</p></div></div>`;
    $('#bt-upload2').addEventListener('click', gravar);
    $('#bt-treinar-de-novo').addEventListener('click', iniciarTreino);
    $('#bt-ver-instrucao').addEventListener('click', () => { estado.etapa = 'instrucao'; renderInstrucao(); });
    return;
  }

  const alvo = alvoDigitacao(t.linhas[t.idx]);
  const card = cardDaLinha(fase, alvo);
  let html = cabecalhoDidatico(fase, `Linha ${t.idx + 1} de ${t.linhas.length}`) +
    `<div class="did-corpo">`;

  if (card) {
    html += `<div id="card-linha">` +
      (card.icone ? `<img src="${ASSETS}${card.icone.img}" alt="">` : `<span class="ico vazio"></span>`) +
      `<div><code class="cod">${realcar(alvo)}</code>` +
      `<div class="exp">${marcacao(card.explicacao || '')}</div></div></div>`;
  } else {
    html += `<div class="card-info"><img src="${ASSETS}${fase.iconeSetor}" alt="">` +
      `<div>${alvo === '' ? 'Linha em branco: só tecle Enter para separar os blocos.'
        : 'Estrutura do programa.'}</div></div>`;
  }

  html += `<div class="bloco-titulo">Objetivo da missão</div>` +
    `<div class="card-info"><img src="${ASSETS}${fase.iconeSetor}" alt="">` +
    `<div>${marcacao(fase.objetivo)}</div></div>` +
    `<button class="bt neutro" id="bt-ver-instrucao">← Rever a instrução completa</button>` +
    `</div>`;

  d.innerHTML = html;
  $('#didatico').scrollTop = 0;
  $('#bt-ver-instrucao').addEventListener('click', () => {
    estado.etapa = 'instrucao';
    renderInstrucao();
  });
}

function verificarLinha() {
  const t = estado.treino;
  if (!t || t.idx >= t.linhas.length) return;
  const alvo = alvoDigitacao(t.linhas[t.idx]);
  const digitado = $('#entrada').value;
  const recado = $('#recado');

  if (digitado === alvo) {
    t.idx++;
    $('#entrada').value = '';
    if (t.idx >= t.linhas.length) {
      estado.etapa = 'concluido';
      recado.textContent = '✓ Código completo! Agora é só fazer o Upload para a placa.';
      recado.className = 'ok';
      log('Treinamento concluído — código pronto para gravar.', 'ok');
    } else {
      recado.textContent = '✓ Correto! Continue na próxima linha.';
      recado.className = 'ok';
    }
  } else {
    t.erros++;
    recado.textContent = '✗ Linha incorreta — corrija os caracteres em vermelho e tente de novo.';
    recado.className = 'erro';
  }
  renderTreino();
  $('#entrada').focus();
}

/* ------------------------------------------------------------
 * Abas / editor livre
 * ---------------------------------------------------------- */
function trocarAba(qual) {
  if (estado.ocupado) return;
  if (qual === 'completo' && estado.placaCurso !== 'k10' && estado.placaCurso !== 'microbit') return;
  if (qual === 'treino' && estado.placaCurso === 'lego') return;   // sem Modo Treinamento na placa LEGO
  if (qual === 'joystick' && estado.placaCurso !== 'uno') return;   // a aba Joystick é só do Arduino Uno
  if (estado.aba === 'joystick' && qual !== 'joystick' && typeof joystickAoSair === 'function') joystickAoSair();
  estado.aba = qual;
  $('#aba-treino').classList.toggle('ativa', qual === 'treino');
  $('#aba-livre').classList.toggle('ativa', qual === 'livre');
  $('#aba-completo').classList.toggle('ativa', qual === 'completo');
  $('#aba-blocos').classList.toggle('ativa', qual === 'blocos');
  $('#aba-joystick').classList.toggle('ativa', qual === 'joystick');
  $('#area-joystick').hidden = qual !== 'joystick';
  $('#rolagem-treino').hidden = qual !== 'treino';
  $('#editor-livre-wrap').hidden = qual !== 'livre';
  $('#codigo-completo-wrap').hidden = qual !== 'completo';
  $('#area-blocos').hidden = qual !== 'blocos';
  $('#palco').classList.toggle('sem-painel', qual === 'livre' || qual === 'blocos' || qual === 'joystick');
  $('#faixa-treino').classList.toggle('oculto', qual !== 'treino' || !estado.treino);
  if (qual === 'livre') renderLivre();
  if (qual === 'completo') renderCompleto();
  if (qual === 'blocos' && typeof blocosAoAbrir === 'function') blocosAoAbrir();
  if (qual === 'joystick' && typeof joystickAoAbrir === 'function') joystickAoAbrir();
  atualizarCursor();
  atualizarBotoes();
}

function atualizarCursor() {
  const ta = $('#editor-livre');
  if (estado.aba !== 'livre') { $('#st-cursor').textContent = ''; return; }
  const antes = ta.value.slice(0, ta.selectionStart).split('\n');
  $('#st-cursor').textContent = `Ln ${antes.length}, Col ${antes[antes.length - 1].length + 1}`;
}

function renderLivre() {
  const ta = $('#editor-livre');
  const texto = ta.value;
  const n = texto.split('\n').length;
  $('#gutter-livre').textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
  $('#realce-livre').innerHTML = realcar(texto) + '\n';
}

function renderCompleto() {
  const codigo = estado.fase?.solucao || '';
  $('#codigo-completo').innerHTML = realcar(codigo);
  $('#gutter-completo').textContent = codigo.trimEnd().split('\n').map((_, i) => i + 1).join('\n');
}

/* ------------------------------------------------------------
 * Código atual (o que vai para a placa)
 * ---------------------------------------------------------- */
function codigoAtual() {
  if (estado.aba === 'blocos') return typeof blocosCodigoAtual === 'function' ? blocosCodigoAtual() : '';
  if (estado.aba === 'joystick') return typeof joystickCodigoAtual === 'function' ? joystickCodigoAtual() : '';
  if (estado.aba === 'livre') return $('#editor-livre').value;
  if (estado.aba === 'completo') return estado.fase?.solucao || '';
  const t = estado.treino;
  if (!t) return estado.fase ? estado.fase.starter : '';
  /* só as linhas já digitadas — é exatamente o que o aluno escreveu */
  return t.linhas.slice(0, t.idx).join('\n') + '\n';
}

function podeGravar() {
  if (estado.ocupado || !estado.selecionouPlaca) return false;
  if (estado.placaCurso === 'lego') return typeof legoPodeGravar === 'function' && legoPodeGravar();
  if (estado.placaCurso === 'microbit') return mbPodeGravar();
  if (estado.aba === 'blocos') return typeof blocosPodeGravar === 'function' && blocosPodeGravar();
  if (estado.aba === 'joystick') return typeof joystickPodeGravar === 'function' && joystickPodeGravar();
  if (estado.aba === 'livre') return $('#editor-livre').value.trim().length > 0;
  if (estado.aba === 'completo') return !!estado.fase?.solucao;
  return !!estado.treino && estado.treino.idx >= estado.treino.linhas.length;
}

function atualizarBotoes() {
  const pronto = podeGravar();
  $('#bt-upload').disabled = !pronto;
  if ($('#bt-upload2')) $('#bt-upload2').disabled = !pronto;
  $('#bt-compilar').disabled = estado.ocupado ||
    (estado.aba === 'treino' && (!estado.treino || estado.treino.idx === 0));
  $('#bt-upload').classList.toggle('pulsa',
    pronto && estado.aba === 'treino' && estado.etapa === 'concluido');
  if (typeof atualizarControlesCurso === 'function') atualizarControlesCurso();
}

/* ------------------------------------------------------------
 * Servidor local (arduino-cli)
 * ---------------------------------------------------------- */
async function api(rota, corpo) {
  const opcoes = corpo
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }
    : {};
  const r = await fetch(rota, opcoes);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function checarServidor() {
  try {
    const s = await api('/api/status');
    estado.recursos = s;
    estado.servidorOk = !!s.arduino_cli;
    estado.placas = s.placas || [];
    if (s.versao_ide && s.versao_ide !== VERSAO_IDE) {
      log(`Esta página é a versão ${VERSAO_IDE} e o servidor já está na ` +
          `${s.versao_ide}. Recarregue com Ctrl+F5 para pegar a versão nova.`, 'aviso');
      $('#st-versao').textContent = `IDE v${VERSAO_IDE} (desatualizada)`;
      $('#st-versao').style.color = '#FFD166';
    }
    if (s.fqbn && estado.fqbn === 'arduino:avr:uno') estado.fqbn = s.fqbn;
    atualizarPlacaStatus();
    if (typeof sincronizarMonitor === 'function') sincronizarMonitor(s.monitor);
    $('#st-servidor').textContent = s.arduino_cli
      ? `arduino-cli ${s.versao}`
      : 'arduino-cli não encontrado';
    if (!s.arduino_cli) {
      log('arduino-cli não foi encontrado. Instale-o e reinicie o servidor — veja LEIA-ME.md.', 'erro');
    }
    await listarPortas();
  } catch (e) {
    estado.servidorOk = false;
    $('#st-servidor').textContent = 'servidor local offline';
    log('Servidor local não está respondendo. Abra a IDE pelo INICIAR.bat (ou rode servidor.py).', 'erro');
  }
}

async function listarPortas() {
  if (estado.placaCurso === 'lego' || estado.placaCurso === 'microbit') return;   // hub LEGO e micro:bit: sem porta serial do servidor
  const sel = $('#porta');
  const escolhida = sel.value;
  try {
    const r = await api('/api/portas');
    estado.portas = r.portas || [];
    sel.innerHTML = '';
    if (!estado.portas.length) {
      sel.innerHTML = '<option value="">Nenhuma placa encontrada</option>';
      aoTrocarPorta();
      $('#st-porta').textContent = 'nenhuma placa conectada';
      return;
    }
    for (const p of estado.portas) {
      const o = criar('option');
      o.value = p.porta;
      o.textContent = `${p.placa || 'Placa desconhecida'} em ${p.porta}`;
      sel.appendChild(o);
    }
    if (escolhida && estado.portas.some((p) => p.porta === escolhida)) sel.value = escolhida;
    aoTrocarPorta();
  } catch (e) {
    estado.portas = [];
    sel.innerHTML = '<option value="">Servidor indisponível</option>';
    aoTrocarPorta();
  }
}

function nomeDaPlaca() {
  if (estado.placaCurso === 'lego') return 'LEGO Technic (Pybricks)';
  if (estado.placaCurso === 'microbit') return 'BBC micro:bit V2';
  const achada = (estado.placas || []).find((b) => b.fqbn === estado.fqbn);
  return estado.placaCurso === 'k10' ? 'UNIHIKER K10' : (achada ? achada.nome : 'Arduino Uno');
}

function atualizarPlacaStatus() {
  $('#st-placa').textContent = nomeDaPlaca();
}

function aoTrocarPorta() {
  if (estado.placaCurso === 'lego') { if (typeof legoAtualizarUI === 'function') legoAtualizarUI(); return; }   // o hub é escolhido por Bluetooth, não por porta
  if (estado.placaCurso === 'microbit') { if (typeof mbAtualizarUI === 'function') mbAtualizarUI(); return; }   // a micro:bit é escolhida pela USB (WebUSB)
  if (typeof k10Navegador === 'function' && k10Navegador()) { k10WebAtualizarUI(); return; }   // K10 MicroPython: porta escolhida no navegador
  const p = $('#porta').value;
  $('#seletor-placa').classList.toggle('ligado', !!p);
  $('#st-porta').textContent = p ? `${nomeDaPlaca()} em ${p}` : 'nenhuma porta selecionada';
  // Só avisa o monitor quando a porta REALMENTE mudou: esta função também
  // roda a cada varredura de portas (8 s), e reconectar a cada varredura
  // derrubava o monitor sem parar.
  if (p !== estado.portaAtual) {
    const anterior = estado.portaAtual;
    estado.portaAtual = p;
    if (anterior !== undefined && typeof aoMudarPorta === 'function') aoMudarPorta(p);
  }
}

function ocupar(sim) {
  estado.ocupado = sim;
  document.body.style.cursor = sim ? 'progress' : '';
  for (const id of ['aba-treino', 'aba-livre', 'aba-completo', 'aba-joystick', 'bt-reiniciar', 'bt-sair', 'bt-professor']) {
    $('#' + id).disabled = sim;
  }
  $('#editor-livre').readOnly = sim;
  renderLateral();
  atualizarBotoes();
}

async function compilar() {
  if (estado.ocupado || !estado.selecionouPlaca) return;
  if (estado.placaCurso === 'lego') return legoVerificar();
  if (estado.placaCurso === 'microbit') return mbVerificar();
  if (estado.linguagem === 'micropython') return executarMicroPython(false);
  const codigo = codigoAtual();
  if (!codigo.trim()) { log('Não há código para compilar.', 'aviso'); return; }
  ocupar(true);
  barraIniciar('compilar');
  log('Compilando o sketch…', 'info');
  let deuCerto = false;
  try {
    const r = await api('/api/compilar', { codigo, nome: estado.aba === 'joystick' ? 'Joystick' : (estado.fase ? estado.fase.id : 'sketch'), fqbn: estado.fqbn, placa: estado.placaCurso });
    deuCerto = !!r.ok;
    logBloco(r.log, r.ok ? 'fraco' : 'erro');
    log(r.ok ? '✓ Compilação concluída.' : '✗ Erro de compilação.', r.ok ? 'ok' : 'erro');
    barraFinalizar(r.ok, r.ok ? 'Código compilado sem erros.' : 'O código tem erros — veja a Saída.');
  } catch (e) {
    log('Falha ao falar com o servidor local: ' + e.message, 'erro');
    barraFinalizar(false, 'O servidor local não respondeu.');
  }
  ocupar(false);
}

async function gravar() {
  if (!podeGravar()) return;
  if (estado.placaCurso === 'lego') return legoEnviar();
  if (estado.placaCurso === 'microbit') return mbEnviar();
  if (typeof k10Navegador === 'function' && k10Navegador()) return k10WebExecutar(true);   // K10 MicroPython: USB do navegador
  const porta = $('#porta').value;
  if (!porta) {
    mostrarPainelInf('saida');
    log('Escolha a porta da placa na barra de cima (clique em atualizar para procurar).', 'aviso');
    return;
  }
  if (estado.linguagem === 'micropython') return executarMicroPython(true);
  const codigo = codigoAtual();
  if (!codigo.trim()) { log('Não há código para gravar.', 'aviso'); return; }
  ocupar(true);
  barraIniciar('gravar');
  // Joystick: o app do PC (se estiver aberto) solta a porta USB durante a gravação
  const comJoystick = estado.aba === 'joystick' && typeof joystickAntesDeGravar === 'function';
  if (comJoystick) await joystickAntesDeGravar();
  log(`Gravando em ${porta}…`, 'info');
  let gravou = false;
  try {
    const r = await api('/api/gravar', { codigo, porta, nome: estado.aba === 'joystick' ? 'Joystick' : (estado.fase ? estado.fase.id : 'sketch'), fqbn: estado.fqbn, placa: estado.placaCurso });
    logBloco(r.log, r.ok ? 'fraco' : 'erro');
    gravou = !!r.ok;
    if (r.ok) {
      log('✓ Upload concluído. Olhe para a sua placa!', 'ok');
      barraFinalizar(true, 'Gravado! Olhe para a sua placa.');
      if (estado.aba === 'joystick') {
        log('Joystick gravado. Com o app MIDE Joystick aberto no PC, é só ir para o jogo.', 'info');
      }
      // XP e medalha são do Modo Treinamento. No Editor C++ o aluno está
      // escrevendo o código dele — gravar ali não fecha missão nenhuma.
      if (estado.aba === 'treino' && estado.treino &&
          estado.treino.idx >= estado.treino.linhas.length) {
        concluirFase();
      } else if (estado.placaCurso === 'k10' && estado.aba === 'completo') {
        oferecerConfirmacaoK10();
      } else if (estado.aba === 'blocos' && typeof blocosGuiaConcluiu === 'function' && blocosGuiaConcluiu()) {
        blocosGuiaConcluirMissao();   // missão montada no modo Guiado dos blocos
      }
    } else {
      // Distingue erro de compilação de erro de gravação: se o log chegou
      // a mostrar a linha do `upload`, o sketch compilou e o problema é a placa.
      const naGravacao = /arduino-cli upload|Gravando pela USB/.test(r.log || '');
      log(naGravacao ? '✗ O upload falhou. Confira a placa, o cabo e a porta.'
                     : '✗ O código tem erros e não chegou a ser gravado.', 'erro');
      barraFinalizar(false, naGravacao ? 'A gravação falhou — veja a Saída.'
                                       : 'O código tem erros — veja a Saída.');
    }
  } catch (e) {
    log('Falha ao falar com o servidor local: ' + e.message, 'erro');
    barraFinalizar(false, 'O servidor local não respondeu.');
  }
  if (comJoystick && typeof joystickDepoisDeGravar === 'function') joystickDepoisDeGravar(gravou);
  ocupar(false);
}

/* ------------------------------------------------------------
 * Conclusão da fase
 * ---------------------------------------------------------- */
/* Guarda em que modo a missão foi feita ('treino' | 'completo' | 'blocos'). */
function registrarModoConcluido(fase, modo) {
  if (!fase || !modo) return;
  if (!progresso.modos || typeof progresso.modos !== 'object') progresso.modos = {};
  const atual = new Set(progresso.modos[fase.id] || []);
  atual.add(modo);
  progresso.modos[fase.id] = Array.from(atual);
  salvarProgresso();
}

function concluirFase(modo) {
  const fase = estado.fase;
  if (!fase) return;
  registrarModoConcluido(fase, modo);
  const nova = !progresso.feitas[fase.id];
  if (nova) {
    progresso.feitas[fase.id] = true;
    progresso.xp += fase.xp;
    salvarProgresso();
  }
  renderLateral();

  const proxima = FASES[estado.indice + 1];
  $('#ov-titulo').textContent = nova ? 'Missão concluída!' : 'Gravado de novo!';
  $('#ov-texto').textContent = `${fase.missao} — ${fase.nome}`;
  $('#ov-xp').textContent = nova ? `+${fase.xp} XP` : `${progresso.xp} XP no total`;
  $('#ov-proxima').style.display = proxima ? '' : 'none';
  $('#ov-proxima').textContent = proxima ? `Próxima: ${proxima.nome} →` : '';
  $('#overlay').classList.remove('oculto');
}

/* ------------------------------------------------------------
 * Zoom da área de trabalho (editor + instrução + digitação)
 * ---------------------------------------------------------- */
const ZOOM_MIN = 0.8, ZOOM_MAX = 2.0, ZOOM_PASSO = 0.1;
const CHAVE_ZOOM = 'arduino_academy_zoom_v1';

function lerZoom() {
  try {
    const v = parseFloat(localStorage.getItem(CHAVE_ZOOM));
    if (v >= ZOOM_MIN && v <= ZOOM_MAX) return v;
  } catch (e) { /* sem storage */ }
  return 1;
}

function aplicarZoom(v, salvar) {
  estado.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(v * 100) / 100));
  document.documentElement.style.setProperty('--zoom', estado.zoom);
  $('#zoom-valor').textContent = Math.round(estado.zoom * 100) + '%';
  $('#bt-zoom-menos').disabled = estado.zoom <= ZOOM_MIN + 0.001;
  $('#bt-zoom-mais').disabled = estado.zoom >= ZOOM_MAX - 0.001;
  if (salvar !== false) {
    try { localStorage.setItem(CHAVE_ZOOM, String(estado.zoom)); } catch (e) { /* ignora */ }
  }
  if (estado.aba === 'livre') renderLivre();
  autoLargurarEditor();   // o tamanho da fonte muda a largura ideal do código
}

const mudarZoom = (d) => aplicarZoom(estado.zoom + d);

/* Rótulo da barra de zoom: diz em que modo o painel está. */
function rotuloPainel(texto) { $('#did-rotulo').textContent = texto; }

/* ------------------------------------------------------------
 * Largura do painel de código (Modo Treinamento)
 * ------------------------------------------------------------
 * Por padrão a coluna do editor se auto-ajusta à largura do
 * código da missão (largura "autojustificada"), igual ao
 * comportamento de zoom: recalcula a cada troca de missão ou de
 * zoom. Assim que o aluno arrasta o divisor #resizer-palco, essa
 * escolha manual passa a mandar e fica salva entre sessões —
 * duplo-clique no divisor volta para o automático.
 * ---------------------------------------------------------- */
const CHAVE_LARGURA = 'arduino_academy_largura_editor_v1';
const LARGURA_MIN = 300;
const FOLGA_INSTRUCAO = 340; // espaço mínimo garantido para o painel didático

function lerLarguraSalva() {
  try {
    const v = parseFloat(localStorage.getItem(CHAVE_LARGURA));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch (e) { return null; }
}

function limitarLarguraEditor(px) {
  const palco = $('#palco');
  const largoPalco = (palco && palco.clientWidth) || window.innerWidth;
  const maximo = Math.max(LARGURA_MIN, largoPalco - FOLGA_INSTRUCAO);
  return Math.min(Math.max(Math.round(px), LARGURA_MIN), maximo);
}

/* Mede o texto no mesmo monoespaçado do editor, sem depender do
 * DOM (funciona mesmo com linhas ainda não reveladas no treino). */
let _canvasMedida = null;
function larguraTextoMono(texto, pxFonte) {
  if (!_canvasMedida) _canvasMedida = document.createElement('canvas');
  const ctx = _canvasMedida.getContext('2d');
  ctx.font = pxFonte + 'px ' +
    getComputedStyle(document.documentElement).getPropertyValue('--mono');
  return ctx.measureText(texto).width;
}

/* Ajusta a coluna do editor ao conteúdo da missão aberta — só age
 * se o aluno ainda não escolheu uma largura manualmente. */
function autoLargurarEditor() {
  if (lerLarguraSalva() !== null) return;
  const palco = $('#palco');
  const fase = estado.fase;
  if (!palco || !fase || palco.classList.contains('sem-painel')) return;

  const linhas = dividirLinhas(fase.solucao);
  const pxFonte = 14 * estado.zoom;   // --fs-cod
  let maiorLinha = 0;
  linhas.forEach((l) => {
    const w = larguraTextoMono(l, pxFonte);
    if (w > maiorLinha) maiorLinha = w;
  });
  const gutterW = 54 * estado.zoom;          // --gutter-w
  const padX = 14 * estado.zoom * 2;         // --cod-pad-x nas duas bordas
  const folga = 24;                          // respiro visual
  const alvo = limitarLarguraEditor(Math.max(palco.clientWidth * .60, gutterW + maiorLinha + padX + folga));
  palco.style.setProperty('--col-editor', alvo + 'px');
}

function aplicarLarguraSalva() {
  const v = lerLarguraSalva();
  const palco = $('#palco');
  if (v !== null && palco) {
    palco.style.setProperty('--col-editor', limitarLarguraEditor(v) + 'px');
  } else {
    autoLargurarEditor();
  }
}

function configurarResizerPalco() {
  const resizer = $('#resizer-palco');
  const palco = $('#palco');
  const areaEditor = $('#area-editor');
  if (!resizer || !palco || !areaEditor) return;

  let arrastando = false, inicioX = 0, larguraInicial = 0, ultimaLargura = 0;

  resizer.addEventListener('mousedown', (ev) => {
    if (palco.classList.contains('sem-painel')) return;
    arrastando = true;
    resizer.classList.add('arrastando');
    inicioX = ev.clientX;
    larguraInicial = areaEditor.getBoundingClientRect().width;
    ultimaLargura = larguraInicial;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    ev.preventDefault();
  });

  window.addEventListener('mousemove', (ev) => {
    if (!arrastando) return;
    ultimaLargura = limitarLarguraEditor(larguraInicial + (ev.clientX - inicioX));
    palco.style.setProperty('--col-editor', ultimaLargura + 'px');
  });

  window.addEventListener('mouseup', () => {
    if (!arrastando) return;
    arrastando = false;
    resizer.classList.remove('arrastando');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    try { localStorage.setItem(CHAVE_LARGURA, String(ultimaLargura)); } catch (e) { /* ignora */ }
  });

  /* duplo-clique: volta para a largura automática */
  resizer.addEventListener('dblclick', () => {
    try { localStorage.removeItem(CHAVE_LARGURA); } catch (e) { /* ignora */ }
    autoLargurarEditor();
  });

  /* a janela pode mudar de tamanho — mantém a largura salva dentro
     dos limites e recalcula a automática quando não há escolha manual */
  let temporizadorResize = null;
  window.addEventListener('resize', () => {
    clearTimeout(temporizadorResize);
    temporizadorResize = setTimeout(aplicarLarguraSalva, 120);
    if (typeof blocosRedimensionar === 'function') blocosRedimensionar();
  });
}

/* ------------------------------------------------------------
 * Tema (claro por padrão, escuro opcional)
 * ---------------------------------------------------------- */
const CHAVE_TEMA = 'arduino_academy_tema_v1';

function lerTema() {
  try {
    const t = localStorage.getItem(CHAVE_TEMA);
    if (t === 'claro' || t === 'escuro') return t;
  } catch (e) { /* sem storage */ }
  return 'claro';
}

function aplicarTema(t, salvar) {
  estado.tema = (t === 'escuro') ? 'escuro' : 'claro';
  document.documentElement.setAttribute('data-tema', estado.tema);
  const bt = $('#bt-tema');
  if (bt) {
    bt.innerHTML = `<svg class="ui-icon" aria-hidden="true"><use href="#ic-${estado.tema === 'claro' ? 'sun' : 'moon'}"></use></svg>`;
    bt.title = estado.tema === 'claro' ? 'Mudar para o tema escuro' : 'Mudar para o tema claro';
    bt.setAttribute('aria-label', bt.title);
    bt.setAttribute('aria-pressed', String(estado.tema === 'escuro'));
  }
  if (salvar !== false) {
    try { localStorage.setItem(CHAVE_TEMA, estado.tema); } catch (e) { /* ignora */ }
  }
  if (typeof desenharTracador === 'function') desenharTracador();
  if (typeof blocosAoTrocarTema === 'function') blocosAoTrocarTema();
}

const alternarTema = () => aplicarTema(estado.tema === 'claro' ? 'escuro' : 'claro');

/* ------------------------------------------------------------
 * Painel inferior: Saída / Monitor Serial / Traçador Serial
 * ---------------------------------------------------------- */
function mostrarPainelInf(nome) {
  estado.painelInf = nome;
  $('#console-wrap').classList.remove('recolhido');
  $('#bt-recolher').textContent = '▾';
  document.querySelectorAll('#console-abas .aba-con').forEach((b) => {
    b.classList.toggle('ativa', b.dataset.painel === nome);
  });
  $('#painel-saida').hidden = nome !== 'saida';
  $('#painel-monitor').hidden = nome !== 'monitor';
  $('#painel-tracador').hidden = nome !== 'tracador';
  if ($('#painel-aovivo')) $('#painel-aovivo').hidden = nome !== 'aovivo';
  $('#bt-monitor').classList.toggle('ativo', nome === 'monitor');
  if (nome === 'tracador' && typeof desenharTracador === 'function') desenharTracador();
}

/* ------------------------------------------------------------
 * Modo professor — libera o botão "Pular" do Modo Treinamento,
 * igual ao `eh_professor` do mod (board.lua). A senha fica no
 * menu Ajuda; aqui só mora o liga/desliga.
 * Por padrão vem SEMPRE desligado ao abrir a IDE — não persiste
 * entre sessões, então a senha é pedida de novo a cada uso.
 * ---------------------------------------------------------- */
function aplicarProfessor(ligado) {
  estado.professor = !!ligado;
  $('#selo-professor').hidden = !estado.professor;
  renderLateral();
  if (estado.treino) renderTreino();
}

/* Pula a linha atual: ela entra no código como se tivesse sido
   digitada, mas conta no placar de linhas puladas. */
function pularLinha() {
  const t = estado.treino;
  if (!estado.professor || !t || t.idx >= t.linhas.length) return;
  t.puladas = (t.puladas || 0) + 1;
  t.idx++;
  $('#entrada').value = '';
  const recado = $('#recado');
  if (t.idx >= t.linhas.length) {
    estado.etapa = 'concluido';
    recado.textContent = '✓ Código completo! Agora é só fazer o Upload para a placa.';
    recado.className = 'ok';
    log('Treinamento concluído — código pronto para gravar.', 'ok');
  } else {
    recado.textContent = 'Linha pulada pelo professor.';
    recado.className = '';
  }
  renderTreino();
  $('#entrada').focus();
}

/* ------------------------------------------------------------
 * Eventos
 * ---------------------------------------------------------- */
function ligarEventos() {
  $('#aba-treino').addEventListener('click', () => trocarAba('treino'));
  $('#aba-livre').addEventListener('click', () => trocarAba('livre'));
  $('#aba-completo').addEventListener('click', () => trocarAba('completo'));
  $('#aba-blocos').addEventListener('click', () => trocarAba('blocos'));
  $('#aba-joystick').addEventListener('click', () => trocarAba('joystick'));

  /* some com a dica "role para baixo" assim que o aluno começa a rolar */
  $('#didatico').addEventListener('scroll', () => {
    const dica = $('#dica-rolar');
    if (dica && !dica.hidden && $('#didatico').scrollTop > 16) dica.hidden = true;
  });

  configurarResizerPalco();

  $('#bt-compilar').addEventListener('click', compilar);
  $('#bt-upload').addEventListener('click', gravar);
  $('#bt-portas').addEventListener('click', listarPortas);
  $('#porta').addEventListener('change', aoTrocarPorta);

  $('#entrada').addEventListener('input', renderAlvo);
  $('#entrada').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); verificarLinha(); }
  });
  $('#bt-verificar').addEventListener('click', verificarLinha);
  $('#bt-pular').addEventListener('click', pularLinha);
  $('#bt-reiniciar').addEventListener('click', iniciarTreino);
  $('#bt-sair').addEventListener('click', () => {
    estado.treino = null;
    estado.etapa = 'instrucao';
    $('#faixa-treino').classList.add('oculto');
    renderEditorTreino();
    renderInstrucao();
    atualizarBotoes();
  });

  const ta = $('#editor-livre');
  ta.addEventListener('input', () => { renderLivre(); atualizarBotoes(); atualizarCursor(); });
  ta.addEventListener('keyup', atualizarCursor);
  ta.addEventListener('click', atualizarCursor);
  ta.addEventListener('scroll', () => {
    $('#editor-livre-wrap .editor-grade').style.transform = `translateY(${-ta.scrollTop}px)`;
    $('#realce-livre').style.transform = `translateX(${-ta.scrollLeft}px)`;
  });
  ta.addEventListener('keydown', (ev) => {
    if (ev.key === 'Tab') {
      ev.preventDefault();
      const i = ta.selectionStart;
      ta.setRangeText('  ', i, ta.selectionEnd, 'end');
      renderLivre();
    }
  });

  $('#bt-zoom-menos').addEventListener('click', () => mudarZoom(-ZOOM_PASSO));
  $('#bt-zoom-mais').addEventListener('click', () => mudarZoom(+ZOOM_PASSO));
  $('#bt-zoom-reset').addEventListener('click', () => aplicarZoom(1));

  document.querySelectorAll('#console-abas .aba-con').forEach((b) => {
    b.addEventListener('click', () => mostrarPainelInf(b.dataset.painel));
  });
  $('#bt-limpar').addEventListener('click', () => {
    if (estado.painelInf === 'saida') consoleEl.innerHTML = '';
    else if (typeof limparMonitor === 'function') limparMonitor();
  });
  $('#bt-recolher').addEventListener('click', () => {
    const w = $('#console-wrap');
    w.classList.toggle('recolhido');
    $('#bt-recolher').textContent = w.classList.contains('recolhido') ? '▴' : '▾';
  });
  $('#bt-tema').addEventListener('click', alternarTema);
  $('#bt-monitor').addEventListener('click', () => {
    mostrarPainelInf(estado.painelInf === 'monitor' ? 'saida' : 'monitor');
  });

  $('#ov-fechar').addEventListener('click', () => $('#overlay').classList.add('oculto'));
  $('#ov-proxima').addEventListener('click', () => {
    $('#overlay').classList.add('oculto');
    abrirFase(estado.indice + 1);
  });

  $('#bt-zerar').addEventListener('click', () => {
    if (!confirm('Zerar o progresso (XP e missões concluídas) deste computador?')) return;
    progresso.xp = 0;
    progresso.feitas = {};
    salvarProgresso();
    renderLateral();
    abrirFase(0);
  });

  document.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'u') {
      ev.preventDefault();
      if (podeGravar()) gravar();
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'r' && ev.shiftKey) {
      ev.preventDefault(); compilar();
    }
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === '+' || ev.key === '=')) {
      ev.preventDefault(); mudarZoom(+ZOOM_PASSO);
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key === '-') {
      ev.preventDefault(); mudarZoom(-ZOOM_PASSO);
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key === '0') {
      ev.preventDefault(); aplicarZoom(1);
    }
  });
}

/* ------------------------------------------------------------
 * Início
 * ---------------------------------------------------------- */
function iniciar() {
  aplicarTema(lerTema(), false);
  aplicarProfessor(false, false);   // modo professor sempre começa desligado ao abrir a IDE
  ligarEventos();
  aplicarZoom(lerZoom(), false);
  renderLateral();
  log('MIDE EDU — ' + MODULOS.length + ' módulos, ' + FASES.length + ' missões', 'info');
  log('Escolha uma missão à esquerda, leia a instrução e treine o código linha por linha.', 'fraco');

  /* abre a primeira missão ainda não concluída */
  let i = FASES.findIndex((f) => !progresso.feitas[f.id]);
  if (i < 0) i = 0;
  abrirFase(i);
  aplicarLarguraSalva();   // se o aluno já tinha arrastado o divisor antes, restaura essa largura

  checarServidor();
  setInterval(listarPortas, 8000);
}

document.addEventListener('DOMContentLoaded', iniciar);
