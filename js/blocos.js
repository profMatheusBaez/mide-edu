/* ============================================================
 * blocos.js — MIDE EDU, Modo Blocos
 * ------------------------------------------------------------
 * Integração com a IDE: registro da aba, injeção do workspace,
 * tema claro/escuro, painel de código.
 *
 * A coluna de categorias É a toolbox nativa do Blockly (categorias
 * coloridas pela categorystyle — blocos_tema.js), só restilizada
 * em blocos.css para lembrar a coluna vertical do Scratch; não
 * existe flyout/coluna reimplementados à mão aqui, para não correr
 * atrás da lógica interna de posicionamento do Blockly.
 *
 * Blockly vendorizado: blockly@13.3.0 (js/vendor/blockly/).
 * Locale pt-BR: js/vendor/blockly/pt-br.js é carregado como
 * <script> comum (não módulo) depois de blockly.min.js — nesse
 * caso o próprio arquivo já injeta as mensagens em Blockly.Msg
 * (ver o `factory()` no topo do arquivo: branch "Browser"), então
 * NÃO existe Blockly.setLocale nesta versão e a chamada foi
 * removida do index.html (plano §3, "não inventar um shim":
 * testado neste projeto e confirmado que a forma do script tag já
 * resolve sozinha, ver console: Blockly.Msg.DELETE_BLOCK em pt-BR).
 * Ver PLANO-modo-blocos.md §3, §8, §12.
 *
 * PERFIS POR PLACA (plano-pybricks-lr13000 §6.1): o mesmo motor de
 * blocos atende o Arduino Uno (toolbox + gerador C++) e o LEGO
 * Technic/Pybricks (toolbox + gerador Python). Trocar de placa troca a
 * toolbox e o gerador e guarda/restaura o workspace daquela placa
 * (em memória e em localStorage, um rascunho por placa).
 * ============================================================ */
'use strict';

/* "Mude X para Y" no lugar do "definir X para Y" padrão do
   Blockly — só esta mensagem é customizada (plano §6.4). */
if (typeof Blockly !== 'undefined' && Blockly.Msg) {
  Blockly.Msg['VARIABLES_SET'] = 'mude %1 para %2';
}

const PERFIS_BLOCOS = {
  uno: {
    rotulo: 'Código gerado (C++)',
    toolboxCompleta: () => blocosMontarToolbox(),
    toolbox: () => guiaFiltrarToolbox(blocosMontarToolbox(), guiaPaleta(), { UNO_VARIAVEIS: ['variables_set', 'variables_get', 'variaveis_somar'] }),
    itensCustom: (nome) => (nome === 'UNO_VARIAVEIS' ? [
      { kind: 'block', type: 'variables_set', inputs: { VALUE: _num(0) } },
      { kind: 'block', type: 'variaveis_somar', inputs: { VALOR: _num(1) } },
      { kind: 'block', type: 'variables_get' },
    ] : []),
    gerar: (ws) => blocosGerarSketch(ws),
    realce: (codigo) => (typeof realcar === 'function' ? realcar(codigo) : codigo),
  },
  lego: {
    rotulo: 'Código gerado (Python)',
    toolbox: () => blocosMontarToolboxLego(),
    gerar: (ws) => blocosGerarPython(ws),
    realce: (codigo) => (typeof realcarPython === 'function' ? realcarPython(codigo) : codigo),
  },
  /* BBC micro:bit V2 (plano-microbit-v2): vocabulário do MakeCode. O workspace é a ÚNICA fonte;
     JavaScript e MicroPython saem dele. `linguagem` do curso decide qual é o código que vale
     (Verificar/Enviar); o painel pode mostrar a outra só para ler. */
  microbit: {
    rotulo: () => 'Código gerado (' + (blocosLinguagemMb() === 'micropython' ? 'MicroPython' : 'JavaScript') + ')',
    toolboxCompleta: () => blocosMontarToolboxMB({ linguagem: blocosLinguagemMb(), permitidos: null }),
    toolbox: () => blocosMontarToolboxMB({ linguagem: blocosLinguagemMb(), permitidos: guiaPaleta() }),
    /* a categoria Variáveis é montada na hora (mbFlyoutVariaveis): estes são os blocos dela */
    itensCustom: (nome) => (nome === 'MB_VARIAVEIS' ? [
      { kind: 'block', type: 'mb_var_definir', inputs: { VALOR: _num(0) } },
      { kind: 'block', type: 'mb_var_mudar', inputs: { VALOR: _num(1) } },
      { kind: 'block', type: 'variables_get' },
    ] : []),
    gerar: (ws) => (blocosLinguagemMb() === 'micropython' ? blocosGerarMbPy(ws) : blocosGerarMbJs(ws)),
    realce: (codigo) => (typeof realcarMicrobit === 'function' ? realcarMicrobit(codigo, blocosLinguagemMb()) : codigo),
    tema: (escuro) => (escuro ? BLOCOS_TEMA_MB_ESCURO : BLOCOS_TEMA_MB_CLARO),
  },
};

