/* ============================================================
 * barra.js — barra de carregamento do upload
 * ------------------------------------------------------------
 * Aparece na base da tela enquanto o código é compilado e
 * gravado. O "fio" vai se preenchendo e os elétrons correm por
 * dentro dele, acelerando conforme a barra chega nos 100%.
 *
 * As fases (compilando / gravando) vêm do servidor, por
 * /api/progresso — não é uma barra de enfeite: ela anda quando
 * o arduino-cli anda.
 * ============================================================ */
'use strict';

const BARRA = {
  visivel: false,
  valor: 0,          // 0..1 — o que está desenhado
  alvo: 0,           // 0..1 — para onde está indo
  teto: 0.92,        // sem saber o fim exato, não passa daqui antes de concluir
  fase: '',          // 'compilando' | 'gravando' | 'pronto' | 'erro'
  eletrons: [],
  raf: 0,
  poll: 0,
  ultimo: 0,
  esconder: 0,
};

const N_ELETRONS = 14;

function corVar(nome, alt) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return v || alt;
}

/* ------------------------------------------------------------
 * Abrir e fechar
 * ---------------------------------------------------------- */
function barraIniciar(acao) {
  clearTimeout(BARRA.esconder);
  BARRA.visivel = true;
  BARRA.valor = 0;
  BARRA.alvo = 0.06;
  BARRA.teto = 0.92;
  BARRA.fase = 'compilando';
  BARRA.ultimo = performance.now();
  BARRA.eletrons = Array.from({ length: N_ELETRONS }, (_, i) => ({
    x: -(i / N_ELETRONS) * 0.9,
    desvio: (Math.random() - 0.5) * 0.5,
    brilho: 0.6 + Math.random() * 0.4,
  }));

  const el = $('#barra-carga');
  el.classList.remove('oculto', 'ok', 'erro');
  el.classList.add('ativa');
  $('#barra-acao').textContent = acao === 'compilar' ? 'Verificando o código…'
                                                     : 'Compilando o código…';
  $('#barra-pct').textContent = '0%';

  cancelAnimationFrame(BARRA.raf);
  BARRA.raf = requestAnimationFrame(desenharBarra);
  clearInterval(BARRA.poll);
  BARRA.poll = setInterval(puxarProgresso, 250);
  redimensionarBarra();
}

async function puxarProgresso() {
  if (estado.placaCurso === 'lego' || estado.placaCurso === 'microbit') return;   // o progresso vem do envio Bluetooth/USB (lego.js, microbit.js)
  try {
    const r = await api('/api/progresso');
    if (r.fase === BARRA.fase) return;
    BARRA.fase = r.fase;
    if (r.fase === 'compilando') {
      BARRA.alvo = 0.45;
      $('#barra-acao').textContent = 'Compilando o código…';
    } else if (r.fase === 'gravando') {
      BARRA.alvo = 0.9;
      BARRA.teto = 0.97;
      $('#barra-acao').textContent = `Gravando na placa${r.porta ? ' · ' + r.porta : ''}…`;
    }
  } catch (e) { /* servidor ocupado: tenta de novo */ }
}

function barraFinalizar(ok, recado) {
  clearInterval(BARRA.poll);
  BARRA.alvo = 1;
  BARRA.teto = 1;
  const el = $('#barra-carga');
  el.classList.add(ok ? 'ok' : 'erro');
  $('#barra-acao').textContent = recado || (ok ? 'Pronto! Olhe para a sua placa.'
                                               : 'Não foi possível gravar.');
  if (!ok) { BARRA.alvo = BARRA.valor; }
  BARRA.esconder = setTimeout(() => {
    el.classList.remove('ativa');
    el.classList.add('oculto');
    BARRA.visivel = false;
    cancelAnimationFrame(BARRA.raf);
  }, ok ? 2300 : 3400);
}

/* ------------------------------------------------------------
 * Desenho
 * ---------------------------------------------------------- */
function redimensionarBarra() {
  const cv = document.getElementById('barra-fio');
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const L = cv.clientWidth, A = cv.clientHeight;
  if (L && A && (cv.width !== L * dpr || cv.height !== A * dpr)) {
    cv.width = L * dpr;
    cv.height = A * dpr;
  }
}

