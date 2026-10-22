/* ============================================================
 * blocos_guia.js — MIDE EDU, Modo Blocos: LIVRE e GUIADO
 * ------------------------------------------------------------
 * Livre:  toolbox completa, um rascunho por placa, sem missão.
 * Guiado: a missão aberta vira uma sequência de passos tirada do
 *         gabarito em blocos da missão (fase.blocos). A cada passo,
 *         o que o aluno precisa fazer PISCA:
 *           1. a categoria da toolbox onde está o bloco;
 *           2. o bloco dentro dela (o flyout aberto);
 *           3. o lugar onde ele encaixa (marcador amarelo no canvas);
 *           4. o campo que precisa ser ajustado (número, texto,
 *              lista, desenho dos LEDs), com o valor pedido.
 *         Bloco no lugar errado ou sobrando pisca em vermelho.
 *
 * Os passos não são uma máquina de estados: a cada mudança no
 * workspace, o primeiro passo que ainda não está feito é o passo
 * atual. Assim desfazer, apagar, arrastar fora de ordem ou abrir um
 * rascunho antigo nunca deixa o guia perdido.
 *
 * Funciona com qualquer perfil de blocos.js que tenha missões
 * (Arduino Uno, UNIHIKER K10, micro:bit). Sem DOM nas funções de
 * passos (guiaCompilar / guiaAvaliar): os testes rodam no Node com
 * um workspace headless (ferramentas/testar_blocos_guiado.mjs).
 * ============================================================ */
'use strict';

const GUIA = {
  modo: 'guiado',        // 'livre' | 'guiado' (escolha do aluno, guardada por placa)
  fase: null,            // missão do guiado
  passos: [],            // passos compilados do gabarito
  vars: new Map(),       // id da variável no gabarito → nome
  ultimo: null,          // último resultado de guiaAvaliar
  marcas: [],            // elementos destacados (para limpar)
  timer: null,
  concluidoAvisado: false,
};

const GUIA_LITERAIS = new Set(['math_number', 'text', 'logic_boolean']);

/* ------------------------------------------------------------
 * Toolbox: onde está cada bloco e o que ele traz encaixado
 * ---------------------------------------------------------- */
function guiaItensDaToolbox(def, itensCustom) {
  const itens = [];   // { item, categoria }
  const visitar = (lista, cat) => {
    for (const it of lista || []) {
      if (it.kind === 'category' && it.custom) {
        /* categoria montada na hora (Variáveis da micro:bit): o perfil diz o que ela mostra */
        for (const x of (itensCustom ? itensCustom(it.custom) : []) || []) if (x.kind === 'block') itens.push({ item: x, categoria: it.name });
      } else if (it.kind === 'category') visitar(it.contents, it.name);
      else if (it.kind === 'block') itens.push({ item: it, categoria: cat });
    }
  };
  visitar(def && def.contents, null);
  return itens;
}

/* Quantos campos do item da toolbox já batem com o nó do gabarito. */
function guiaPontos(item, no) {
  let p = 0;
  const f1 = item.fields || {}, f2 = no.fields || {};
  for (const k of Object.keys(f1)) if (k in f2 && guiaValorCampo(f2[k]) === guiaValorCampo(f1[k])) p += 2;
  if (JSON.stringify(item.extraState || null) === JSON.stringify(no.extraState || null)) p += 1;
  return p;
}

function guiaMelhorItem(itens, no) {
  let melhor = null, pontos = -1;
  for (const x of itens) {
    if (x.item.type !== no.type) continue;
    const p = guiaPontos(x.item, no);
    if (p > pontos) { melhor = x; pontos = p; }
  }
  return melhor;
}

function guiaValorCampo(v) {
  if (v && typeof v === 'object') return 'var:' + (v.name || v.id || '');
  return String(v);
}

/* ------------------------------------------------------------
 * Passos a partir do gabarito
 *   caminho: [['t', i]] = i-ésimo bloco de topo; depois
 *            ['i', NOME] = o que está encaixado na entrada NOME,
 *            ['n']       = o bloco logo abaixo
 * ---------------------------------------------------------- */
