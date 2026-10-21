/* ============================================================
 * joystick.js — aba "🎮 Joystick" da MIDE EDU (Arduino Uno)
 * ------------------------------------------------------------
 * O aluno monta um controle de jogo: adiciona sensores (botão,
 * ultrassônico, potenciômetro, LED), liga cada um a uma tecla do
 * PC e a IDE gera o Joystick.ino (gravado pelo Upload da barra),
 * o gamepad.py e o "Iniciar joystick.bat".
 *
 * O teste ao vivo lê as mensagens do Monitor Serial (A1_DOWN…) e
 * acende as teclas na tela — dá para conferir tudo antes de abrir
 * o jogo. O gerador fica em joystick_gen.js (sem DOM, testável).
 * ============================================================ */
'use strict';

const JOY = {
  chave: 'mide_joystick_v1',
  config: null,
  gerado: null,
  visao: 'ino',            // 'ino' | 'py' | 'bat'
  ativas: new Set(),       // números das ações ligadas agora (teste ao vivo)
  conectado: false,
  alvoTecla: null,         // {uid, campo, faixa}
  timerRender: null,
};

const ICONES_JOY = {
  botao: 'assets/icone_modulo_botao.png',
  ultra: 'assets/icone_modulo_us.png',
  pot: 'assets/icone_modulo_pot.png',
  led: 'assets/icone_modulo_led.png',
};
const DESC_JOY = {
  botao: 'Toque curto, longo ou os dois',
  ultra: 'Faixas de distância (cm)',
  pot: 'Faixas de giro (0 a 1023)',
  led: 'Acende junto com uma tecla',
};
const LIGACAO_JOY = {
  botao: 'Uma perna do botão no pino, a outra no GND (o pull-up interno já está ligado).',
  ultra: 'VCC no 5V, GND no GND, TRIG e ECHO nos pinos escolhidos.',
  pot: 'Pernas das pontas no 5V e no GND, a perna do meio no pino analógico.',
  led: 'Pino → resistor de 220 Ω → perna longa do LED; perna curta no GND.',
};

const escJ = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const novoUid = () => 's' + Math.random().toString(36).slice(2, 9);

/* ------------------------------------------------------------
 * Guardar / carregar
 * ---------------------------------------------------------- */
