/* ============================================================
 * monitor.js — Monitor Serial e Traçador Serial
 * ------------------------------------------------------------
 * O servidor local usa o próprio `arduino-cli monitor` como ponte
 * com a porta; aqui só buscamos as linhas novas de tempos em
 * tempos e desenhamos.
 *
 * O Traçador lê os números de cada linha (separados por vírgula,
 * espaço ou tabulação) e plota cada coluna como uma série — igual
 * ao Serial Plotter do Arduino IDE.
 * ============================================================ */
'use strict';

const MON = {
  proximo: 0,        // índice da próxima linha a buscar
  aberto: false,
  timer: null,
  series: [],        // [{nome, valores: []}]
  rotulos: [],
  maxPontos: 100,
};

const CORES_TRAC = ['#00979C', '#D35400', '#7B4EA8', '#2E9B2E', '#D93025',
                    '#1A73E8', '#B77900', '#E4007F'];

/* ------------------------------------------------------------
 * Ligar / desligar
 * ---------------------------------------------------------- */
/* Placas sem servidor de serial: o texto chega direto do navegador (Bluetooth do LEGO, USB da micro:bit). */
const monitorSemServidor = () => estado.placaCurso === 'lego' || estado.placaCurso === 'microbit' ||
  (typeof k10Navegador === 'function' && k10Navegador());   // K10 MicroPython: o print() chega pela Web Serial (k10_web.js)

async function ligarMonitor() {
  if (monitorSemServidor()) return;   // o hub manda o print() por Bluetooth (lego.js); a micro:bit, pela USB (microbit.js)
  const porta = $('#porta').value;
  if (!porta) {
    escreverMonitor('Escolha a porta da placa na barra de cima.', 'sis');
    return;
  }
  const baud = parseInt($('#mon-baud').value, 10) || 9600;
  try {
    const r = await api('/api/monitor', { acao: 'abrir', porta, baud });
    if (!r.ok) {
      escreverMonitor('Não foi possível abrir a porta. ' +
        ((r.estado && r.estado.erro) || 'Feche o Arduino IDE se ele estiver usando a porta.'), 'sis');
      sincronizarMonitor(r.estado);
      return;
    }
    MON.proximo = 0;
    $('#mon-saida').innerHTML = '';
    zerarTracador();
    escreverMonitor(`— conectado em ${porta} a ${baud} baud —`, 'sis');
    sincronizarMonitor(r.estado);
  } catch (e) {
    escreverMonitor('Servidor local não respondeu.', 'sis');
  }
}

async function desligarMonitor(silencioso) {
  if (monitorSemServidor()) return;
  try {
    const r = await api('/api/monitor', { acao: 'fechar' });
    sincronizarMonitor(r.estado);
  } catch (e) { /* servidor caiu: segue */ }
  if (!silencioso) escreverMonitor('— desconectado —', 'sis');
}

function alternarMonitor() {
  if (MON.aberto) desligarMonitor();
  else ligarMonitor();
}

/* Estado vindo do servidor (também usado no arranque). */
function sincronizarMonitor(estadoMon) {
  if (!estadoMon) return;
  MON.aberto = !!estadoMon.aberto;
  const bt = $('#bt-mon-ligar');
  bt.textContent = MON.aberto ? '■ Desconectar' : '▶ Conectar';
  bt.classList.toggle('ligado', MON.aberto);
  const rot = $('#mon-estado');
  rot.textContent = MON.aberto
    ? `${estadoMon.porta} · ${estadoMon.baud} baud`
    : (estadoMon.erro || 'desconectado');
  rot.classList.toggle('ligado', MON.aberto);
  $('#trac-estado').textContent = MON.aberto
    ? `lendo ${estadoMon.porta} · ${estadoMon.baud} baud`
    : 'use o Monitor Serial para conectar';
  if (MON.aberto && estadoMon.baud) $('#mon-baud').value = String(estadoMon.baud);
}

/* ------------------------------------------------------------
 * Leitura contínua
 * ---------------------------------------------------------- */