/* Linguagem mostrada no painel de código do perfil micro:bit: a do curso, ou a outra
   se o aluno alternou no painel (somente para ler). */
function blocosLinguagemMb() {
  if (estadoBlocos.visaoMb) return estadoBlocos.visaoMb;
  return (typeof estado !== 'undefined' && estado.linguagem === 'micropython') ? 'micropython' : 'js';
}

/* Tema do workspace: o do perfil, se ele tiver um; senão o do Scratch. */
function blocosTemaAtual() {
  const escuro = document.documentElement.getAttribute('data-tema') === 'escuro';
  const perfil = PERFIS_BLOCOS[estadoBlocos.perfil];
  if (perfil && perfil.tema) return perfil.tema(escuro);
  return escuro ? BLOCOS_TEMA_ESCURO : BLOCOS_TEMA_CLARO;
}

const estadoBlocos = {
  workspace: null,
  injetado: false,
  temporizadorCodigo: null,
  temporizadorRascunho: null,
  ultimoCodigo: '',
  perfil: 'uno',        // 'uno' | 'lego' | 'microbit' — ver PERFIS_BLOCOS
  faseMb: null,         // micro:bit: id da missão aberta (o rascunho de blocos é por missão)
  visaoMb: null,        // micro:bit: null (linguagem do curso) | 'js' | 'micropython' (só ler)
  paletaMb: null,       // micro:bit: Set de tipos liberados pela fase (null = todos)
  carregando: false,    // true enquanto um workspace é (re)carregado: não vira rascunho
};

/* Toolbox do perfil atual (já filtrada no Guiado), com o nome da categoria no alto de cada flyout. */
function blocosToolboxAtual() {
  const def = PERFIS_BLOCOS[estadoBlocos.perfil].toolbox();
  return typeof blocosComTitulos === 'function' ? blocosComTitulos(def) : def;
}

/* Placas com o seletor Livre / Guiado (as que têm missões). */
const blocosComMissoes = (perfil) => ['uno', 'microbit', 'k10'].includes(perfil || estadoBlocos.perfil);

/* Rascunhos: um por placa. Em memória (troca de placa na mesma sessão) e
   em localStorage (fechar e reabrir a IDE mantém os blocos, sem misturar
   Uno e LEGO). */
const rascunhosBlocos = new Map();
const chaveRascunhoBlocos = (chave) => 'academy_blocos_rascunho_' + String(chave).replace(':', '_') + '_v1';
/* Modo livre: um rascunho por placa (a mesma chave de antes do guiado, para não perder nada).
   Modo guiado: um rascunho por missão (na micro:bit, o mesmo nas duas linguagens). */
const blocosChave = () => {
  const p = estadoBlocos.perfil;
  if (blocosComMissoes(p) && typeof guiaModoAtivo === 'function' && guiaModoAtivo() === 'guiado' && GUIA.fase) return p + ':' + GUIA.fase.id;
  return p;
};

