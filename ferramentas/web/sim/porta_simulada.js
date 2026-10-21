// Uma "SerialPort" da Web Serial ligada a um Arduino Uno simulado (avr8js)
// rodando o optiboot de verdade. Serve para testar a gravação da MIDE web.
const avr = require('avr8js');
const fs = require('fs');
const { hexParaImagem } = require('./run.js');

const OPTIBOOT = '/tmp/claude-0/ArduinoCore-avr/bootloaders/optiboot/optiboot_atmega328.hex';

class UnoSimulado {
  constructor() {
    const img = new Uint8Array(32768).fill(0xFF);
    hexParaImagem(fs.readFileSync(OPTIBOOT, 'utf8'), img);
    this.flash = new Uint16Array(img.buffer);
    this.saida = [];          // bytes que a placa mandou (TX)
    this.entrada = [];        // bytes para a placa (RX)
    this.aoTx = null;
    this.tempBuf = new Uint16Array(64);
    this.reiniciar(true);
    this.t0 = Date.now(); this.ciclos0 = 0;
    this.rodando = true;
    const passo = () => {
      if (!this.rodando) return;
      const alvo = this.ciclos0 + (Date.now() - this.t0) * 16000;
      let n = 0;
      while (this.cpu.cycles < alvo && n < 400000) { this.instrucao(); n++; }
      setImmediate(passo);
    };
    setImmediate(passo);
  }
  reiniciar(noBootloader) {
    const ciclos = this.cpu ? this.cpu.cycles : 0;
    this.cpu = new avr.CPU(this.flash);
    const cpu = this.cpu;
    cpu.cycles = ciclos;
    this.clock = new avr.AVRClock(cpu, 16e6, avr.clockConfig);
    new avr.AVRTimer(cpu, avr.timer0Config); new avr.AVRTimer(cpu, avr.timer1Config); new avr.AVRTimer(cpu, avr.timer2Config);
    this.pB = new avr.AVRIOPort(cpu, avr.portBConfig); new avr.AVRIOPort(cpu, avr.portCConfig); new avr.AVRIOPort(cpu, avr.portDConfig);
    this.usart = new avr.AVRUSART(cpu, avr.usart0Config, 16e6);
    this.usart.onByteTransmit = (b) => { this.saida.push(b); if (this.aoTx) this.aoTx(b); };
    this.wdt = new avr.AVRWatchdog(cpu, avr.watchdogConfig, this.clock);
    const resetOriginal = cpu.reset.bind(cpu);
    cpu.reset = () => { resetOriginal(); this.resets = (this.resets || 0) + 1; cpu.pc = 0x7E00 >> 1; cpu.data[0x54] = 0x08; };   // watchdog: passa pelo bootloader (WDRF), que desliga o watchdog e pula para a aplicação
    if (noBootloader) { cpu.pc = 0x7E00 >> 1; cpu.data[0x54] = 0x02; }   // BOOTRST + EXTRF (reset pelo botão/DTR)
    this.entrada.length = 0;
  }
  instrucao() {
    const cpu = this.cpu;
    if (cpu.progMem[cpu.pc] === 0x95E8) { this.spm(); cpu.pc++; cpu.cycles += 2; cpu.tick(); return; }
    avr.avrInstruction(cpu);
    cpu.tick();
    if (this.entrada.length && this.usart.writeByte(this.entrada[0])) this.entrada.shift();
  }
  spm() {
    const cpu = this.cpu, csr = cpu.data[0x57];
    const z = cpu.data[30] | (cpu.data[31] << 8);
    const pagina = (z & ~0x7F) >> 1;
    if ((csr & 0x1F) === 0x01) this.tempBuf[(z & 0x7F) >> 1] = cpu.data[0] | (cpu.data[1] << 8);
    else if ((csr & 0x1F) === 0x03) { for (let i = 0; i < 64; i++) this.flash[pagina + i] = 0xFFFF; }
    else if ((csr & 0x1F) === 0x05) { for (let i = 0; i < 64; i++) this.flash[pagina + i] = this.tempBuf[i]; this.tempBuf.fill(0xFFFF); }
    cpu.data[0x57] = csr & ~0x1F;
  }
  parar() { this.rodando = false; }
}

class PortaSimulada {
  constructor(uno) { this.uno = uno; this.readable = null; this.writable = null; this.dtr = true; }
  getInfo() { return { usbVendorId: 0x1A86, usbProductId: 0x7523 }; }
  async open({ baudRate }) {
    if (this.readable) throw new Error('já aberta');
    this.baud = baudRate;
    const uno = this.uno;
    let ctrl;
    this.readable = new ReadableStream({ start(c) { ctrl = c; } });
    uno.aoTx = (b) => { try { ctrl.enqueue(Uint8Array.of(b)); } catch (e) { } };
    this.ctrl = ctrl;
    const self = this;
    this.writable = new WritableStream({
      write(chunk) { if (self.baud === 115200 || self.baud === uno.baudApp) for (const b of chunk) uno.entrada.push(b); },
    });
    uno.reiniciar(true);    // abrir a porta liga o DTR: o Uno reinicia
  }
  async setSignals({ dataTerminalReady }) {
    if (dataTerminalReady && !this.dtr) this.uno.reiniciar(true);
    this.dtr = dataTerminalReady;
  }
  async close() {
    this.uno.aoTx = null;
    try { this.ctrl.close(); } catch (e) { }
    this.readable = null; this.writable = null;
  }
}

module.exports = { UnoSimulado, PortaSimulada };