function guiaCompilar(gabarito, toolboxDef, opcoes) {
  const op = opcoes || {};
  const itens = guiaItensDaToolbox(toolboxDef, op.itensCustom);
  const vars = new Map();
  for (const v of (gabarito && gabarito.variables) || []) vars.set(v.id, v.name);
  const passos = [];
  const tipos = new Set();

  const nomeVar = (valor) => (valor && typeof valor === 'object' ? (valor.name || vars.get(valor.id) || valor.id) : valor);

  /* pre = o que o bloco do pai já traz naquela entrada (shadow ou bloco da toolbox) */
  function bloco(no, caminho, lugar, pre) {
    const jaVem = pre && pre.type === no.type;
    if (!jaVem) {
      const achado = guiaMelhorItem(itens, no);
      passos.push({ tipo: 'bloco', caminho, no, lugar, categoria: achado ? achado.categoria : (op.categoriaDe && op.categoriaDe(no.type)) || null, item: achado ? achado.item : null });
      tipos.add(no.type);
      pre = achado ? achado.item : null;
    }
    for (const [nome, valor] of Object.entries(no.fields || {})) {
      passos.push({ tipo: 'campo', caminho, campo: nome, valor: nomeVar(valor), variavel: !!(valor && typeof valor === 'object'), no });
    }
    if (no.extraState && !jaVem && pre && JSON.stringify(pre.extraState || null) !== JSON.stringify(no.extraState)) {
      passos.push({ tipo: 'forma', caminho, no });
    }
    const preEntradas = (pre && pre.inputs) || {};
    for (const [nome, ent] of Object.entries(no.inputs || {})) {
      const filho = ent.block || ent.shadow;
      if (!filho) continue;
      const preFilho = preEntradas[nome] ? (preEntradas[nome].block || preEntradas[nome].shadow) : null;
      encadear(filho, caminho.concat([['i', nome]]), { tipo: 'entrada', nome }, preFilho);
    }
  }
  function encadear(no, caminho, lugar, pre) {
    let atual = no, cam = caminho, lug = lugar, p = pre;
    while (atual) {
      bloco(atual, cam, lug, p);
      if (!atual.next || !atual.next.block) break;
      atual = atual.next.block;
      cam = cam.concat([['n']]);
      lug = { tipo: 'proximo' };
      p = null;
    }
  }
  const topos = ((gabarito && gabarito.blocks && gabarito.blocks.blocks) || []);
  topos.forEach((no, i) => encadear(no, [['t', i]], { tipo: 'topo' }, null));
  return { passos, vars, tipos, topos };
}

/* ------------------------------------------------------------
 * Avaliar o workspace: qual é o primeiro passo que falta?
 * ---------------------------------------------------------- */
function guiaCampoVivo(bloco, nome) {
  const f = bloco && bloco.getField(nome);
  if (!f) return undefined;
  if (typeof f.getVariable === 'function') { const v = f.getVariable(); return v ? v.getName() : null; }
  return f.getValue();
}

function guiaIgual(vivo, esperado) {
  if (vivo === undefined) return false;
  if (typeof esperado === 'number' || (typeof esperado === 'string' && esperado !== '' && !isNaN(esperado) && !isNaN(vivo) && vivo !== '' && vivo !== null)) {
    return Number(vivo) === Number(esperado);
  }
  if (typeof esperado === 'boolean') return String(vivo).toUpperCase() === String(esperado).toUpperCase();
  return String(vivo) === String(esperado);
}

/* Liga cada bloco de topo do gabarito a um bloco de topo do workspace (mesmo tipo,
   campos mais parecidos, na ordem em que aparecem na tela). */
function guiaMapearTopos(ws, compilado) {
  const vivos = ws.getTopBlocks(true).filter((b) => !b.isShadow());
  const usados = new Set();
  const mapa = [];
  compilado.topos.forEach((no, i) => {
    let melhor = null, pontos = -1;
    for (const b of vivos) {
      if (usados.has(b) || b.type !== no.type) continue;
      let p = 0;
      for (const [k, val] of Object.entries(no.fields || {})) if (guiaIgual(guiaCampoVivo(b, k), compilado.vars.get(val && val.id) || (val && val.name) || val)) p++;
      if (p > pontos) { melhor = b; pontos = p; }
    }
    if (melhor) usados.add(melhor);
    mapa[i] = melhor;
  });
  return { mapa, vivos, usados };
}