async function puxarMonitor() {
  if (!estado.servidorOk || monitorSemServidor()) return;
  try {
    const r = await api(`/api/monitor?desde=${MON.proximo}`);
    sincronizarMonitor(r.estado);
    if (r.linhas && r.linhas.length) {
      for (const l of r.linhas) {
        escreverMonitor(l, '');
        alimentarTracador(l);
      }
      MON.proximo = r.proximo;
      if (estado.painelInf === 'tracador') desenharTracador();
    } else if (typeof r.proximo === 'number') {
      MON.proximo = r.proximo;
    }
  } catch (e) { /* servidor ocupado compilando: tenta de novo depois */ }
}

function escreverMonitor(texto, classe) {
  const caixa = $('#mon-saida');
  const div = criar('div', classe || '');
  if ($('#mon-hora').checked && !classe) {
    const h = criar('span', 'hora');
    const d = new Date();
    h.textContent = d.toTimeString().slice(0, 8) + '.' +
      String(d.getMilliseconds()).padStart(3, '0') + '  ';
    div.appendChild(h);
    div.appendChild(document.createTextNode(texto));
  } else {
    div.textContent = texto;
  }
  caixa.appendChild(div);
  while (caixa.childElementCount > 2000) caixa.removeChild(caixa.firstChild);
  if ($('#mon-autoscroll').checked) caixa.scrollTop = caixa.scrollHeight;
}

function limparMonitor() {
  $('#mon-saida').innerHTML = '';
  zerarTracador();
}

async function enviarMonitor() {
  const campo = $('#mon-texto');
  const texto = campo.value;
  if (!texto) return;
  if (estado.placaCurso === 'lego') {
    if (await legoEnviarStdin(texto, $('#mon-final').value)) {
      escreverMonitor('→ ' + texto, 'env');
      campo.value = '';
    }
    return;
  }
  if (estado.placaCurso === 'microbit') {
    if (await mbEnviarStdin(texto, $('#mon-final').value)) {
      escreverMonitor('→ ' + texto, 'env');
      campo.value = '';
    }
    return;
  }
  if (typeof k10Navegador === 'function' && k10Navegador()) {
    if (await k10WebStdin(texto, $('#mon-final').value)) {
      escreverMonitor('→ ' + texto, 'env');
      campo.value = '';
    }
    return;
  }
  if (!MON.aberto) {
    escreverMonitor('Conecte antes de enviar.', 'sis');
    return;
  }
  const r = await api('/api/monitor', {
    acao: 'enviar', texto, final: $('#mon-final').value,
  });
  if (r.ok) {
    escreverMonitor('→ ' + texto, 'env');
    campo.value = '';
  } else {
    escreverMonitor('Falha ao enviar.', 'sis');
  }
}

/* A porta mudou na barra de cima: o monitor precisa reconectar. */
function aoMudarPorta(porta) {
  if (!monitorSemServidor() && MON.aberto && porta) {
    desligarMonitor(true).then(() => ligarMonitor());
  }
}

/* ------------------------------------------------------------
 * Placa LEGO: o print() do hub chega em pedaços (Bluetooth) e vira
 * linhas aqui. O que ficou sem \n (prompt de input()) é solto após
 * 300 ms.
 * ---------------------------------------------------------- */
const MON_LEGO = { buffer: null, timer: null };

function monitorReceberLinha(linha) {
  escreverMonitor(linha, '');
  alimentarTracador(linha);
  if (estado.painelInf === 'tracador') desenharTracador();
}

function monitorReceberTexto(texto) {
  if (!MON_LEGO.buffer) MON_LEGO.buffer = (estado.placaCurso === 'microbit' ? MicrobitUSB : (estado.placaCurso === 'k10' ? K10MP : PybricksHub)).criarBufferLinhas(monitorReceberLinha);
  MON_LEGO.buffer.adicionar(texto);
  clearTimeout(MON_LEGO.timer);
  if (MON_LEGO.buffer.pendente()) MON_LEGO.timer = setTimeout(() => MON_LEGO.buffer.descarregar(), 300);
}

/* ------------------------------------------------------------
 * Traçador Serial
 * ---------------------------------------------------------- */
function zerarTracador() {
  MON.series = [];
  MON.rotulos = [];
  desenharTracador();
}