/* ------------------------------------------------------------
 * Injeção do workspace — só na primeira vez que a aba é exibida.
 * Injetar com o container display:none produz um workspace 0×0
 * (plano §8.2 / §12) — por isso isto só roda dentro de
 * blocosAoAbrir(), nunca no carregamento da página.
 * ---------------------------------------------------------- */
function blocosInjetar() {
  if (estadoBlocos.injetado) return;

  const ws = Blockly.inject('blocos-workspace', {
    toolbox: blocosToolboxAtual(),
    /* sprites (zoom, lixeira) e sons vêm da cópia local — sem isto o Blockly busca em static.blockly.com */
    media: 'js/vendor/blockly/media/',
    renderer: 'zelos',
    theme: blocosTemaAtual(),
    trashcan: true,
    zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 2, minScale: 0.4, scaleSpeed: 1.1 },
    grid: { spacing: 24, length: 2, colour: 'rgba(0,0,0,.12)', snap: false },
    move: { scrollbars: true, drag: true, wheel: false },
  });
  estadoBlocos.workspace = ws;
  estadoBlocos.injetado = true;

  ws.registerButtonCallback('blocosCriarVariavel', () => {
    Blockly.Variables.createVariableButtonHandler(ws);
  });
  /* categoria "Variáveis" do micro:bit (blocos "definir/mudar", no vocabulário do MakeCode) */
  if (typeof mbFlyoutVariaveis === 'function') ws.registerToolboxCategoryCallback('MB_VARIAVEIS', mbFlyoutVariaveis);
  if (typeof blocosFlyoutVariaveisUno === 'function') ws.registerToolboxCategoryCallback('UNO_VARIAVEIS', blocosFlyoutVariaveisUno);

  ws.addChangeListener((ev) => {
    if (estadoBlocos.carregando) return;
    if (ev.isUiEvent) {
      /* abrir uma categoria cria os blocos do flyout: o guia volta a piscar o bloco certo */
      if (ev.type === Blockly.Events.TOOLBOX_ITEM_SELECT || ev.type === Blockly.Events.BLOCK_DRAG || ev.type === Blockly.Events.VIEWPORT_CHANGE) guiaAoMudarWorkspace(ev);
      return;
    }
    blocosAvaliarHats();
    guiaAoMudarWorkspace(ev);
    blocosAgendarAtualizarCodigo();
    blocosAgendarSalvarRascunho();
  });

  blocosCarregarRascunho(estadoBlocos.perfil);
  blocosAtualizarRotulo();
  blocosAtualizarCodigo();
  guiaAtualizar();
  window.addEventListener('pagehide', blocosSalvarRascunho);
}

/* ------------------------------------------------------------
 * Rascunho por placa
 * ---------------------------------------------------------- */
function blocosSalvarRascunho() {
  const ws = estadoBlocos.workspace;
  if (!ws || estadoBlocos.carregando) return;
  clearTimeout(estadoBlocos.temporizadorRascunho);
  let texto;
  try { texto = JSON.stringify(Blockly.serialization.workspaces.save(ws)); } catch (e) { return; }
  rascunhosBlocos.set(blocosChave(), texto);
  try { localStorage.setItem(chaveRascunhoBlocos(blocosChave()), texto); } catch (e) { /* sem storage: fica na memória */ }
}

function blocosAgendarSalvarRascunho() {
  clearTimeout(estadoBlocos.temporizadorRascunho);
  estadoBlocos.temporizadorRascunho = setTimeout(blocosSalvarRascunho, 800);
}

/* Carrega no workspace o rascunho da placa (memória primeiro, depois
   localStorage). Sem rascunho, o workspace fica vazio. */