function guiaResolver(topos, caminho) {
  let b = null;
  for (const seg of caminho) {
    if (seg[0] === 't') b = topos.mapa[seg[1]];
    else if (!b) return null;
    else if (seg[0] === 'i') b = b.getInputTargetBlock(seg[1]);
    else b = b.getNextBlock();
    if (!b) return null;
  }
  return b;
}

function guiaAvaliar(ws, compilado) {
  const topos = guiaMapearTopos(ws, compilado);
  const total = compilado.passos.length;
  for (let k = 0; k < total; k++) {
    const p = compilado.passos[k];
    const vivo = guiaResolver(topos, p.caminho);
    if (p.tipo === 'bloco') {
      if (vivo && vivo.type === p.no.type && !(vivo.isShadow() && !GUIA_LITERAIS.has(p.no.type))) continue;
      const pai = p.caminho.length > 1 ? guiaResolver(topos, p.caminho.slice(0, -1)) : null;
      const errado = vivo && !vivo.isShadow() ? vivo : null;
      return { indice: k, total, passo: p, pai, errado, topos };
    }
    if (p.tipo === 'campo') {
      if (vivo && guiaIgual(guiaCampoVivo(vivo, p.campo), p.valor)) continue;
      return { indice: k, total, passo: p, bloco: vivo, topos };
    }
    if (p.tipo === 'forma') {
      const estado = vivo && vivo.saveExtraState ? vivo.saveExtraState() : null;
      if (JSON.stringify(estado || null) === JSON.stringify(p.no.extraState || null)) continue;
      return { indice: k, total, passo: p, bloco: vivo, topos };
    }
  }
  /* tudo montado: sobrou algum bloco? */
  const extras = [];
  const esperados = new Set();
  const marcar = (no, b) => {
    if (!b) return;
    esperados.add(b);
    for (const input of b.inputList) {
      const alvo = input.connection && input.connection.targetBlock();
      if (!alvo) continue;
      const ent = no.inputs && no.inputs[input.name];
      const filho = ent && (ent.block || ent.shadow);
      if (filho) marcar(filho, alvo);
      else if (!alvo.isShadow()) extras.push(alvo);
    }
    const prox = b.getNextBlock();
    if (prox) {
      if (no.next && no.next.block) marcar(no.next.block, prox);
      else extras.push(prox);
    }
  };
  compilado.topos.forEach((no, i) => marcar(no, topos.mapa[i]));
  for (const b of topos.vivos) if (!topos.usados.has(b)) extras.push(b);
  return { indice: total, total, completo: extras.length === 0, extras, topos };
}

/* ------------------------------------------------------------
 * Textos dos passos
 * ---------------------------------------------------------- */
/* Texto curto de um bloco: os seus próprios campos, sem os blocos de dentro. */
function guiaRotuloBloco(b, soNome) {
  if (!b) return '';
  const partes = [];
  for (const input of b.inputList) {
    for (const f of input.fieldRow) {
      /* soNome: só os textos fixos e as listas (o número/texto a digitar vem no passo seguinte) */
      if (soNome && f.EDITABLE && typeof f.getOptions !== 'function') { partes.push('…'); continue; }
      if (soNome && typeof f.getVariable === 'function') continue;
      const t = (f.getText ? f.getText() : '') || '';
      if (t.trim()) partes.push(t.trim());
    }
    if (input.type === 1 /* VALUE */ && input.connection) {
      const alvo = input.connection.targetBlock();
      if (soNome) partes.push('…');
      else if (alvo && alvo.isShadow()) partes.push(guiaRotuloBloco(alvo) || '…');
      else if (alvo) partes.push('(' + (guiaRotuloBloco(alvo) || '…') + ')');
      else partes.push('…');
    }
  }
  let s = partes.join(' ').replace(/\s+/g, ' ').trim();
  if (s.length > 46) s = s.slice(0, 44).trim() + '…';
  return s || b.type;
}

