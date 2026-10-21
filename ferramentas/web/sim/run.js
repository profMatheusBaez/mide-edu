// Simula um .hex do Uno no avr8js com entradas fixas e registra pinos, Serial e I2C.
const avr = require('avr8js');
const fs = require('fs');

function hexParaImagem(texto, img) {
  img = img || new Uint8Array(32768).fill(0xFF);
  let base = 0;
  for (const linha of texto.split(/\r?\n/)) {
    if (!linha.startsWith(':')) continue;
    const n = parseInt(linha.substr(1, 2), 16), end = parseInt(linha.substr(3, 4), 16), tipo = parseInt(linha.substr(7, 2), 16);
    if (tipo === 0) for (let i = 0; i < n; i++) img[base + end + i] = parseInt(linha.substr(9 + i * 2, 2), 16);
    else if (tipo === 2) base = parseInt(linha.substr(9, 4), 16) * 16;
    else if (tipo === 4) base = parseInt(linha.substr(9, 4), 16) << 16;
  }
  return img;
}

function simular(img, segundos = 2, cenario = {}) {
  const prog = new Uint16Array(img.buffer.slice(0));
  const cpu = new avr.CPU(prog);
  const t0 = new avr.AVRTimer(cpu, avr.timer0Config);
  const t1 = new avr.AVRTimer(cpu, avr.timer1Config);
  const t2 = new avr.AVRTimer(cpu, avr.timer2Config);
  const pB = new avr.AVRIOPort(cpu, avr.portBConfig);
  const pC = new avr.AVRIOPort(cpu, avr.portCConfig);
  const pD = new avr.AVRIOPort(cpu, avr.portDConfig);
  const usart = new avr.AVRUSART(cpu, avr.usart0Config, 16e6);
  const adc = new avr.AVRADC(cpu, avr.adcConfig);
  const twi = new avr.AVRTWI(cpu, avr.twiConfig, 16e6);
  let serial = '';
  usart.onByteTransmit = (b) => { serial += String.fromCharCode(b); };
  const i2c = [];
  twi.eventHandler = {
    start() { twi.completeStart(); },
    stop() { twi.completeStop(); },
    connectToSlave(addr, write) { i2c.push('A' + addr.toString(16)); twi.completeConnect(addr === 0x27); },
    writeByte(v) { i2c.push(v); twi.completeWrite(true); },
    readByte() { twi.completeRead(0xFF); },
  };
  const pinoPorta = (p) => (p < 8 ? [pD, p] : p < 14 ? [pB, p - 8] : [pC, p - 14]);
  const ler = (p) => { const [port, b] = pinoPorta(p); return port.pinState(b) === avr.PinState.High ? 1 : 0; };
  const setar = (p, v) => { const [port, b] = pinoPorta(p); port.setPin(b, !!v); };
  // entradas
  const us = (t) => 300 + Math.floor((t * 1e6) % 2000000 / 2000000 * 2500);   // eco de 300 a 2800 us
  let trigAlto = false;
  pD.addListener(() => {
    const v = ler(6);
    if (trigAlto && !v) {
      const larg = us(cpu.cycles / 16e6);
      cpu.addClockEvent(() => { setar(7, 1); cpu.addClockEvent(() => setar(7, 0), larg * 16); }, 200 * 16);
    }
    trigAlto = !!v;
  });
  const fim = Math.floor(segundos * 16e6);
  const passo = 16 * 50;   // amostra a cada 50 us
  let prox = 0;
  const amostras = [];
  setar(2, 1); setar(3, 1);
  while (cpu.cycles < fim) {
    avr.avrInstruction(cpu);
    cpu.tick();
    if (cpu.cycles >= prox) {
      const t = cpu.cycles / 16e6;
      // botão no pino 2: pressionado (LOW) de 0,5 a 0,9 s e de 1,4 a 1,6 s; pino 3 o contrário
      const apertado = (t > 0.5 && t < 0.9) || (t > 1.4 && t < 1.6);
      setar(2, cenario.botaoAlto ? (apertado ? 1 : 0) : (apertado ? 0 : 1));
      setar(3, apertado ? 1 : 0);
      adc.channelValues[0] = 5 * ((t * 0.6) % 1);   // A0 sobe de 0 a 5 V
      let estado = 0;
      for (let p = 2; p <= 19; p++) estado |= ler(p) << p;
      amostras.push(estado);
      prox += passo;
    }
  }
  return { serial, amostras, i2c };
}

function montarVM(fwHex, bytes) {
  const img = hexParaImagem(fwHex);
  img.set(bytes, 0x4000);
  return img;
}

module.exports = { hexParaImagem, simular, montarVM };
