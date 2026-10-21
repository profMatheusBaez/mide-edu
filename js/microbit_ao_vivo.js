/* ============================================================
 * microbit_ao_vivo.js — MIDE EDU, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Painel ao vivo: mostra na tela o que a micro:bit manda por
 * Bluetooth — inclinação (x/y/z), botões A/B, bússola e temperatura.
 * Recebe os objetos 'dados' do MicrobitBLE:
 *   { tipo:'acelerometro', x, y, z } · { tipo:'botao', botao, apertado }
 *   { tipo:'bussola', x, y, z, graus } · { tipo:'temperatura', celsius }
 * Um cartão sem dados mostra “sem dados” (a placa não liga aquele
 * serviço) em vez de inventar valores.
 * ============================================================ */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica(raiz);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.MbAoVivo = api;
})(typeof self !== 'undefined' ? self : globalThis, function (raiz) {
  'use strict';

  const LIMITE_MG = 2000;   // o acelerômetro da micro:bit vai de -2000 a +2000 mg

  /* Posição (0 a 100) de um valor de aceleração na barra: 50 = centro (zero). */
  function porcentoEixo(mg) {
    const v = Math.max(-LIMITE_MG, Math.min(LIMITE_MG, Number(mg) || 0));
    return (v + LIMITE_MG) / (2 * LIMITE_MG) * 100;
  }

  /* Altura (0 a 100) do termômetro: escala de 0 °C a 40 °C. */
  function porcentoTemperatura(c) {
    const v = Math.max(0, Math.min(40, Number(c) || 0));
    return v / 40 * 100;
  }

  /* Rumo → letra do ponto cardeal (N, NE, L, SE, S, SO, O, NO). */
  function pontoCardeal(graus) {
    const nomes = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const g = ((Number(graus) % 360) + 360) % 360;
    return nomes[Math.round(g / 45) % 8];
  }

  function el(id) { return raiz.document ? raiz.document.getElementById(id) : null; }
  function comDados(cartao) { if (cartao) cartao.removeAttribute('data-sem-dados'); }

  /* Aplica um dado na tela. Devolve true se reconheceu o tipo. */
  function aplicar(d) {
    if (!d || !raiz.document) return false;
    if (d.tipo === 'acelerometro') {
      const c = el('av-acel');
      if (!c) return false;
      comDados(c);
      for (const eixo of ['x', 'y', 'z']) {
        const linha = c.querySelector('.av-barra[data-eixo="' + eixo + '"]');
        if (!linha) continue;
        const p = porcentoEixo(d[eixo]);
        const preench = linha.querySelector('.av-preench');
        /* a barra cresce do centro (50%) para o lado em que a aceleração empurra */
        preench.style.left = Math.min(50, p) + '%';
        preench.style.width = Math.abs(p - 50) + '%';
        linha.querySelector('output').textContent = String(Math.round(d[eixo]));
      }
      return true;
    }
    if (d.tipo === 'botao') {
      const c = el('av-botoes');
      if (!c) return false;
      comDados(c);
      const b = c.querySelector('.av-botao[data-botao="' + d.botao + '"]');
      if (b) b.classList.toggle('apertado', !!d.apertado);
      return true;
    }
    if (d.tipo === 'bussola') {
      const c = el('av-bussola');
      if (!c) return false;
      comDados(c);
      const graus = typeof d.graus === 'number' ? d.graus : null;
      if (graus !== null) {
        el('av-agulha').setAttribute('transform', 'rotate(' + graus.toFixed(1) + ')');
        el('av-graus').textContent = Math.round(graus) + '° ' + pontoCardeal(graus);
      } else {
        el('av-graus').textContent = 'sem rumo';
      }
      return true;
    }
    if (d.tipo === 'temperatura') {
      const c = el('av-temp');
      if (!c) return false;
      comDados(c);
      el('av-celsius').textContent = Number(d.celsius).toFixed(0) + ' °C';
      el('av-termo-nivel').style.height = porcentoTemperatura(d.celsius) + '%';
      return true;
    }
    return false;
  }

  /* Volta tudo para “sem dados” (ao desconectar). */
  function zerar() {
    if (!raiz.document) return;
    for (const id of ['av-acel', 'av-botoes', 'av-bussola', 'av-temp']) {
      const c = el(id);
      if (c) c.setAttribute('data-sem-dados', 'true');
    }
    raiz.document.querySelectorAll('#av-acel .av-preench').forEach((i) => { i.style.left = '50%'; i.style.width = '0%'; });
    raiz.document.querySelectorAll('#av-acel output').forEach((o) => { o.textContent = '–'; });
    raiz.document.querySelectorAll('#av-botoes .av-botao').forEach((b) => b.classList.remove('apertado'));
    const g = el('av-graus'); if (g) g.textContent = '–';
    const a = el('av-agulha'); if (a) a.setAttribute('transform', 'rotate(0)');
    const t = el('av-celsius'); if (t) t.textContent = '–';
    const n = el('av-termo-nivel'); if (n) n.style.height = '0%';
  }

  return { aplicar, zerar, porcentoEixo, porcentoTemperatura, pontoCardeal, LIMITE_MG };
});