/* Rótulo do bloco do gabarito, criado num workspace invisível. */
let _guiaWsTexto = null;
function guiaRotuloNo(no) {
  try {
    if (!_guiaWsTexto) _guiaWsTexto = new Blockly.Workspace();
    const so = Object.assign({}, no);
    delete so.next; delete so.x; delete so.y;
    so.inputs = {};
    for (const [k, ent] of Object.entries(no.inputs || {})) {
      const f = ent.block || ent.shadow;
      if (f && GUIA_LITERAIS.has(f.type)) so.inputs[k] = { shadow: f };
    }
    const fields = Object.assign({}, no.fields || {});
    for (const [k, v] of Object.entries(fields)) if (v && typeof v === 'object') delete fields[k];
    so.fields = fields;
    const b = Blockly.serialization.blocks.append(so, _guiaWsTexto, { recordUndo: false });
    const t = guiaRotuloBloco(b, true).replace(/(?:\s*…)+\s*$/, '').replace(/(\s*…){2,}/g, ' …').trim();
    _guiaWsTexto.clear();
    return t;
  } catch (e) {
    try { _guiaWsTexto && _guiaWsTexto.clear(); } catch (e2) { /* nada */ }
    return no.type;
  }
}

function guiaTextoValor(bloco, campo, valor) {
  const f = bloco && bloco.getField(campo);
  if (f && typeof f.getOptions === 'function' && !(typeof f.getVariable === 'function')) {
    try {
      const op = f.getOptions(false).find((o) => String(o[1]) === String(valor));
      if (op) return typeof op[0] === 'string' ? op[0] : (op[0].alt || String(valor));
    } catch (e) { /* opções dinâmicas */ }
  }
  return String(valor);
}

function guiaEhDesenho(campo, valor) {
  return /^[01]{25}$/.test(String(valor)) || campo === 'LEDS';
}

function guiaTextoDoPasso(r) {
  if (!r) return { titulo: '', texto: '' };
  if (r.completo) return { titulo: 'Programa montado!', texto: 'Tudo no lugar. Clique em Verificar e depois envie para a placa para concluir a missão.', classe: 'ok' };
  if (r.extras && r.extras.length) return { titulo: 'Quase lá', texto: `Sobrou ${r.extras.length === 1 ? 'um bloco' : r.extras.length + ' blocos'} que não fazem parte desta missão (piscando em vermelho). Arraste para a lixeira.`, classe: 'erro' };
  const p = r.passo;
  const titulo = `Passo ${r.indice + 1} de ${r.total}`;
  if (p.tipo === 'bloco') {
    const nome = guiaRotuloNo(p.no);
    const cat = p.categoria ? ` (categoria ${p.categoria})` : '';
    if (r.errado) return { titulo, texto: `O bloco «${guiaRotuloBloco(r.errado)}» não vai aqui (piscando em vermelho). Tire-o daí: aqui vai «${nome}».`, classe: 'erro' };
    if (p.lugar.tipo === 'topo') return { titulo, texto: `Arraste «${nome}»${cat} para a área de programação.` };
    const pai = r.pai ? guiaRotuloBloco(r.pai) : '';
    if (p.lugar.tipo === 'proximo') return { titulo, texto: `Arraste «${nome}»${cat} e encaixe embaixo de «${pai}».` };
    const dentro = r.pai && r.pai.getInput(p.lugar.nome) && r.pai.getInput(p.lugar.nome).type === 3 /* STATEMENT */;
    return { titulo, texto: `Arraste «${nome}»${cat} e encaixe ${dentro ? 'dentro de' : 'no espaço marcado de'} «${pai}».` };
  }
  if (p.tipo === 'campo') {
    if (guiaEhDesenho(p.campo, p.valor)) return { titulo, texto: 'Clique nos LEDs do bloco piscando até o desenho ficar igual ao modelo ao lado.', desenho: String(p.valor) };
    const v = guiaTextoValor(r.bloco, p.campo, p.valor);
    if (p.variavel) return { titulo, texto: `No bloco piscando, escolha a variável «${v}».` };
    const f = r.bloco && r.bloco.getField(p.campo);
    const lista = f && typeof f.getOptions === 'function';
    return { titulo, texto: lista ? `No bloco piscando, escolha «${v}» na lista.` : `No bloco piscando, mude o valor para ${/^-?\d/.test(v) ? v : '«' + v + '»'}.` };
  }
  return { titulo, texto: 'Use a engrenagem do bloco piscando para deixá-lo igual ao da missão (acrescentar “senão” ou mais entradas).' };
}

/* ------------------------------------------------------------
 * Destaques na tela (precisa do workspace renderizado)
 * ---------------------------------------------------------- */
