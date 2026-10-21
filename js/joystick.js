/* ============================================================
 * joystick.js — aba "🎮 Joystick" da MIDE EDU (Arduino Uno)
 * ------------------------------------------------------------
 * O aluno monta um controle de jogo: adiciona sensores (botão,
 * ultrassônico, potenciômetro, LED), liga cada um a uma tecla do
 * PC e a IDE gera o Joystick.ino (gravado pelo Upload da barra),
 * o gamepad.py e o "Iniciar joystick.bat".
 *
 * Tela enxuta: uma barra (adicionar sensor · estado · Testar ·
 * Código · Pacote) e os cartões dos sensores. O código fica num
 * diálogo; o teste ao vivo acende a própria tecla no cartão.
 * O gerador fica em joystick_gen.js (sem DOM, testável).
 * ============================================================ */
'use strict';

const JOY = {
  chave: 'mide_joystick_v1',
  config: null,
  gerado: null,
  visao: 'ino',            // 'ino' | 'py' | 'bat' (diálogo do código)
  ativas: new Set(),       // números das ações ligadas agora (teste ao vivo)
  conectado: false,
  alvoTecla: null,         // {uid, campo, faixa}
};

const ICONES_JOY = {
  botao: 'assets/icone_modulo_botao.png',
  ultra: 'assets/icone_modulo_us.png',
  pot: 'assets/icone_modulo_pot.png',
  led: 'assets/icone_modulo_led.png',
};
const LIGACAO_JOY = {
  botao: 'Ligação: uma perna do botão no pino, a outra no GND.',
  ultra: 'Ligação: VCC no 5V, GND no GND, TRIG e ECHO nos pinos escolhidos.',
  pot: 'Ligação: pernas das pontas no 5V e no GND, a do meio no pino analógico.',
  led: 'Ligação: pino → resistor de 220 Ω → perna longa do LED; perna curta no GND.',
};

const escJ = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const novoUid = () => 's' + Math.random().toString(36).slice(2, 9);

/* ------------------------------------------------------------
 * Guardar / carregar
 * ---------------------------------------------------------- */
function joyCarregar() {
  try {
    const c = JSON.parse(localStorage.getItem(JOY.chave) || 'null');
    if (c && Array.isArray(c.sensores)) JOY.config = c;
  } catch (e) { /* storage indisponível */ }
  if (!JOY.config) JOY.config = JoystickGen.configPadrao();
  JOY.config.sensores.forEach((s) => { if (!s.uid) s.uid = novoUid(); });
}
function joySalvar() {
  try { localStorage.setItem(JOY.chave, JSON.stringify(JOY.config)); } catch (e) { /* ignora */ }
}

/* ------------------------------------------------------------
 * Pinos livres
 * ---------------------------------------------------------- */
function joyPinosUsados(excetoUid) {
  const usados = new Set();
  for (const s of JOY.config.sensores) {
    if (s.uid === excetoUid) continue;
    if (s.tipo === 'ultra') { usados.add(String(s.trig)); usados.add(String(s.echo)); }
    else usados.add(String(s.pino));
  }
  return usados;
}
function joyPinoLivre(analogico, extra) {
  const usados = joyPinosUsados();
  (extra || []).forEach((p) => usados.add(String(p)));
  const lista = analogico ? JoystickGen.PINOS_ANALOGICOS : JoystickGen.PINOS_DIGITAIS;
  return lista.find((p) => !usados.has(String(p)));
}

