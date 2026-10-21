// Gera js/mide_firmware.js (MIDE VM) e js/mide_fases_bin.js (as 40 missões compiladas)
const fs = require('fs');
const C = require('/home/claude/src/ide_web/js/mide_compilador.js');
const { hexParaImagem } = require('../sim/run.js');
const usado = (img, limite) => { let n = limite; while (n > 0 && img[n - 1] === 0xFF) n--; return Math.ceil(n / 128) * 128; };
const b64 = (u8) => Buffer.from(u8).toString('base64');
const fw = hexParaImagem(fs.readFileSync('vm/mide_vm.hex', 'utf8'));
const nFw = usado(fw, 0x4000);
if (nFw > 0x4000) throw new Error('firmware grande demais');
const cab = '/* GERADO por ferramentas-web/tools/gerar_web.js — não edite à mão. */\n';
fs.writeFileSync('/home/claude/src/ide_web/js/mide_firmware.js', cab +
  `const MIDE_VM_FIRMWARE = { versao: ${C.VM_VERSAO}, tamanho: ${nFw}, base64: '${b64(fw.slice(0, nFw))}' };\n`);
const mapa = {};
for (const f of fs.readdirSync('fases').filter((x) => x.endsWith('.ino')).sort()) {
  const id = f.replace('.ino', '');
  const img = hexParaImagem(fs.readFileSync('hex/' + id + '.hex', 'utf8'));
  const n = usado(img, 0x7E00);
  const h = C.hash(C.normalizar(fs.readFileSync('fases/' + f, 'utf8')));
  mapa[h] = { id, base64: b64(img.slice(0, n)) };
}
fs.writeFileSync('/home/claude/src/ide_web/js/mide_fases_bin.js', cab +
  '/* As 40 missões do Uno compiladas com o avr-gcc (núcleo Arduino AVR + Servo + LiquidCrystal_I2C).\n' +
  ' * Chave: hash do código normalizado (MideCompilador.normalizar/hash). */\n' +
  'const MIDE_FASES_BIN = ' + JSON.stringify(mapa, null, 0).replace(/},"/g, '},\n"') + ';\n');
console.log('firmware', nFw, 'bytes; fases', Object.keys(mapa).length);