function guiaLimparMarcas() {
  for (const m of GUIA.marcas) {
    if (m.classe) m.el.classList.remove(m.classe);
    else if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
  }
  GUIA.marcas = [];
}
function guiaMarcar(el, classe) {
  if (!el || !el.classList) return;
  el.classList.add(classe);
  GUIA.marcas.push({ el, classe });
}

function guiaCategoriaDiv(ws, nome) {
  const tb = ws.getToolbox && ws.getToolbox();
  if (!tb || !nome) return null;
  const itens = tb.getToolboxItems ? tb.getToolboxItems() : [];
  for (const it of itens) {
    const n = typeof it.getName === 'function' ? it.getName() : it.name_;
    if (n === nome) {
      const div = it.getDiv ? it.getDiv() : null;
      return it.rowDiv_ || (div && div.querySelector('.blocklyTreeRow')) || div;
    }
  }
  return null;
}

function guiaFlyoutBloco(ws, no) {
  const tb = ws.getToolbox && ws.getToolbox();
  const fl = tb && tb.getFlyout && tb.getFlyout();
  if (!fl || !fl.isVisible || !fl.isVisible()) return null;
  const fws = fl.getWorkspace();
  let melhor = null, pontos = -1;
  for (const b of fws.getTopBlocks(true)) {
    if (b.type !== no.type) continue;
    let p = 0;
    for (const [k, v] of Object.entries(no.fields || {})) if (guiaIgual(guiaCampoVivo(b, k), v && typeof v === 'object' ? (v.name || GUIA.vars.get(v.id)) : v)) p++;
    if (p > pontos) { melhor = b; pontos = p; }
  }
  return melhor;
}

/* Marcador amarelo no ponto de encaixe (dentro do canvas: acompanha zoom e rolagem). */
function guiaMarcadorEncaixe(ws, pai, lugar) {
  if (!pai) return;
  let con = null;
  if (lugar.tipo === 'proximo') con = pai.nextConnection;
  else if (lugar.tipo === 'entrada') { const inp = pai.getInput(lugar.nome); con = inp && inp.connection; }
  if (!con || typeof con.x !== 'number') return;
  const valor = con.type === 1 /* INPUT_VALUE */;
  const svg = Blockly.utils.dom.createSvgElement('rect', {
    class: 'guia-alvo',
    x: valor ? con.x - 4 : con.x,
    y: valor ? con.y - 2 : con.y - 4,
    width: valor ? 14 : 72,
    height: valor ? 28 : 8,
    rx: 4, ry: 4,
  }, ws.getCanvas());
  GUIA.marcas.push({ el: svg });
}

function guiaDestacar(ws, r) {
  guiaLimparMarcas();
  if (!ws || !r || GUIA.modo !== 'guiado' || !ws.rendered) return;
  if (r.completo) return;
  if (r.extras && r.extras.length) { for (const b of r.extras) guiaMarcar(b.getSvgRoot(), 'guia-erro'); return; }
  const p = r.passo;
  if (p.tipo === 'bloco') {
    if (r.errado) { guiaMarcar(r.errado.getSvgRoot(), 'guia-erro'); return; }
    guiaMarcar(guiaCategoriaDiv(ws, p.categoria), 'guia-pisca');
    const fb = guiaFlyoutBloco(ws, p.no);
    if (fb) guiaMarcar(fb.getSvgRoot(), 'guia-pisca');
    if (p.lugar.tipo !== 'topo') guiaMarcadorEncaixe(ws, r.pai, p.lugar);
    return;
  }
  const b = r.bloco;
  if (!b) return;
  const f = p.tipo === 'campo' ? b.getField(p.campo) : null;
  guiaMarcar(b.isShadow() && b.getParent() ? b.getParent().getSvgRoot() : b.getSvgRoot(), 'guia-suave');
  if (f && f.getSvgRoot) guiaMarcar(f.getSvgRoot(), 'guia-pisca');
}

/* ------------------------------------------------------------
 * Barra do guia e ciclo de vida
 * ---------------------------------------------------------- */
function guiaPerfilTemMissoes() {
  return typeof estadoBlocos !== 'undefined' && ['uno', 'microbit', 'k10'].includes(estadoBlocos.perfil);
}