function joyCarregar() {
  try {
    const c = JSON.parse(localStorage.getItem(JOY.chave) || 'null');
    if (c && Array.isArray(c.sensores)) { JOY.config = c; }
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
    if (el) {
      // rola só a lista (scrollIntoView rolaria também a página, que tem overflow escondido)
      const lista = $('#joy-lista');
      lista.scrollTo({ top: el.offsetTop - lista.offsetTop - 8, behavior: 'smooth' });
      el.classList.add('novo');
    }
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
  joyRenderLado();
  if (typeof atualizarBotoes === 'function') atualizarBotoes();
}

function joyPill(tecla, attrs) {
  const vazio = !tecla;
  return `<button type="button" class="joy-tecla${vazio ? ' vazia' : ''}" ${attrs} title="Clique e aperte a tecla do PC">${vazio ? '+ tecla' : escJ(JoystickGen.rotuloTecla(tecla))}</button>`;
}

function joySelectPino(valor, uid, campo, analogico, extraUsados) {
  const usados = joyPinosUsados(uid);
  (extraUsados || []).forEach((p) => usados.add(String(p)));
  const lista = analogico ? JoystickGen.PINOS_ANALOGICOS : JoystickGen.PINOS_DIGITAIS;
  const ops = lista.map((p) => {
    const ocupado = usados.has(String(p)) && String(p) !== String(valor);
    return `<option value="${p}"${String(p) === String(valor) ? ' selected' : ''}${ocupado ? ' disabled' : ''}>${analogico ? p : 'D' + p}${ocupado ? ' (em uso)' : ''}</option>`;
  }).join('');
  return `<select class="joy-sel" data-campo="${campo}" aria-label="Pino">${ops}</select>`;
}

function joyFrase(s) {
  const r = JoystickGen.rotuloTecla;
  if (s.tipo === 'botao') {
    const c = s.curto !== false, l = !!s.longo;
    if (c && !l) return s.teclaCurto ? `Enquanto o botão estiver apertado, a tecla <b>${escJ(r(s.teclaCurto))}</b> fica apertada — igual ao teclado.` : 'Escolha a tecla.';
    if (!c && l) return `Segurou ${s.msLongo} ms ou mais: <b>${escJ(r(s.teclaLongo))}</b> fica apertada até soltar. Toque rápido não faz nada.`;
    if (c && l) return `Toque rápido (menos de ${s.msLongo} ms): <b>${escJ(r(s.teclaCurto))}</b> uma vez. Segurou: <b>${escJ(r(s.teclaLongo))}</b> fica apertada até soltar.`;
    return 'Ligue "curto", "longo" ou os dois.';
  }
  return '';
}

function joyRenderFaixas(s) {
  const lim = s.tipo === 'ultra' ? 400 : 1023, un = s.tipo === 'ultra' ? 'cm' : '';
  const acoes = JoystickGen.listarAcoes(JOY.config.sensores).itens.find((it) => it.s === s)?.acoes.faixas || [];
  const linhas = (s.faixas || []).map((f, i) => `
    <div class="joy-faixa" data-faixa="${i}">
      ${acoes[i] ? `<span class="joy-num" data-num="${acoes[i]}">A${acoes[i]}</span>` : '<span class="joy-num vazio">—</span>'}
      <label>de <input type="number" class="joy-num-in" data-campo="min" min="0" max="${lim}" value="${f.min}"></label>
      <label>até <input type="number" class="joy-num-in" data-campo="max" min="0" max="${lim}" value="${f.max}"> ${un}</label>
      <span class="joy-seta">→</span>
      ${joyPill(f.tecla, `data-tecla="faixa" data-faixa="${i}"`)}
      <select class="joy-sel" data-campo="modo" aria-label="Como apertar">
        <option value="segurar"${f.modo !== 'toque' ? ' selected' : ''}>segurar</option>
        <option value="toque"${f.modo === 'toque' ? ' selected' : ''}>toque</option>
      </select>
      <button type="button" class="joy-x" data-acao="tirar-faixa" title="Tirar esta faixa" aria-label="Tirar esta faixa">✕</button>
    </div>`).join('');
  return `
    <div class="joy-faixas">
      <div class="joy-faixas-cab">${s.tipo === 'ultra' ? 'Distância (0 a 400 cm)' : 'Valor lido (0 a 1023)'} → tecla</div>
      ${linhas || '<div class="joy-vazio">Nenhuma faixa ainda.</div>'}
      <div class="joy-faixas-pe">
        <button type="button" class="joy-mais" data-acao="mais-faixa">＋ Faixa</button>
        ${s.tipo === 'pot' ? '<button type="button" class="joy-mais" data-acao="dividir">Dividir em 3 iguais</button>' : ''}
      </div>
    </div>`;
}

function joyRenderLista() {
  const lista = $('#joy-lista');
  const { itens } = JoystickGen.listarAcoes(JOY.config.sensores);
  if (!itens.length) {
    lista.innerHTML = `<div class="joy-inicio"><img src="assets/icone_modulo_botao.png" alt=""><h3>Monte o seu controle</h3><p>Escolha um sensor à esquerda. Cada sensor pode virar uma tecla do computador.</p></div>`;
    return;
  }
  const usadas = [...new Set(JoystickGen.listarAcoes(JOY.config.sensores).acoes.map((a) => a.tecla))];
  lista.innerHTML = itens.map((it) => {
    const s = it.s;
    let corpo = '';
    if (s.tipo === 'botao') {
      const c = s.curto !== false, l = !!s.longo;
      corpo = `
        <div class="joy-linha"><span class="joy-rot">Pino</span>${joySelectPino(s.pino, s.uid, 'pino', false)}</div>
        <div class="joy-linha"><span class="joy-rot">Toque</span>
          <span class="joy-alterna" role="group" aria-label="Tipo de toque">
            <button type="button" data-acao="curto" aria-pressed="${c}">⚡ Curto</button>
            <button type="button" data-acao="longo" aria-pressed="${l}">⏳ Longo</button>
          </span>
          ${l ? `<label class="joy-ms">depois de <input type="number" class="joy-num-in" data-campo="msLongo" min="100" max="5000" step="50" value="${s.msLongo}"> ms</label>` : ''}
        </div>
        ${c ? `<div class="joy-linha"><span class="joy-rot">Curto</span>${it.acoes.curto ? `<span class="joy-num" data-num="${it.acoes.curto}">A${it.acoes.curto}</span>` : ''}${joyPill(s.teclaCurto, 'data-tecla="teclaCurto"')}</div>` : ''}
        ${l ? `<div class="joy-linha"><span class="joy-rot">Longo</span>${it.acoes.longo ? `<span class="joy-num" data-num="${it.acoes.longo}">A${it.acoes.longo}</span>` : ''}${joyPill(s.teclaLongo, 'data-tecla="teclaLongo"')}</div>` : ''}
        <p class="joy-frase">${joyFrase(s)}</p>`;
    } else if (s.tipo === 'ultra') {
      corpo = `
        <div class="joy-linha"><span class="joy-rot">TRIG</span>${joySelectPino(s.trig, s.uid, 'trig', false, [s.echo])}
          <span class="joy-rot curto">ECHO</span>${joySelectPino(s.echo, s.uid, 'echo', false, [s.trig])}</div>
        ${joyRenderFaixas(s)}`;
    } else if (s.tipo === 'pot') {
      corpo = `
        <div class="joy-linha"><span class="joy-rot">Pino</span>${joySelectPino(s.pino, s.uid, 'pino', true)}</div>
        ${joyRenderFaixas(s)}`;
    } else if (s.tipo === 'led') {
      const opcoes = ['', ...usadas];
      if (s.tecla && !opcoes.includes(s.tecla)) opcoes.push(s.tecla);
      corpo = `
        <div class="joy-linha"><span class="joy-rot">Pino</span>${joySelectPino(s.pino, s.uid, 'pino', false)}</div>
        <div class="joy-linha"><span class="joy-rot">Acende com</span>
          <select class="joy-sel" data-campo="tecla" aria-label="Tecla que acende o LED">
            ${opcoes.map((t) => `<option value="${escJ(t)}"${t === (s.tecla || '') ? ' selected' : ''}>${t ? escJ(JoystickGen.rotuloTecla(t)) : '— escolha —'}</option>`).join('')}
          </select>
        </div>
        <p class="joy-frase">O LED acende sozinho, no próprio Arduino, enquanto algum sensor estiver mandando essa tecla.</p>`;
    }
    return `
      <article class="joy-card tipo-${s.tipo}" data-uid="${s.uid}">
        <header>
          <img src="${ICONES_JOY[s.tipo]}" alt="">
          <div class="joy-card-tit"><b>${escJ(it.nome)}</b><small>${escJ(LIGACAO_JOY[s.tipo])}</small></div>
          <button type="button" class="joy-x" data-acao="tirar" title="Tirar ${escJ(it.nome)}" aria-label="Tirar ${escJ(it.nome)}">✕</button>
        </header>
        <div class="joy-card-corpo">${corpo}</div>
      </article>`;
  }).join('');
}

function joyRenderLado() {
  const g = JOY.gerado;
  // mensagens
  const msgs = $('#joy-msgs');
  msgs.innerHTML = [
    ...g.erros.map((m) => `<li class="erro">✗ ${escJ(m)}</li>`),
    ...g.avisos.map((m) => `<li class="aviso">! ${escJ(m)}</li>`),
  ].join('') || '<li class="ok">✓ Tudo pronto. Clique em Upload para gravar no Arduino.</li>';
  // teste ao vivo
  const teclas = $('#joy-teclas');
  teclas.innerHTML = g.acoes.length ? g.acoes.map((a) => `
    <div class="joy-key${JOY.ativas.has(a.numero) ? ' ligada' : ''}" data-num="${a.numero}" title="${escJ(a.descricao)}">
      <span class="k">${escJ(JoystickGen.rotuloTecla(a.tecla))}</span>
      <small>A${a.numero} · ${escJ(a.sensor)}${a.modo === 'toque' ? ' · toque' : ''}</small>
    </div>`).join('') : '<p class="joy-vazio">As teclas configuradas aparecem aqui.</p>';
  joyRenderStatus();
  // código
  joyRenderCodigo();
}

function joyRenderStatus() {
  const el = $('#joy-status');
  if (JOY.conectado) { el.textContent = 'Joystick conectado — aperte os sensores!'; el.className = 'joy-status ligado'; }
  else if (MON.aberto) { el.textContent = 'Monitor aberto. Esperando mensagens do joystick…'; el.className = 'joy-status'; }
  else { el.textContent = 'Grave o código e abra o Monitor Serial (9600) para testar aqui.'; el.className = 'joy-status'; }
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
    case 'curto':
      s.curto = s.curto === false;
      if (s.curto === false && !s.longo) s.longo = true;
      break;
    case 'longo':
      s.longo = !s.longo;
      if (!s.longo && s.curto === false) s.curto = true;
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
  // números: não redesenha a lista (perderia o foco do campo), só o resto
  joyMudou(el.type === 'number');
  if (el.type === 'number') joyAtualizarFrases();
}

function joyAtualizarFrases() {
  document.querySelectorAll('#joy-lista .joy-card.tipo-botao').forEach((card) => {
    const s = JOY.config.sensores.find((x) => x.uid === card.dataset.uid);
    const p = card.querySelector('.joy-frase');
    if (s && p) p.innerHTML = joyFrase(s);
  });
}

/* ------------------------------------------------------------
 * Escolher a tecla
 * ---------------------------------------------------------- */
function joyAbrirDialogoTecla() {
  const d = $('#joy-dialogo-tecla');
  $('#joy-tecla-mostra').innerHTML = '<span class="ph">aperte uma tecla…</span>';
  d.showModal();
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
  if (['Shift', 'Control', 'Alt'].includes(ev.key) && !ev.repeat) {
    // modificadores sozinhos também valem, mas esperam soltar para não pegar atalhos
    ev.preventDefault();
    $('#joy-tecla-mostra').textContent = JoystickGen.rotuloTecla(JoystickGen.teclaDoEvento(ev));
    $('#joy-dialogo-tecla').dataset.mod = JoystickGen.teclaDoEvento(ev);
    return;
  }
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
  if (l === 'JOYSTICK PRONTO') { JOY.conectado = true; JOY.ativas.clear(); if (!$('#area-joystick').hidden) joyRenderLado(); return; }
  const m = /^A(\d+)_(DOWN|UP)$/.exec(l);
  if (!m) return;
  JOY.conectado = true;
  const n = +m[1];
  const el = document.querySelector(`#joy-teclas .joy-key[data-num="${n}"]`);
  const chips = document.querySelectorAll(`#joy-lista .joy-num[data-num="${n}"]`);
  if (m[2] === 'DOWN') {
    JOY.ativas.add(n);
    if (el) { el.classList.add('ligada'); el.classList.remove('pisca'); void el.offsetWidth; el.classList.add('pisca'); }
    chips.forEach((c) => c.classList.add('ligada'));
  } else {
    JOY.ativas.delete(n);
    if (el) el.classList.remove('ligada');
    chips.forEach((c) => c.classList.remove('ligada'));
  }
  if ($('#joy-status').className.indexOf('ligado') < 0) joyRenderStatus();
}

/* ------------------------------------------------------------
 * Integração com a IDE (chamado por ide.js)
 * ---------------------------------------------------------- */
function joystickCodigoAtual() { return JOY.gerado ? JOY.gerado.ino : ''; }
function joystickPodeGravar() { return !!JOY.gerado && !JOY.gerado.erros.length; }
function joystickAoAbrir() {
  if (!JOY.gerado) joyMudou();
  else { joyRenderLista(); joyRenderLado(); }
  // em telas baixas, recolhe o painel de baixo na primeira vez (o "Testar no Monitor" abre de novo)
  if (!JOY.jaAbriu && window.innerHeight < 900 && !MON.aberto) {
    $('#console-wrap').classList.add('recolhido');
    $('#bt-recolher').textContent = '▴';
  }
  JOY.jaAbriu = true;
  JOY.rotuloAntes = $('#rotulo-sketch').textContent;
  $('#rotulo-sketch').textContent = 'Joystick.ino';
}
function joystickAoSair() {
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
  log('Joystick.zip baixado: descompacte e dê dois cliques em "Iniciar joystick.bat".', 'ok');
}

function joyIniciar() {
  if (!document.getElementById('area-joystick') || typeof JoystickGen === 'undefined') return;
  joyCarregar();

  // paleta
  $('#joy-paleta').innerHTML = Object.keys(ICONES_JOY).map((t) => `
    <button type="button" class="joy-add" data-tipo="${t}">
      <img src="${ICONES_JOY[t]}" alt="">
      <span><b>${JoystickGen.TIPOS[t].nome}</b><small>${DESC_JOY[t]}</small></span>
      <span class="mais" aria-hidden="true">＋</span>
    </button>`).join('');
  $('#joy-paleta').addEventListener('click', (ev) => {
    const b = ev.target.closest('.joy-add');
    if (b) joyAdicionar(b.dataset.tipo);
  });

  const lista = $('#joy-lista');
  lista.addEventListener('click', joyAoClicar);
  lista.addEventListener('change', joyAoMudar);

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
    $('#editor-livre').value = JOY.gerado.ino;
    trocarAba('livre');
    log('O código do joystick foi para o Editor C++. Lá você pode mudar o que quiser.', 'info');
  });
  $('#bt-joy-zip').addEventListener('click', joyBaixarPacote);
  $('#bt-joy-padrao').addEventListener('click', () => {
    if (!confirm('Voltar para o joystick de 4 botões (setas)? A montagem atual será apagada.')) return;
    JOY.config = JoystickGen.configPadrao();
    JOY.config.sensores.forEach((s) => { s.uid = novoUid(); });
    joyMudou();
  });
  $('#bt-joy-monitor').addEventListener('click', () => {
    mostrarPainelInf('monitor');
    $('#mon-baud').value = '9600';
    if (!MON.aberto) ligarMonitor();
  });

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
  setInterval(() => { if (!$('#area-joystick').hidden && !JOY.conectado) joyRenderStatus(); }, 1500);

  JOY.gerado = JoystickGen.gerar(JOY.config);
}

document.addEventListener('DOMContentLoaded', joyIniciar);