function desenharBarra(agora) {
  const cv = document.getElementById('barra-fio');
  if (!cv || !BARRA.visivel) return;
  const dt = Math.min(0.05, (agora - BARRA.ultimo) / 1000 || 0.016);
  BARRA.ultimo = agora;

  // avanço suave: corre rápido no começo e vai desacelerando ao se
  // aproximar do alvo, como um capacitor carregando.
  const limite = Math.min(BARRA.alvo, BARRA.teto);
  // ao terminar, corre para os 100% em vez de rastejar até lá
  const ritmo = (BARRA.alvo === 1) ? 5.5 : 1.7;
  BARRA.valor += (limite - BARRA.valor) * Math.min(1, dt * ritmo);
  if (BARRA.alvo === 1 && BARRA.valor > 0.995) BARRA.valor = 1;
  const p = BARRA.valor;
  $('#barra-pct').textContent = Math.round(p * 100) + '%';

  redimensionarBarra();
  const dpr = window.devicePixelRatio || 1;
  const L = cv.clientWidth, A = cv.clientHeight;
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, L, A);

  const meio = A / 2;
  const espessura = 9;
  const raio = espessura / 2;
  const fim = Math.max(raio + 1, L * p);

  // fio apagado
  g.lineCap = 'round';
  g.lineWidth = espessura;
  g.strokeStyle = corVar('--borda2', '#c2cccc');
  g.beginPath();
  g.moveTo(raio + 1, meio);
  g.lineTo(L - raio - 1, meio);
  g.stroke();

  // fio energizado
  const teal = corVar('--teal', '#008184');
  const claro = corVar('--teal-claro', '#00A3A6');
  const erro = corVar('--erro', '#D93025');
  const ok = corVar('--ok', '#2E9B2E');
  const caiu = $('#barra-carga').classList.contains('erro');
  const pronto = $('#barra-carga').classList.contains('ok');
  const grad = g.createLinearGradient(0, 0, Math.max(fim, 1), 0);
  grad.addColorStop(0, caiu ? erro : teal);
  grad.addColorStop(1, caiu ? erro : (pronto ? ok : claro));
  g.strokeStyle = grad;
  g.beginPath();
  g.moveTo(raio + 1, meio);
  g.lineTo(fim, meio);
  g.stroke();

  if (caiu) { BARRA.raf = requestAnimationFrame(desenharBarra); return; }

  // ---- elétrons ----
  // A velocidade cresce com o quadrado do progresso: começa num
  // passeio e termina numa correria perto dos 100%.
  const vel = 0.16 + 1.9 * p * p;
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const e of BARRA.eletrons) {
    e.x += vel * dt;
    if (e.x > p) {                      // chegou na ponta: descarrega e volta
      e.x = -0.03 - Math.random() * 0.12;
      e.desvio = (Math.random() - 0.5) * 0.5;
      e.brilho = 0.6 + Math.random() * 0.4;
    }
    if (e.x < 0) continue;

    const x = raio + 1 + e.x * (L - 2 * raio - 2);
    const y = meio + e.desvio;
    const rastro = 14 + 46 * p;         // rastro mais longo quanto mais rápido

    const gr = g.createLinearGradient(x - rastro, 0, x, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(1, `rgba(255,255,255,${0.5 * e.brilho})`);
    g.strokeStyle = gr;
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(Math.max(raio + 1, x - rastro), y);
    g.lineTo(x, y);
    g.stroke();

    const halo = g.createRadialGradient(x, y, 0, x, y, 7);
    halo.addColorStop(0, `rgba(255,255,255,${0.95 * e.brilho})`);
    halo.addColorStop(0.35, `rgba(190,255,255,${0.55 * e.brilho})`);
    halo.addColorStop(1, 'rgba(120,255,255,0)');
    g.fillStyle = halo;
    g.beginPath();
    g.arc(x, y, 7, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // ponta brilhante
  g.fillStyle = pronto ? ok : '#ffffff';
  g.globalAlpha = 0.9;
  g.beginPath();
  g.arc(fim, meio, raio - 1.5, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  BARRA.raf = requestAnimationFrame(desenharBarra);
}

window.addEventListener('resize', redimensionarBarra);