function guiaChaveModo() { return 'mide_blocos_modo_' + (estadoBlocos.perfil || 'x') + '_v1'; }
function guiaLerModo() {
  try { const m = localStorage.getItem(guiaChaveModo()); if (m === 'livre' || m === 'guiado') return m; } catch (e) { /* sem storage */ }
  return 'guiado';
}

function guiaModoAtivo() {
  return guiaPerfilTemMissoes() && GUIA.modo === 'guiado' ? 'guiado' : 'livre';
}

/* Gabarito da missão aberta (se houver). */
function guiaGabaritoDaFase(fase) {
  return fase && fase.blocos && fase.blocos.blocks ? fase.blocos : null;
}

/* Tipos que o aluno precisa arrastar (paleta do guiado) — null = todos. */
function guiaPaleta() {
  if (guiaModoAtivo() !== 'guiado' || !GUIA.compilado) return null;
  return GUIA.compilado.tipos;
}

/* Filtra uma toolbox de categorias deixando só os blocos permitidos. */
function guiaFiltrarToolbox(def, permitidos, custom) {
  if (!permitidos) return def;
  const filtrar = (lista) => {
    const saida = [];
    for (const it of lista || []) {
      if (it.kind === 'category') {
        if (it.custom) {
          const tipos = (custom && custom[it.custom]) || [];
          if (tipos.some((t) => permitidos.has(t))) saida.push(it);
          continue;
        }
        const dentro = filtrar(it.contents);
        if (dentro.some((x) => x.kind === 'block')) saida.push(Object.assign({}, it, { contents: dentro }));
      } else if (it.kind === 'block') {
        if (permitidos.has(it.type)) saida.push(it);
      } else saida.push(it);   // botões, rótulos
    }
    return saida;
  };
  return Object.assign({}, def, { contents: filtrar(def.contents) });
}

/* Prepara o guia para a missão aberta (sem mexer no workspace). */
function guiaPrepararFase(fase) {
  GUIA.fase = fase || null;
  GUIA.concluidoAvisado = false;
  const gab = guiaGabaritoDaFase(fase);
  if (!gab) { GUIA.compilado = null; GUIA.passos = []; return; }
  const perfil = PERFIS_BLOCOS[estadoBlocos.perfil];
  const def = perfil.toolboxCompleta ? perfil.toolboxCompleta() : perfil.toolbox();
  GUIA.compilado = guiaCompilar(gab, def, { categoriaDe: perfil.categoriaDe, itensCustom: perfil.itensCustom });
  GUIA.passos = GUIA.compilado.passos;
  GUIA.vars = GUIA.compilado.vars;
}

/* Variáveis do gabarito já criadas (com o nome certo) no workspace do guiado. */
function guiaCriarVariaveis(ws) {
  if (!ws || !GUIA.compilado) return;
  for (const nome of new Set(GUIA.compilado.vars.values())) {
    const mapa = ws.getVariableMap();
    if (!mapa.getVariable(nome)) mapa.createVariable(nome);
  }
}

function guiaAgendar() {
  clearTimeout(GUIA.timer);
  GUIA.timer = setTimeout(guiaAtualizar, 60);
}

function guiaAtualizar() {
  const ws = estadoBlocos.workspace;
  guiaRenderBarra();
  if (!ws || guiaModoAtivo() !== 'guiado' || !GUIA.compilado) { guiaLimparMarcas(); GUIA.ultimo = null; guiaPulsarUpload(false); return; }
  const r = guiaAvaliar(ws, GUIA.compilado);
  GUIA.ultimo = r;
  guiaRenderPasso(r);
  guiaDestacar(ws, r);
  guiaPulsarUpload(!!r.completo);
}

function guiaPulsarUpload(sim) {
  const bt = document.getElementById('bt-upload');
  if (bt && typeof estado !== 'undefined' && estado.aba === 'blocos') bt.classList.toggle('pulsa', sim && !bt.disabled);
}