function joyAdicionar(tipo) {
  let s;
  if (tipo === 'botao') {
    const pino = joyPinoLivre(false);
    if (pino === undefined) return joyAviso('Não sobrou pino digital livre (2 a 13).');
    s = { tipo, pino, curto: true, longo: false, teclaCurto: '', teclaLongo: '', msLongo: 500 };
  } else if (tipo === 'led') {
    const pino = joyPinoLivre(false);
    if (pino === undefined) return joyAviso('Não sobrou pino digital livre (2 a 13).');
    const usada = JoystickGen.listarAcoes(JOY.config.sensores).acoes[0];
    s = { tipo, pino, tecla: usada ? usada.tecla : '' };
  } else if (tipo === 'ultra') {
    const trig = joyPinoLivre(false);
    const echo = trig === undefined ? undefined : joyPinoLivre(false, [trig]);
    if (echo === undefined) return joyAviso('O ultrassônico precisa de 2 pinos digitais livres.');
    s = { tipo, trig, echo, faixas: [{ min: 0, max: 15, tecla: '', modo: 'segurar' }, { min: 16, max: 40, tecla: '', modo: 'segurar' }] };
  } else if (tipo === 'pot') {
    const pino = joyPinoLivre(true);
    if (pino === undefined) return joyAviso('Todos os pinos analógicos (A0 a A5) já estão em uso.');
    s = { tipo, pino, faixas: [{ min: 0, max: 340, tecla: '', modo: 'segurar' }, { min: 683, max: 1023, tecla: '', modo: 'segurar' }] };
  }
  s.uid = novoUid();
  JOY.config.sensores.push(s);
  joyMudou();
  requestAnimationFrame(() => {
    const el = document.querySelector(`#joy-lista [data-uid="${s.uid}"]`);
    if (!el) return;
    // rola só a lista (scrollIntoView rolaria também a página, que tem overflow escondido)
    const lista = $('#joy-lista');
    lista.scrollTo({ top: el.offsetTop - lista.offsetTop - 8, behavior: 'smooth' });
    el.classList.add('novo');
  });
}

function joyAviso(msg) {
  const el = $('#joy-toast');
  el.textContent = msg;
  el.classList.add('mostra');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('mostra'), 3200);
}

/* ------------------------------------------------------------
 * Render
 * ---------------------------------------------------------- */
function joyMudou(semRelista) {
  joySalvar();
  JOY.gerado = JoystickGen.gerar(JOY.config);
  if (!semRelista) joyRenderLista();
  else joyRenderAvisosDosCartoes();
  joyRenderBarra();
  if (!$('#joy-dialogo-codigo').open) { /* nada */ } else joyRenderCodigo();
  if (typeof atualizarBotoes === 'function') atualizarBotoes();
}

/* Botão de tecla. data-num liga a tecla ao teste ao vivo (acende quando a ação começa). */
function joyPill(tecla, attrs, num) {
  const vazio = !tecla;
  const ligada = num && JOY.ativas.has(num) ? ' ligada' : '';
  return `<button type="button" class="joy-tecla${vazio ? ' vazia' : ''}${ligada}" ${attrs}${num ? ` data-num="${num}"` : ''} title="Clique e aperte a tecla do PC">${vazio ? 'tecla?' : escJ(JoystickGen.rotuloTecla(tecla))}</button>`;
}

function joySelectPino(valor, uid, campo, analogico, extraUsados, rotulo) {
  const usados = joyPinosUsados(uid);
  (extraUsados || []).forEach((p) => usados.add(String(p)));
  const lista = analogico ? JoystickGen.PINOS_ANALOGICOS : JoystickGen.PINOS_DIGITAIS;
  const ops = lista.map((p) => {
    const ocupado = usados.has(String(p)) && String(p) !== String(valor);
    return `<option value="${p}"${String(p) === String(valor) ? ' selected' : ''}${ocupado ? ' disabled' : ''}>${analogico ? p : 'D' + p}</option>`;
  }).join('');
  const sel = `<select class="joy-sel joy-pino" data-campo="${campo}" aria-label="${rotulo || 'Pino'}" title="Pino do Arduino (os apagados já estão em uso)">${ops}</select>`;
  return rotulo ? `<label class="joy-pin-rot">${rotulo}${sel}</label>` : sel;
}

/* Mensagens do gerador que são deste sensor ("Botão 1: …", "Botão 1, faixa 2: …"). */
function joyMsgsDoSensor(nome) {
  const g = JOY.gerado;
  const deste = (m) => m.startsWith(nome + ':') || m.startsWith(nome + ',');
  const limpa = (m) => m.slice(nome.length).replace(/^[:,]\s*/, '');
  return [
    ...g.erros.filter(deste).map((m) => ({ tipo: 'erro', texto: limpa(m) })),
    ...g.avisos.filter(deste).map((m) => ({ tipo: 'aviso', texto: limpa(m) })),
  ];
}
function joyHtmlMsgs(nome) {
  const ms = joyMsgsDoSensor(nome);
  if (!ms.length) return '';
  return ms.map((m) => `<p class="joy-msg ${m.tipo}">${m.tipo === 'erro' ? '✗' : '!'} ${escJ(m.texto)}</p>`).join('');
}