function blocosCarregarRascunho() {
  const ws = estadoBlocos.workspace;
  if (!ws) return;
  const chave = blocosChave();
  let texto = rascunhosBlocos.get(chave);
  if (texto == null) {
    try { texto = localStorage.getItem(chaveRascunhoBlocos(chave)); } catch (e) { texto = null; }
  }
  estadoBlocos.carregando = true;
  try {
    ws.clear();
    if (texto) {
      try { Blockly.serialization.workspaces.load(JSON.parse(texto), ws); }
      catch (e) { ws.clear(); }   /* rascunho corrompido: começa vazio, sem travar a aba */
    }
    if (guiaModoAtivo() === 'guiado') guiaCriarVariaveis(ws);   // as variáveis da missão já existem
  } finally { estadoBlocos.carregando = false; }
  blocosAvaliarHats();
}

/* Livre ↔ Guiado, ou outra missão no guiado: toolbox, rascunho e passos de novo. */
function blocosReconfigurarPorModo() {
  if (blocosComMissoes()) {
    guiaPrepararFase(guiaModoAtivo() === 'guiado' && typeof estado !== 'undefined' ? estado.fase : null);
  } else {
    guiaPrepararFase(null);
  }
  const ws = estadoBlocos.workspace;
  if (ws) {
    ws.updateToolbox(blocosToolboxAtual());
    blocosCarregarRascunho();
    blocosAtualizarCodigo();
    requestAnimationFrame(() => Blockly.svgResize(ws));
  }
  blocosAtualizarRotulo();
  guiaAtualizar();
}

/* Uma missão foi aberta no currículo: no guiado, os blocos passam a ser os dela. */
function blocosAoAbrirFase(fase) {
  if (!blocosComMissoes()) return;
  if (guiaModoAtivo() !== 'guiado') { GUIA.fase = null; guiaRenderBarra(); return; }
  if (GUIA.fase === fase && GUIA.compilado) return;
  blocosSalvarRascunho();   // com a chave da missão que estava aberta
  blocosReconfigurarPorModo();
}

/* Troca o perfil (Uno ↔ LEGO): guarda o workspace da placa atual, troca
   toolbox + gerador e restaura o workspace da nova placa. */
function blocosTrocarPerfil(perfil) {
  if (!PERFIS_BLOCOS[perfil] || estadoBlocos.perfil === perfil) return;
  blocosSalvarRascunho();
  estadoBlocos.perfil = perfil;
  estadoBlocos.visaoMb = null;
  estadoBlocos.paletaMb = null;
  GUIA.modo = guiaLerModo();
  GUIA.fase = null;
  const ws = estadoBlocos.workspace;
  if (ws) ws.setTheme(blocosTemaAtual());
  if (!ws) estadoBlocos.ultimoCodigo = '';
  blocosReconfigurarPorModo();
}

function blocosAtualizarRotulo() {
  const cab = document.getElementById('blocos-codigo-rotulo') || document.querySelector('.blocos-codigo-cab');
  if (!cab) return;
  const r = PERFIS_BLOCOS[estadoBlocos.perfil].rotulo;
  cab.textContent = typeof r === 'function' ? r() : r;
  /* micro:bit: alternar entre ver o JavaScript e o MicroPython dos mesmos blocos */
  const visao = document.getElementById('mb-visao');
  if (visao) {
    visao.hidden = estadoBlocos.perfil !== 'microbit';
    const atual = blocosLinguagemMb();
    visao.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.visao === atual)));
  }
}

/* micro:bit: reconstrói a toolbox (linguagem do curso mudou, ou a fase liberou outros blocos)
   e regera o código. `opcoes.paleta` = Set de tipos liberados, ou null para todos. */
function blocosMbReconfigurar(opcoes) {
  const o = opcoes || {};
  if ('visao' in o) estadoBlocos.visaoMb = o.visao;
  const ws = estadoBlocos.workspace;
  if (estadoBlocos.perfil !== 'microbit') return;
  if (ws) {
    ws.updateToolbox(blocosToolboxAtual());
    blocosAtualizarCodigo();
  }
  blocosAtualizarRotulo();
}

/* Carrega um workspace pronto (exemplos do menu). Só funciona com a aba
   Blocos já injetada — quem chama abre a aba antes. */