function guiaRenderBarra() {
  const barra = document.getElementById('guia-barra');
  if (!barra) return;
  barra.hidden = !guiaPerfilTemMissoes();
  if (barra.hidden) return;
  const modo = guiaModoAtivo();
  barra.dataset.modo = modo;
  barra.querySelectorAll('[data-guia-modo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.guiaModo === modo)));
  const missao = document.getElementById('guia-missao');
  const fase = GUIA.fase || (typeof estado !== 'undefined' ? estado.fase : null);
  if (missao) missao.textContent = modo === 'guiado' && fase ? `${fase.missao} · ${fase.nome}` : '';
  document.getElementById('guia-recomecar').hidden = modo !== 'guiado' || !GUIA.compilado;
  if (modo === 'livre') {
    guiaEscreverPasso({ titulo: 'Modo livre', texto: 'Todos os blocos liberados: monte o seu próprio programa. Para seguir uma missão passo a passo, escolha Guiado.' });
  } else if (!GUIA.compilado) {
    guiaEscreverPasso({ titulo: 'Guiado', texto: fase ? 'Esta missão ainda não tem versão em blocos. Use o modo livre ou escolha outra missão.' : 'Abra uma missão no currículo para ser guiado passo a passo.' });
  }
}

function guiaRenderPasso(r) { guiaEscreverPasso(guiaTextoDoPasso(r)); }

function guiaEscreverPasso(t) {
  const tit = document.getElementById('guia-titulo');
  const txt = document.getElementById('guia-texto');
  const des = document.getElementById('guia-desenho');
  const caixa = document.getElementById('guia-instrucao');
  if (!tit || !txt) return;
  tit.textContent = t.titulo || '';
  txt.textContent = t.texto || '';
  if (caixa) caixa.className = 'guia-instrucao' + (t.classe ? ' ' + t.classe : '');
  if (des) {
    des.hidden = !t.desenho;
    des.innerHTML = t.desenho ? Array.from(t.desenho).map((c) => `<i class="${c === '1' ? 'on' : ''}"></i>`).join('') : '';
  }
}

/* Chamado por blocos.js quando o workspace muda (eventos já filtrados) e na interface. */
function guiaAoMudarWorkspace(ev) {
  if (guiaModoAtivo() !== 'guiado') return;
  if (ev && ev.type === Blockly.Events.BLOCK_DRAG && ev.isStart) { guiaLimparMarcas(); return; }
  guiaAgendar();
}

/* A missão pronta no guiado conta como missão feita em blocos (uma vez, sem dobrar XP). */
function blocosGuiaConcluiu() {
  return guiaModoAtivo() === 'guiado' && !!(GUIA.ultimo && GUIA.ultimo.completo) && GUIA.fase && typeof estado !== 'undefined' && estado.fase === GUIA.fase;
}

function blocosGuiaConcluirMissao() {
  const fase = GUIA.fase;
  if (!fase) return;
  if (progresso.feitas[fase.id]) {
    registrarModoConcluido(fase, 'blocos');
    log('✓ Missão “' + fase.nome + '” feita também em blocos.', 'ok');
    salvarProgresso();
  } else {
    concluirFase('blocos');
  }
}

/* O aluno trocou Livre ↔ Guiado. */
function guiaTrocarModo(modo) {
  if (!guiaPerfilTemMissoes() || (modo !== 'livre' && modo !== 'guiado')) return;
  if (GUIA.modo === modo) return;
  try { localStorage.setItem(guiaChaveModo(), modo); } catch (e) { /* sem storage */ }
  blocosSalvarRascunho();
  GUIA.modo = modo;
  blocosReconfigurarPorModo();
}

function guiaRecomecar() {
  const ws = estadoBlocos.workspace;
  if (!ws || guiaModoAtivo() !== 'guiado') return;
  if (ws.getTopBlocks(false).length && !confirm('Recomeçar a missão em blocos? Os blocos da tela serão apagados.')) return;
  estadoBlocos.carregando = true;
  try { ws.clear(); guiaCriarVariaveis(ws); } finally { estadoBlocos.carregando = false; }
  blocosAtualizarCodigo();
  blocosSalvarRascunho();
  guiaAtualizar();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-guia-modo]').forEach((b) => b.addEventListener('click', () => guiaTrocarModo(b.dataset.guiaModo)));
  const rec = document.getElementById('guia-recomecar');
  if (rec) rec.addEventListener('click', guiaRecomecar);
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { guiaCompilar, guiaAvaliar, guiaFiltrarToolbox, guiaTextoDoPasso, guiaRotuloBloco, guiaItensDaToolbox };
}
