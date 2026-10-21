// Compara, fase a fase, o firmware nativo (avr-gcc) com a MIDE VM + bytecode.
const fs = require('fs');
const { hexParaImagem, simular, montarVM } = require('./run.js');
const fw = fs.readFileSync(__dirname + '/../vm/mide_vm.hex', 'utf8');
const SEG = +(process.env.SEG || 2.5);
const so = process.argv.slice(2);
const JAN = 400;  // 20 ms por janela (amostras de 50 us)

function resumo(amostras) {
  const r = {};
  for (let p = 2; p <= 19; p++) {
    const jan = [];
    for (let i = 0; i < amostras.length; i += JAN) {
      let altos = 0, n = 0;
      for (let k = i; k < Math.min(i + JAN, amostras.length); k++) { altos += (amostras[k] >> p) & 1; n++; }
      jan.push(altos / n);
    }
    r[p] = jan;
  }
  return r;
}
const linhas = (s) => s.split(/\r?\n/).filter(Boolean);

let falhas = 0;
for (const f of fs.readdirSync(__dirname + '/../fases').filter((x) => x.endsWith('.ino')).sort()) {
  const id = f.replace('.ino', '');
  if (so.length && !so.includes(id)) continue;
  const fonte = fs.readFileSync(__dirname + '/../fases/' + f, 'utf8');
  const cenario = { botaoAlto: /pinMode\(2,\s*INPUT\)/.test(fonte) };
  const nat = simular(hexParaImagem(fs.readFileSync(__dirname + '/../hex/' + id + '.hex', 'utf8')), SEG, cenario);
  const vm = simular(montarVM(fw, fs.readFileSync(__dirname + '/../fases/' + id + '.mvb')), SEG, cenario);
  const a = resumo(nat.amostras), b = resumo(vm.amostras);
  const problemas = [];
  for (let p = 2; p <= 19; p++) {
    let ruins = 0;
    for (let j = 0; j < a[p].length; j++) if (Math.abs(a[p][j] - b[p][j]) > 0.12) ruins++;
    if (ruins / a[p].length > 0.06) problemas.push(`pino ${p}: ${ruins}/${a[p].length} janelas diferentes`);
  }
  const ln = linhas(nat.serial), lv = linhas(vm.serial);
  const k = Math.min(ln.length, lv.length);
  let difSerial = 0;
  for (let i = 0; i < k; i++) if (ln[i] !== lv[i]) difSerial++;
  if (difSerial || Math.abs(ln.length - lv.length) > 2) problemas.push(`serial: nativo ${ln.length} linhas, vm ${lv.length}, ${difSerial} diferentes` +
    (difSerial ? ` (ex.: "${ln.find((x, i) => x !== lv[i])}" vs "${lv[ln.findIndex((x, i) => x !== lv[i])]}")` : ''));
  const i2a = nat.i2c.join(','), i2b = vm.i2c.join(',');
  if (i2a.slice(0, 4000) !== i2b.slice(0, Math.min(4000, i2a.length)) && i2a.length) {
    problemas.push(`i2c difere (nativo ${nat.i2c.length} bytes, vm ${vm.i2c.length})`);
  }
  const ok = !problemas.length;
  if (!ok) falhas++;
  console.log((ok ? 'OK   ' : 'FALHA') + ' ' + id.padEnd(8) + (ok ? `  serial ${ln.length} linhas, i2c ${nat.i2c.length}` : '  ' + problemas.join(' | ')));
  if (process.env.DUMP) { console.log('NAT', JSON.stringify(nat.serial.slice(0, 300))); console.log('VM ', JSON.stringify(vm.serial.slice(0, 300))); }
}
console.log(falhas ? `${falhas} fase(s) com diferença` : 'todas iguais');