function blocosCarregarWorkspace(json) {
  const ws = estadoBlocos.workspace;
  if (!ws) return false;
  estadoBlocos.carregando = true;
  try {
    ws.clear();
    Blockly.serialization.workspaces.load(json, ws);
  } finally { estadoBlocos.carregando = false; }
  blocosAvaliarHats();
  blocosAtualizarCodigo();
  blocosSalvarRascunho();
  guiaAtualizar();
  return true;
}

/* Se houver mais de um bloco "quando ⚑ for clicado", avisa no
 * segundo em diante (plano §6.1: "o segundo fica com aviso e é
 * ignorado pelo gerador"); um segundo "sempre" não precisa do
 * mesmo tratamento porque a própria forma do bloco (sem conexão
 * inferior) já impede um segundo "sempre" na mesma pilha. */
function blocosAvaliarHats() {
  const ws = estadoBlocos.workspace;
  if (!ws) return;
  const hats = ws.getTopBlocks(true).filter((b) => b.type === 'evento_iniciar');
  hats.forEach((b, i) => {
    b.setWarningText(i > 0 ? 'Só pode haver um bloco "quando ⚑ for clicado" — este está sendo ignorado.' : null);
  });
}

/* ------------------------------------------------------------
 * Painel de código gerado — debounce de 150 ms (plano §5),
 * reaproveitando o mesmo tokenizador/realce de js/ide.js.
 * ---------------------------------------------------------- */
function blocosAgendarAtualizarCodigo() {
  clearTimeout(estadoBlocos.temporizadorCodigo);
  estadoBlocos.temporizadorCodigo = setTimeout(blocosAtualizarCodigo, 150);
}

function blocosAtualizarCodigo() {
  const ws = estadoBlocos.workspace;
  const saida = document.getElementById('blocos-codigo-saida');
  const aviso = document.getElementById('blocos-codigo-aviso');
  if (!ws || !saida) return;
  const perfil = PERFIS_BLOCOS[estadoBlocos.perfil];
  const r = perfil.gerar(ws);
  estadoBlocos.ultimoCodigo = r.codigo;
  saida.innerHTML = r.codigo ? perfil.realce(r.codigo) : '';
  if (aviso) aviso.textContent = r.aviso || '';
  if (typeof atualizarBotoes === 'function' && typeof estado !== 'undefined' && estado.aba === 'blocos') atualizarBotoes();
}

/* Código atual do Modo Blocos — chamado por codigoAtual() em
 * ide.js (mesma função usada por Verificar/Upload nos outros
 * modos; plano §8.4, "não duplicar"). */
function blocosCodigoAtual() {
  return estadoBlocos.ultimoCodigo || '';
}
function blocosPodeGravar() {
  return !!(estadoBlocos.ultimoCodigo && estadoBlocos.ultimoCodigo.trim());
}

/* ------------------------------------------------------------
 * Ciclo de vida da aba
 * ---------------------------------------------------------- */
function blocosAoAbrir() {
  if (!estadoBlocos.injetado) {
    GUIA.modo = guiaLerModo();
    if (blocosComMissoes() && guiaModoAtivo() === 'guiado') guiaPrepararFase(typeof estado !== 'undefined' ? estado.fase : null);
  } else if (blocosComMissoes() && guiaModoAtivo() === 'guiado' && typeof estado !== 'undefined' && GUIA.fase !== estado.fase) {
    blocosAoAbrirFase(estado.fase);
  }
  blocosInjetar();
  requestAnimationFrame(() => {
    if (estadoBlocos.workspace) Blockly.svgResize(estadoBlocos.workspace);
    guiaAtualizar();
  });
}

function blocosAoTrocarTema() {
  if (!estadoBlocos.workspace) return;
  /* mudar as cores do objeto Theme não redesenha sozinho — é
     preciso setTheme() (plano §12, "Tema trocado sem refreshTheme"). */
  estadoBlocos.workspace.setTheme(blocosTemaAtual());
}

function blocosRedimensionar() {
  if (estadoBlocos.workspace && typeof estado !== 'undefined' && estado.aba === 'blocos') {
    Blockly.svgResize(estadoBlocos.workspace);
  }
}
