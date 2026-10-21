// Roda o Joystick.ino gerado na MIDE VM (firmware real) dentro do simulador avr8js e
// confere as mensagens da Serial e o LED. Precisa de: npm install avr8js@0.20.1
// Uso: NODE_PATH=<pasta com node_modules> node ferramentas/joystick/simular_joystick.js
const avr = require('avr8js');
const fs = require('fs'), path = require('path'), vm = require('vm');
const J = require('../../js/joystick_gen.js');
const C = require('../../js/mide_compilador.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/mide_firmware.js'), 'utf8') + ';this.F=MIDE_VM_FIRMWARE;', ctx);
const fw = Buffer.from(ctx.F.base64, 'base64');

const cfg = { sensores: [
  { tipo: 'botao', pino: 2, curto: true, longo: true, teclaCurto: 'space', teclaLongo: 'shift', msLongo: 600 },
  { tipo: 'botao', pino: 3, curto: true, longo: false, teclaCurto: 'left' },
  { tipo: 'ultra', trig: 6, echo: 7, faixas: [{ min: 0, max: 15, tecla: 'w', modo: 'segurar' }, { min: 16, max: 40, tecla: 'enter', modo: 'toque' }] },
  { tipo: 'pot', pino: 'A0', faixas: [{ min: 0, max: 341, tecla: 'a', modo: 'segurar' }, { min: 683, max: 1023, tecla: 'd', modo: 'segurar' }] },
  { tipo: 'led', pino: 13, tecla: 'left' },
  { tipo: 'buzzer', pino: 9, sons: [{ tecla: 'space', quando: 'apertar', som: 'tiro' }, { tecla: 'left', quando: 'segurar', som: 'motor' }, { tecla: 'left', quando: 'soltar', som: 'nitro' }] },
] };
const g = J.gerar(cfg);
const r = C.compilar(g.ino);
if (!r.ok) { console.log('não compilou', r.erros); process.exit(1); }
const img = new Uint8Array(32768).fill(0xFF);
img.set(fw, 0); img.set(r.bytes, 0x4000);

const cpu = new avr.CPU(new Uint16Array(img.buffer));
new avr.AVRTimer(cpu, avr.timer0Config); new avr.AVRTimer(cpu, avr.timer1Config); new avr.AVRTimer(cpu, avr.timer2Config);
const pB = new avr.AVRIOPort(cpu, avr.portBConfig), pC = new avr.AVRIOPort(cpu, avr.portCConfig), pD = new avr.AVRIOPort(cpu, avr.portDConfig);
const usart = new avr.AVRUSART(cpu, avr.usart0Config, 16e6);
const adc = new avr.AVRADC(cpu, avr.adcConfig);
let serial = '', linhas = [];
usart.onByteTransmit = (b) => {
  serial += String.fromCharCode(b);
  if (b === 10) { linhas.push([+(cpu.cycles / 16e6).toFixed(3), serial.trim()]); serial = ''; }
};
const porta = (p) => (p < 8 ? [pD, p] : p < 14 ? [pB, p - 8] : [pC, p - 14]);
const ler = (p) => { const [pt, b] = porta(p); return pt.pinState(b) === avr.PinState.High ? 1 : 0; };
const setar = (p, v) => { const [pt, b] = porta(p); pt.setPin(b, !!v); };
const t = () => cpu.cycles / 16e6;
// distância do ultrassônico ao longo do tempo (cm); null = sem eco
const distancia = () => (t() < 2.0 ? null : t() < 2.6 ? 10 : t() < 3.2 ? 30 : 200);
let trig = false;
pD.addListener(() => {
  const v = ler(6);
  if (trig && !v) {
    const d = distancia();
    if (d !== null) {
      const larg = d * 58;
      cpu.addClockEvent(() => { setar(7, 1); cpu.addClockEvent(() => setar(7, 0), larg * 16); }, 200 * 16);
    }
  }
  trig = !!v;
});
const ledLog = [];
const bordas = [];   // subidas do pino 9 (buzzer)
let buzAntes = 0;
let ledAntes = 0;
const FIM = 4.2 * 16e6;
let prox = 0;
while (cpu.cycles < FIM) {
  avr.avrInstruction(cpu); cpu.tick();
  if (cpu.cycles >= prox) {
    const s = t();
    // botão 1 (pino 2): curto 0.3–0.5 s, longo 0.8–1.8 s
    setar(2, !((s > 0.3 && s < 0.5) || (s > 0.8 && s < 1.8)));
    // botão 2 (pino 3): 1.0–1.3 s
    setar(3, !(s > 1.0 && s < 1.3));
    // pot: 0 V até 3.4 s, depois 5 V (e ruído pequeno)
    adc.channelValues[0] = s < 3.4 ? 0.01 * (Math.random()) : 4.98 + 0.01 * Math.random();
    const bz = ler(9);
    if (bz && !buzAntes) bordas.push(s);
    buzAntes = bz;
    const led = ler(13);
    if (led !== ledAntes) { ledLog.push([+s.toFixed(3), led]); ledAntes = led; }
    prox += 16 * 100;
  }
}
console.log('Serial:'); linhas.forEach(([tt, l]) => console.log('  ', tt.toFixed(3), l));
console.log('LED 13:', JSON.stringify(ledLog));
const ev = linhas.map((x) => x[1].replace(/^JOYSTICK PRONTO [0-9a-f]{8}$/, 'JOYSTICK PRONTO'));
console.log('id:', g.id, linhas[0][1].endsWith(g.id) ? '(confere)' : '(DIFERENTE)');
// ações: A1 botão1 curto, A2 botão1 longo, A3 botão2, A4/A5 ultrassônico, A6/A7 potenciômetro
const confere = (seq) => { let i = 0; for (const e of ev) if (e === seq[i]) i++; return i === seq.length; };
const ok = confere(['JOYSTICK PRONTO', 'A6_DOWN', 'A1_DOWN', 'A1_UP', 'A3_DOWN', 'A3_UP', 'A2_DOWN', 'A2_UP',
  'A4_DOWN', 'A4_UP', 'A5_DOWN', 'A5_UP', 'A6_UP', 'A7_DOWN'])
  && ev.length === 14
  && JSON.stringify(ledLog.map((x) => x[1])) === '[1,0]'
  && ledLog[0][0] > 1.0 && ledLog[0][0] < 1.1 && ledLog[1][0] > 1.3 && ledLog[1][0] < 1.5;
// frequência média do buzzer em cada trecho
const hz = (a, b) => Math.round(bordas.filter((x) => x >= a && x < b).length / (b - a));
const tiro = hz(0.525, 0.6), parado = hz(0.7, 0.95), motor = hz(1.1, 1.28), nitro = hz(1.45, 1.75), depois = hz(2.2, 2.5);
console.log('buzzer Hz — tiro:', tiro, 'parado:', parado, 'motor:', motor, 'nitro:', nitro, 'depois:', depois);
const okBuz = tiro > 600 && tiro < 2100 && parado === 0 && motor > 45 && motor < 110 && nitro > 1000 && nitro < 3200 && depois === 0;
console.log(okBuz ? 'BUZZER OK' : 'BUZZER COM DIFERENÇAS');
console.log(ok && okBuz ? 'SIMULAÇÃO OK' : 'SIMULAÇÃO COM DIFERENÇAS');
process.exit(ok && okBuz ? 0 : 1);