/* Extrai os números de uma linha. Aceita "12", "12,34", "x:12 y:34". */
function alimentarTracador(linha) {
  const nums = [];
  const nomes = [];
  const re = /([A-Za-z_][\w]*)\s*[:=]\s*(-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(linha)) !== null) {
    if (m[2] !== undefined) { nomes.push(m[1]); nums.push(parseFloat(m[2])); }
    else { nomes.push(null); nums.push(parseFloat(m[3])); }
  }
  if (!nums.length) return;

  MON.maxPontos = parseInt($('#trac-janela').value, 10) || 100;
  nums.forEach((v, i) => {
    if (!MON.series[i]) MON.series[i] = { nome: nomes[i] || `série ${i + 1}`, valores: [] };
    else if (nomes[i]) MON.series[i].nome = nomes[i];
    MON.series[i].valores.push(v);
    if (MON.series[i].valores.length > MON.maxPontos) MON.series[i].valores.shift();
  });
  atualizarLegenda();
}

function atualizarLegenda() {
  const el = $('#trac-legenda');
  el.innerHTML = MON.series.map((s, i) => {
    const v = s.valores[s.valores.length - 1];
    return `<i style="color:${CORES_TRAC[i % CORES_TRAC.length]}">${escapar(s.nome)}: ` +
           `<b style="color:var(--txt2)">${v === undefined ? '—' : v}</b></i>`;
  }).join('');
}

function corDoTema(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

function desenharTracador() {
  const cv = document.getElementById('trac-canvas');
  if (!cv || cv.clientWidth === 0) return;
  const dpr = window.devicePixelRatio || 1;
  const L = cv.clientWidth, A = cv.clientHeight;
  if (cv.width !== L * dpr || cv.height !== A * dpr) {
    cv.width = L * dpr; cv.height = A * dpr;
  }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, L, A);
  g.fillStyle = corDoTema('--console') || '#fff';
  g.fillRect(0, 0, L, A);

  const series = MON.series.filter((s) => s && s.valores.length > 1);
  const pad = { e: 46, d: 10, c: 12, b: 20 };

  if (!series.length) {
    g.fillStyle = corDoTema('--txt3') || '#999';
    g.font = '12px system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText('Sem dados numéricos ainda — conecte o Monitor Serial e use Serial.println(valor).',
               L / 2, A / 2);
    return;
  }

  let min = Infinity, max = -Infinity;
  for (const s of series) for (const v of s.valores) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) { min -= 1; max += 1; }
  const folga = (max - min) * 0.1;
  min -= folga; max += folga;

  const x = (i, n) => pad.e + (L - pad.e - pad.d) * (n <= 1 ? 0 : i / (n - 1));
  const y = (v) => pad.c + (A - pad.c - pad.b) * (1 - (v - min) / (max - min));

  // grade + rótulos do eixo
  g.strokeStyle = corDoTema('--borda') || '#ddd';
  g.fillStyle = corDoTema('--txt3') || '#999';
  g.font = '10px system-ui, sans-serif';
  g.textAlign = 'right';
  g.lineWidth = 1;
  for (let k = 0; k <= 4; k++) {
    const v = min + (max - min) * k / 4;
    const yy = Math.round(y(v)) + 0.5;
    g.beginPath(); g.moveTo(pad.e, yy); g.lineTo(L - pad.d, yy); g.stroke();
    g.fillText(v.toFixed(Math.abs(max - min) < 10 ? 1 : 0), pad.e - 6, yy + 3);
  }

  series.forEach((s, idx) => {
    g.strokeStyle = CORES_TRAC[idx % CORES_TRAC.length];
    g.lineWidth = 1.8;
    g.lineJoin = 'round';
    g.beginPath();
    s.valores.forEach((v, i) => {
      const px = x(i, s.valores.length), py = y(v);
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    });
    g.stroke();
  });
}

/* ------------------------------------------------------------
 * Ligação com a interface
 * ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  $('#bt-mon-ligar').addEventListener('click', alternarMonitor);
  $('#bt-mon-enviar').addEventListener('click', enviarMonitor);
  $('#mon-texto').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); enviarMonitor(); }
  });
  $('#mon-baud').addEventListener('change', () => { if (MON.aberto) ligarMonitor(); });
  $('#trac-janela').addEventListener('change', () => {
    MON.maxPontos = parseInt($('#trac-janela').value, 10) || 100;
    for (const s of MON.series) {
      if (s.valores.length > MON.maxPontos) s.valores = s.valores.slice(-MON.maxPontos);
    }
    desenharTracador();
  });
  window.addEventListener('resize', desenharTracador);

  MON.timer = setInterval(puxarMonitor, 350);
});