function joyRenderFaixas(s, it) {
  const lim = s.tipo === 'ultra' ? 400 : 1023;
  const nums = it.acoes.faixas || [];
  const linhas = (s.faixas || []).map((f, i) => `
    <div class="joy-faixa" data-faixa="${i}">
      <input type="number" class="joy-num-in" data-campo="min" min="0" max="${lim}" value="${f.min}" aria-label="de">
      <span class="joy-ate">a</span>
      <input type="number" class="joy-num-in" data-campo="max" min="0" max="${lim}" value="${f.max}" aria-label="até">
      ${joyPill(f.tecla, `data-tecla="faixa" data-faixa="${i}"`, nums[i])}
      <select class="joy-sel joy-modo" data-campo="modo" aria-label="Como apertar" title="segurar: fica apertada enquanto estiver na faixa · toque: aperta uma vez ao entrar">
        <option value="segurar"${f.modo !== 'toque' ? ' selected' : ''}>segurar</option>
        <option value="toque"${f.modo === 'toque' ? ' selected' : ''}>toque</option>
      </select>
      <button type="button" class="joy-x" data-acao="tirar-faixa" title="Tirar esta faixa" aria-label="Tirar esta faixa">✕</button>
    </div>`).join('');
  return `
    <div class="joy-faixas-cab">${s.tipo === 'ultra' ? 'Distância em cm' : 'Valor lido (0 a 1023)'} → tecla</div>
    ${linhas || '<p class="joy-vazio">Nenhuma faixa.</p>'}
    <div class="joy-faixas-pe">
      <button type="button" class="joy-mais" data-acao="mais-faixa">＋ faixa</button>
      ${s.tipo === 'pot' ? '<button type="button" class="joy-mais" data-acao="dividir">dividir em 3</button>' : ''}
    </div>`;
}

function joyModoBotao(s) {
  const c = s.curto !== false, l = !!s.longo;
  return c && l ? 'ambos' : (l ? 'longo' : 'curto');
}

function joyRenderCartao(it, usadas) {
  const s = it.s;
  let pinos = '', corpo = '';
  if (s.tipo === 'botao') {
    pinos = joySelectPino(s.pino, s.uid, 'pino', false);
    const modo = joyModoBotao(s);
    const seg = [['curto', 'Normal', 'A tecla fica apertada enquanto o botão estiver apertado'],
                 ['longo', 'Segurar', 'Só conta se segurar o botão'],
                 ['ambos', 'Curto + longo', 'Toque rápido = uma tecla; segurar = outra']]
      .map(([v, r, t]) => `<button type="button" data-acao="modo-botao" data-modo="${v}" aria-pressed="${modo === v}" title="${t}">${r}</button>`).join('');
    const ms = `<label class="joy-ms" title="Quanto tempo segurando para virar toque longo">após <input type="number" class="joy-num-in" data-campo="msLongo" min="100" max="5000" step="50" value="${s.msLongo}"> ms</label>`;
    corpo = `
      <div class="joy-seg" role="group" aria-label="Como o botão funciona">${seg}</div>
      ${modo === 'curto' ? `<div class="joy-linha"><span class="joy-rot">Tecla</span>${joyPill(s.teclaCurto, 'data-tecla="teclaCurto"', it.acoes.curto)}</div>` : ''}
      ${modo === 'ambos' ? `<div class="joy-linha"><span class="joy-rot">Toque rápido</span>${joyPill(s.teclaCurto, 'data-tecla="teclaCurto"', it.acoes.curto)}</div>` : ''}
      ${modo !== 'curto' ? `<div class="joy-linha"><span class="joy-rot">Segurando</span>${joyPill(s.teclaLongo, 'data-tecla="teclaLongo"', it.acoes.longo)}${ms}</div>` : ''}`;
  } else if (s.tipo === 'ultra') {
    corpo = `<div class="joy-linha"><span class="joy-rot">Pinos</span>${joySelectPino(s.trig, s.uid, 'trig', false, [s.echo], 'TRIG')}${joySelectPino(s.echo, s.uid, 'echo', false, [s.trig], 'ECHO')}</div>` +
      joyRenderFaixas(s, it);
  } else if (s.tipo === 'pot') {
    pinos = joySelectPino(s.pino, s.uid, 'pino', true);
    corpo = joyRenderFaixas(s, it);
  } else if (s.tipo === 'led') {
    pinos = joySelectPino(s.pino, s.uid, 'pino', false);
    const opcoes = ['', ...usadas];
    if (s.tecla && !opcoes.includes(s.tecla)) opcoes.push(s.tecla);
    corpo = `
      <div class="joy-linha"><span class="joy-rot">Acende com</span>
        <select class="joy-sel" data-campo="tecla" aria-label="Tecla que acende o LED">
          ${opcoes.map((t) => `<option value="${escJ(t)}"${t === (s.tecla || '') ? ' selected' : ''}>${t ? escJ(JoystickGen.rotuloTecla(t)) : '— escolha —'}</option>`).join('')}
        </select>
      </div>`;
  }
  return `
    <article class="joy-card tipo-${s.tipo}" data-uid="${s.uid}" data-nome="${escJ(it.nome)}">
      <header>
        <img src="${ICONES_JOY[s.tipo]}" alt="" title="${escJ(LIGACAO_JOY[s.tipo])}">
        <b title="${escJ(LIGACAO_JOY[s.tipo])}">${escJ(it.nome)}</b>
        <span class="joy-pinos">${pinos}</span>
        <button type="button" class="joy-x" data-acao="tirar" title="Tirar ${escJ(it.nome)}" aria-label="Tirar ${escJ(it.nome)}">✕</button>
      </header>
      <div class="joy-card-corpo">${corpo}</div>
      <div class="joy-card-msgs">${joyHtmlMsgs(it.nome)}</div>
    </article>`;
}

