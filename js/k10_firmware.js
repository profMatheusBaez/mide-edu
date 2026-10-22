/* ============================================================
 * k10_firmware.js — instala o MicroPython na UNIHIKER K10
 * ------------------------------------------------------------
 * Grava a imagem completa do firmware MicroPython da K10 (um .bin
 * de 16 MB que começa no endereço 0x0) no ESP32-S3, direto do
 * navegador, com o esptool-js da Espressif (js/vendor/esptool).
 *
 * O arquivo é o firmware oficial da UNIHIKER (página "MicroPython"
 * do site unihiker.com). A MIDE não traz o firmware junto; se o
 * professor colocar o arquivo em assets/k10/micropython-k10.bin, a
 * IDE usa esse sem perguntar.
 *
 * Sem DOM: valida e grava; a tela fica em k10_web.js.
 * ============================================================ */
(function (raiz) {
  'use strict';

  const CAMINHO_LOCAL = 'assets/k10/micropython-k10.bin';
  const CHIP_ESP32S3 = 9;
  const TAMANHOS = { 0: '1 MB', 1: '2 MB', 2: '4 MB', 3: '8 MB', 4: '16 MB', 5: '32 MB' };

  /* Confere se o arquivo é mesmo uma imagem completa do ESP32-S3 com MicroPython. */
  function validar(u8, nome) {
    if (!(u8 instanceof Uint8Array) || u8.length < 0x10000) {
      return { ok: false, erro: 'Este arquivo é pequeno demais para ser o firmware da K10.' };
    }
    if (u8[0] !== 0xE9) {
      return { ok: false, erro: 'Este arquivo não é um firmware do ESP32 (ele não começa no endereço 0x0). Use a imagem completa do MicroPython da K10, a que é gravada no endereço 0x0.' };
    }
    const chip = u8[12] | (u8[13] << 8);
    if (chip !== CHIP_ESP32S3) {
      return { ok: false, erro: 'Este firmware é de outro chip, não do ESP32-S3 da UNIHIKER K10.' };
    }
    if (!(u8[0x8000] === 0xAA && u8[0x8001] === 0x50)) {
      return { ok: false, erro: 'Falta a tabela de partições no endereço 0x8000: o arquivo não é a imagem completa. Use o .bin “completo” (gravado em 0x0) do MicroPython da K10.' };
    }
    const amostra = buscar(u8, 'MicroPython');
    const k10 = buscar(u8, 'unihiker_k10');
    if (!amostra) return { ok: false, erro: 'Este firmware não é MicroPython (pode ser um programa C++).' };
    const avisos = [];
    if (!k10) avisos.push('Não encontrei a biblioteca unihiker_k10 neste firmware: ele pode ser o MicroPython genérico do ESP32-S3, sem a tela, os sensores e os LEDs da K10.');
    return {
      ok: true, avisos,
      info: {
        nome: nome || 'firmware.bin',
        bytes: u8.length,
        tamanhoFlash: TAMANHOS[u8[3] >> 4] || '?',
        megas: (u8.length / 1048576).toFixed(1),
        temBibliotecaK10: k10,
      },
    };
  }

  function buscar(u8, texto) {
    const alvo = new TextEncoder().encode(texto);
    const primeiro = alvo[0];
    for (let i = u8.indexOf(primeiro); i >= 0 && i <= u8.length - alvo.length; i = u8.indexOf(primeiro, i + 1)) {
      let j = 1;
      while (j < alvo.length && u8[i + j] === alvo[j]) j++;
      if (j === alvo.length) return true;
    }
    return false;
  }

  /* O professor deixou o firmware dentro da pasta da MIDE? */
  async function procurarLocal() {
    if (typeof fetch !== 'function' || (raiz.location && raiz.location.protocol === 'file:')) return null;
    try {
      const r = await fetch(CAMINHO_LOCAL, { cache: 'no-store' });
      if (!r.ok) return null;
      const u8 = new Uint8Array(await r.arrayBuffer());
      const v = validar(u8, 'micropython-k10.bin (pasta da MIDE)');
      return v.ok ? { imagem: u8, validacao: v } : null;
    } catch (e) { return null; }
  }

  /* Grava a imagem. A porta precisa estar FECHADA (o esptool-js abre). */
  async function instalar({ porta, imagem, aoLog, aoProgresso, baud }) {
    const ET = raiz.EspTool;
    if (!ET) throw new Error('O gravador do ESP32 (esptool-js) não foi carregado.');
    const log = aoLog || (() => {});
    const terminal = { clean() { }, writeLine(l) { log(String(l)); }, write(t) { const s = String(t).trim(); if (s) log(s); } };
    const transporte = new ET.Transport(porta, false);
    const carregador = new ET.ESPLoader({ transport: transporte, baudrate: baud || 921600, romBaudrate: 115200, terminal });
    let conectou = false;
    try {
      let chip;
      try {
        chip = await carregador.main('default_reset');
        conectou = true;
      } catch (e) {
        const err = new Error('Não consegui colocar a K10 no modo de gravação. Segure o botão BOOT da K10, aperte e solte o RST, solte o BOOT e tente de novo (a placa pode aparecer com outro nome na janela do navegador).');
        err.modoGravacao = true;
        err.causa = e;
        throw err;
      }
      if (!/ESP32-S3/i.test(chip)) throw new Error(`Esta placa é um ${chip}, não o ESP32-S3 da UNIHIKER K10. Nada foi gravado.`);
      log(`Placa encontrada: ${chip}. Gravando ${(imagem.length / 1048576).toFixed(1)} MB…`);
      await carregador.writeFlash({
        fileArray: [{ data: imagem, address: 0 }],
        flashMode: 'keep', flashFreq: 'keep', flashSize: 'keep',
        eraseAll: false, compress: true,
        reportProgress: (_i, escrito, total) => { if (aoProgresso) aoProgresso(total ? escrito / total : 0); },
      });
      log('Firmware gravado. Reiniciando a K10…');
      await carregador.after('hard_reset');
      return { ok: true, chip };
    } finally {
      try { await transporte.disconnect(); } catch (e) { }
      if (!conectou) { try { await porta.close(); } catch (e) { } }
    }
  }

  const K10Firmware = { validar, procurarLocal, instalar, CAMINHO_LOCAL };
  raiz.K10Firmware = K10Firmware;
  if (typeof module !== 'undefined' && module.exports) module.exports = K10Firmware;
})(typeof window !== 'undefined' ? window : globalThis);
