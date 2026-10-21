// Teste de ponta a ponta: compila no "navegador", grava pelo STK500 num Uno
// simulado com optiboot, e lê o que o programa escreve no Serial.
const fs = require('fs');
global.MideCompilador = require('/home/claude/src/ide_web/js/mide_compilador.js');
const MideSerial = require('/home/claude/src/ide_web/js/mide_serial.js');
const fwSrc = fs.readFileSync('/home/claude/src/ide_web/js/mide_firmware.js', 'utf8');
const MIDE_VM_FIRMWARE = eval(fwSrc.replace(/^\/\*.*\*\/\n/, '').replace('const MIDE_VM_FIRMWARE =', '(') .replace(/;\s*$/, ')'));
const binSrc = fs.readFileSync('/home/claude/src/ide_web/js/mide_fases_bin.js', 'utf8');
const MIDE_FASES_BIN = eval('(' + binSrc.slice(binSrc.indexOf('{'), binSrc.lastIndexOf('}') + 1) + ')');
const { UnoSimulado, PortaSimulada } = require('./porta_simulada.js');

const deB64 = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
function compilarWeb(codigo) {
  const h = MideCompilador.hash(MideCompilador.normalizar(codigo));
  if (MIDE_FASES_BIN[h]) {
    const bin = deB64(MIDE_FASES_BIN[h].base64); const img = new Uint8Array(0x7E00).fill(0xFF); img.set(bin, 0);
    return { img, trechos: [[0, bin.length]], tipo: 'nativo ' + MIDE_FASES_BIN[h].id };
  }
  const r = MideCompilador.compilar(codigo); if (!r.ok) throw new Error(JSON.stringify(r.erros));
  const fw = deB64(MIDE_VM_FIRMWARE.base64); const img = new Uint8Array(0x7E00).fill(0xFF);
  img.set(fw, 0); img.set(r.bytes, 0x4000);
  return { img, trechos: [[0, fw.length, 'firmware'], [0x4000, 0x4000 + Math.ceil(r.bytes.length / 128) * 128]], tipo: 'vm' };
}

async function gravarELer(uno, codigo, msLeitura) {
  const porta = new PortaSimulada(uno);
  const c = compilarWeb(codigo);
  const t = Date.now();
  const log = [];
  const res = await MideSerial.gravarImagem(porta, c.img, c.trechos, (m) => log.push(m));
  const dt = Date.now() - t;
  // confere a flash simulada
  const flash = new Uint8Array(uno.flash.buffer);
  let difs = 0;
  for (const [a, b] of c.trechos) for (let i = a; i < b; i++) if (flash[i] !== c.img[i]) difs++;
  // escuta o Serial do programa (sem reiniciar de novo)
  uno.saida.length = 0;
  await new Promise((r) => setTimeout(r, msLeitura));
  const texto = Buffer.from(uno.saida).toString('latin1');
  return { tipo: c.tipo, res, dt, difs, texto, log };
}

(async () => {
  const uno = new UnoSimulado();
  const ola = 'void setup() {\n  Serial.begin(115200);\n}\nvoid loop() {\n  Serial.println("OLA MIDE");\n  delay(200);\n}\n';
  let r = await gravarELer(uno, ola, 900);
  console.log('1) VM, placa vazia:', r.tipo, JSON.stringify(r.res), `${r.dt} ms`, 'difs', r.difs, JSON.stringify(r.texto.slice(0, 60)));
  console.log('   ', r.log.join(' | '));
  const ola2 = ola.replace('OLA MIDE', 'SEGUNDO PROGRAMA');
  r = await gravarELer(uno, ola2, 900);
  console.log('2) VM de novo (firmware já lá):', JSON.stringify(r.res), `${r.dt} ms`, 'difs', r.difs, JSON.stringify(r.texto.slice(0, 60)));
  const fase = fs.readFileSync('/home/claude/avrbuild/fases/bot_2.ino', 'utf8').replace('9600', '115200');
  const led5 = fs.readFileSync('/home/claude/avrbuild/fases/led_5.ino', 'utf8');
  r = await gravarELer(uno, led5, 300);
  console.log('3) missão led_5 (nativo):', r.tipo, JSON.stringify(r.res), `${r.dt} ms`, 'difs', r.difs);
  r = await gravarELer(uno, 'void setup(){ Serial.begin(115200); int z = 0; Serial.println(10 / z); }\nvoid loop(){}', 900);
  console.log('4) erro em tempo de execução:', JSON.stringify(r.texto.slice(0, 90)));
  uno.parar();
  process.exit(0);
})().catch((e) => { console.error('FALHOU:', e); process.exit(1); });