function joyRenderLista() {
  const lista = $('#joy-lista');
  const { itens, acoes } = JoystickGen.listarAcoes(JOY.config.sensores);
  if (!itens.length) {
    lista.innerHTML = `<div class="joy-inicio"><img src="assets/icone_modulo_botao.png" alt=""><h3>Monte o seu controle</h3><p>Use os botões <b>＋</b> lá em cima. Cada sensor vira uma tecla do computador.</p></div>`;
    return;
  }
  const usadas = [...new Set(acoes.map((a) => a.tecla))];
  lista.innerHTML = itens.map((it) => joyRenderCartao(it, usadas)).join('');
}

function joyRenderAvisosDosCartoes() {
  document.querySelectorAll('#joy-lista .joy-card').forEach((card) => {
    const caixa = card.querySelector('.joy-card-msgs');
    if (caixa) caixa.innerHTML = joyHtmlMsgs(card.dataset.nome);
  });
}

/* Estado na barra: erro / aviso / pronto / conectado; mensagens gerais embaixo. */
function joyRenderBarra() {
  const g = JOY.gerado;
  const nomes = JoystickGen.listarAcoes(JOY.config.sensores).itens.map((it) => it.nome);
  const doCartao = (m) => nomes.some((n) => m.startsWith(n + ':') || m.startsWith(n + ','));
  const gerais = [...g.erros.filter((m) => !doCartao(m)).map((m) => ['erro', m]),
                  ...g.avisos.filter((m) => !doCartao(m)).map((m) => ['aviso', m])];
  const av = $('#joy-avisos');
  av.innerHTML = gerais.map(([t, m]) => `<p class="joy-msg ${t}">${t === 'erro' ? '✗' : '!'} ${escJ(m)}</p>`).join('');
  av.hidden = !gerais.length;

  const el = $('#joy-status');
  let txt, cls;
  if (g.erros.length) { txt = g.erros.length === 1 ? '1 erro para corrigir' : `${g.erros.length} erros para corrigir`; cls = 'erro'; }
  else if (JOY.conectado) { txt = 'Conectado — aperte os sensores'; cls = 'ligado'; }
  else if (MON.aberto) { txt = 'Esperando o joystick…'; cls = ''; }
  else if (g.avisos.length) { txt = g.avisos.length === 1 ? '1 aviso' : `${g.avisos.length} avisos`; cls = 'aviso'; }
  else { txt = 'Pronto para o Upload'; cls = 'ok'; }
  el.textContent = txt;
  el.className = 'joy-estado ' + cls;
  $('#bt-joy-monitor').classList.toggle('ligado', MON.aberto);
  $('#bt-joy-monitor').lastChild.textContent = MON.aberto ? ' Testando' : ' Testar';
}

function joyRenderCodigo() {
  const g = JOY.gerado;
  const texto = g[JOY.visao];
  const pre = $('#joy-codigo');
  if (JOY.visao === 'ino') pre.innerHTML = realcar(texto);
  else if (JOY.visao === 'py') pre.innerHTML = typeof realcarPython === 'function' ? realcarPython(texto) : escJ(texto);
  else pre.textContent = texto;
  document.querySelectorAll('#joy-visoes button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.visao === JOY.visao)));
}

/* ------------------------------------------------------------
 * Eventos da lista (delegação)
 * ---------------------------------------------------------- */
function joySensorDoEvento(ev) {
  const card = ev.target.closest('.joy-card');
  if (!card) return null;
  return JOY.config.sensores.find((s) => s.uid === card.dataset.uid) || null;
}

function joyAoClicar(ev) {
  const s = joySensorDoEvento(ev);
  if (!s) return;
  const bt = ev.target.closest('button');
  if (!bt) return;
  if (bt.dataset.tecla) {
    JOY.alvoTecla = { uid: s.uid, campo: bt.dataset.tecla, faixa: bt.dataset.faixa != null ? +bt.dataset.faixa : null };
    joyAbrirDialogoTecla();
    return;
  }
  const faixaEl = bt.closest('.joy-faixa');
  switch (bt.dataset.acao) {
    case 'tirar':
      JOY.config.sensores = JOY.config.sensores.filter((x) => x !== s);
      break;
    case 'modo-botao':
      s.curto = bt.dataset.modo !== 'longo';
      s.longo = bt.dataset.modo !== 'curto';
      break;
    case 'tirar-faixa':
      s.faixas.splice(+faixaEl.dataset.faixa, 1);
      break;
    case 'mais-faixa': {
      const lim = s.tipo === 'ultra' ? 400 : 1023;
      const ult = s.faixas[s.faixas.length - 1];
      const min = ult ? Math.min(lim, ult.max + 1) : 0;
      s.faixas.push({ min, max: Math.min(lim, min + (s.tipo === 'ultra' ? 20 : 200)), tecla: '', modo: 'segurar' });
      break;
    }
    case 'dividir': {
      const velhas = s.faixas;
      s.faixas = [[0, 340], [341, 681], [682, 1023]].map(([min, max], i) => ({ min, max, tecla: velhas[i]?.tecla || '', modo: velhas[i]?.modo || 'segurar' }));
      break;
    }
    default: return;
  }
  joyMudou();
}

function joyAoMudar(ev) {
  const s = joySensorDoEvento(ev);
  if (!s) return;
  const el = ev.target;
  const campo = el.dataset.campo;
  if (!campo) return;
  const faixaEl = el.closest('.joy-faixa');
  const alvo = faixaEl ? s.faixas[+faixaEl.dataset.faixa] : s;
  let v = el.value;
  if (['min', 'max', 'msLongo'].includes(campo)) {
    v = parseInt(v, 10);
    if (!Number.isFinite(v)) v = 0;
  } else if (['pino', 'trig', 'echo'].includes(campo) && /^\d+$/.test(v)) {
    v = +v;
  }
  alvo[campo] = v;
  // números: não redesenha a lista (perderia o foco do campo), só os avisos
  joyMudou(el.type === 'number');
}

/* ------------------------------------------------------------
 * Escolher a tecla
 * ---------------------------------------------------------- */
function joyAbrirDialogoTecla() {
  $('#joy-tecla-mostra').innerHTML = '<span class="ph">aperte uma tecla…</span>';
  $('#joy-dialogo-tecla').showModal();
}

function joyDefinirTecla(tecla) {
  const a = JOY.alvoTecla;
  const s = a && JOY.config.sensores.find((x) => x.uid === a.uid);
  if (s) {
    if (a.campo === 'faixa') s.faixas[a.faixa].tecla = tecla;
    else s[a.campo] = tecla;
    // um LED sem tecla passa a seguir a primeira tecla escolhida
    JOY.config.sensores.forEach((x) => { if (x.tipo === 'led' && !x.tecla && tecla) x.tecla = tecla; });
  }
  JOY.alvoTecla = null;
  $('#joy-dialogo-tecla').close();
  joyMudou();
}

function joyTeclaNoDialogo(ev) {
  const d = $('#joy-dialogo-tecla');
  if (['Shift', 'Control', 'Alt'].includes(ev.key)) {
    // modificadores sozinhos também valem, mas esperam soltar para não pegar atalhos
    ev.preventDefault();
    if (!ev.repeat) {
      d.dataset.mod = JoystickGen.teclaDoEvento(ev);
      $('#joy-tecla-mostra').textContent = JoystickGen.rotuloTecla(d.dataset.mod);
    }
    return;
  }
  delete d.dataset.mod;
  const t = JoystickGen.teclaDoEvento(ev);
  ev.preventDefault();
  ev.stopPropagation();
  if (!t) { $('#joy-tecla-mostra').innerHTML = '<span class="ph">essa tecla não dá — escolha outra</span>'; return; }
  $('#joy-tecla-mostra').textContent = JoystickGen.rotuloTecla(t);
  setTimeout(() => joyDefinirTecla(t), 180);
}

/* ------------------------------------------------------------
 * Teste ao vivo: escuta as linhas do Monitor Serial
 * ---------------------------------------------------------- */
function joyLinhaSerial(linha) {
  const l = String(linha || '').trim();
  if (l === 'JOYSTICK PRONTO') {
    JOY.conectado = true;
    JOY.ativas.clear();
    document.querySelectorAll('#joy-lista .joy-tecla.ligada').forEach((e) => e.classList.remove('ligada'));
    joyRenderBarra();
    return;
  }
  const m = /^A(\d+)_(DOWN|UP)$/.exec(l);
  if (!m) return;
  const n = +m[1];
  const els = document.querySelectorAll(`#joy-lista .joy-tecla[data-num="${n}"]`);
  if (m[2] === 'DOWN') {
    JOY.ativas.add(n);
    els.forEach((e) => { e.classList.add('ligada'); e.classList.remove('pisca'); void e.offsetWidth; e.classList.add('pisca'); });
  } else {
    JOY.ativas.delete(n);
    els.forEach((e) => e.classList.remove('ligada'));
  }
  if (!JOY.conectado) { JOY.conectado = true; joyRenderBarra(); }
}

/* ------------------------------------------------------------
 * Integração com a IDE (chamado por ide.js)
 * ---------------------------------------------------------- */
function joystickCodigoAtual() { return JOY.gerado ? JOY.gerado.ino : ''; }
function joystickPodeGravar() { return !!JOY.gerado && !JOY.gerado.erros.length; }

function joystickAoAbrir() {
  if (!JOY.gerado) JOY.gerado = JoystickGen.gerar(JOY.config);
  joyRenderLista();
  joyRenderBarra();
  // a aba usa a largura toda: some o currículo e o painel de baixo recolhe
  // (o "Testar" abre o Monitor de novo)
  document.body.classList.add('joy-ativo');
  if (!MON.aberto) {
    $('#console-wrap').classList.add('recolhido');
    $('#bt-recolher').textContent = '▴';
  }
  JOY.rotuloAntes = $('#rotulo-sketch').textContent;
  $('#rotulo-sketch').textContent = 'Joystick.ino';
}
function joystickAoSair() {
  document.body.classList.remove('joy-ativo');
  if (JOY.rotuloAntes) $('#rotulo-sketch').textContent = JOY.rotuloAntes;
  JOY.rotuloAntes = null;
}

function joyBaixarPacote() {
  const g = JOY.gerado;
  if (g.erros.length) { joyAviso('Corrija os erros em vermelho antes de baixar.'); return; }
  const z = JoystickGen.zip([
    { nome: 'Joystick/gamepad.py', texto: g.py },
    { nome: 'Joystick/Iniciar joystick.bat', texto: g.bat },
    { nome: 'Joystick/Joystick/Joystick.ino', texto: g.ino },
    { nome: 'Joystick/LEIA-ME.txt', texto: g.leiame },
  ]);
  baixarArquivo('Joystick.zip', z, 'application/zip');
  log('Joystick.zip baixado: descompacte e dê dois cliques em "Iniciar joystick.bat" (feche o Monitor Serial antes).', 'ok');
}

function joyIniciar() {
  if (!document.getElementById('area-joystick') || typeof JoystickGen === 'undefined') return;
  joyCarregar();

  $('#joy-paleta').innerHTML = Object.keys(ICONES_JOY).map((t) => `
    <button type="button" class="joy-add" data-tipo="${t}" title="Adicionar ${JoystickGen.TIPOS[t].nome.toLowerCase()}">
      <img src="${ICONES_JOY[t]}" alt=""><span>${JoystickGen.TIPOS[t].nome}</span><b aria-hidden="true">＋</b>
    </button>`).join('');
  $('#joy-paleta').addEventListener('click', (ev) => {
    const b = ev.target.closest('.joy-add');
    if (b) joyAdicionar(b.dataset.tipo);
  });

  const lista = $('#joy-lista');
  lista.addEventListener('click', joyAoClicar);
  lista.addEventListener('change', joyAoMudar);

  // barra
  $('#bt-joy-monitor').addEventListener('click', () => {
    if (MON.aberto) { mostrarPainelInf('monitor'); return; }
    mostrarPainelInf('monitor');
    $('#mon-baud').value = '9600';
    ligarMonitor();
  });
  $('#bt-joy-codigo').addEventListener('click', () => { joyRenderCodigo(); $('#joy-dialogo-codigo').showModal(); });
  $('#bt-joy-zip').addEventListener('click', joyBaixarPacote);
  $('#bt-joy-padrao').addEventListener('click', () => {
    if (!confirm('Voltar para o joystick de 4 botões (setas)? A montagem atual será apagada.')) return;
    JOY.config = JoystickGen.configPadrao();
    JOY.config.sensores.forEach((s) => { s.uid = novoUid(); });
    joyMudou();
  });

  // diálogo do código
  const dc = $('#joy-dialogo-codigo');
  $('#joy-visoes').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-visao]');
    if (!b) return;
    JOY.visao = b.dataset.visao;
    joyRenderCodigo();
  });
  $('#bt-joy-copiar').addEventListener('click', () => {
    const texto = JOY.gerado[JOY.visao];
    (navigator.clipboard ? navigator.clipboard.writeText(texto) : Promise.reject())
      .then(() => joyAviso('Código copiado.'), () => joyAviso('Não deu para copiar — selecione o texto e use Ctrl+C.'));
  });
  $('#bt-joy-editor').addEventListener('click', () => {
    dc.close();
    $('#editor-livre').value = JOY.gerado.ino;
    trocarAba('livre');
    log('O código do joystick foi para o Editor C++. Lá você pode mudar o que quiser.', 'info');
  });
  $('#bt-joy-codigo-fechar').addEventListener('click', () => dc.close());
  dc.addEventListener('click', (ev) => { if (ev.target === dc) dc.close(); });   // clique fora fecha

  // diálogo da tecla
  const d = $('#joy-dialogo-tecla');
  d.addEventListener('keydown', joyTeclaNoDialogo, true);
  d.addEventListener('keyup', (ev) => {
    if (d.dataset.mod && JoystickGen.teclaDoEvento(ev) === d.dataset.mod) {
      const t = d.dataset.mod; delete d.dataset.mod; joyDefinirTecla(t);
    }
  });
  d.addEventListener('cancel', (ev) => ev.preventDefault());   // Esc é uma tecla válida
  d.addEventListener('close', () => { delete d.dataset.mod; });
  d.querySelectorAll('[data-tecla-rapida]').forEach((b) => b.addEventListener('click', () => joyDefinirTecla(b.dataset.teclaRapida)));
  $('#bt-joy-tecla-cancelar').addEventListener('click', () => { JOY.alvoTecla = null; d.close(); });

  // teste ao vivo: toda linha do Monitor Serial passa pelo traçador
  if (typeof alimentarTracador === 'function') {
    const original = alimentarTracador;
    window.alimentarTracador = function (linha) { joyLinhaSerial(linha); return original.apply(this, arguments); };
  }
  // o Monitor abre/fecha fora daqui: mantém o estado da barra em dia
  let monAntes = null;
  setInterval(() => {
    if ($('#area-joystick').hidden || MON.aberto === monAntes) return;
    monAntes = MON.aberto;
    if (!MON.aberto) { JOY.conectado = false; JOY.ativas.clear(); }
    joyRenderBarra();
  }, 700);

  JOY.gerado = JoystickGen.gerar(JOY.config);
}

document.addEventListener('DOMContentLoaded', joyIniciar);
