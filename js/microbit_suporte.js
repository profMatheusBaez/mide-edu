/* ============================================================
 * microbit_suporte.js — placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Pequenos arquivos auxiliares que o programa leva junto quando usa
 * um componente externo (código original deste projeto, sem
 * dependências):
 *
 *   lcd1602   LCD 16x2 com adaptador I2C (PCF8574), pinos P19/P20
 *   sonar     sensor ultrassônico HC-SR04 (trig/eco)
 *   sete_seg  display de 7 segmentos (cátodo comum), 8 pinos
 *
 * Existem em duas versões — TypeScript (para o MakeCode, vira um
 * arquivo do projeto) e Python (gravado no sistema de arquivos da
 * micro:bit junto do main.py). Os pinos do display de 7 segmentos
 * vêm da tabela MB_PINOS (microbit_curso.js).
 *
 * Em JavaScript o aluno escreve, por exemplo, lcd1602.escrever("Oi", 0, 0);
 * em Python, `import lcd1602` e lcd1602.escrever("Oi", 0, 0).
 * ============================================================ */
'use strict';

const _P = (n) => 'DigitalPin.P' + n;

const MB_SUPORTE = {
  lcd1602: {
    js: () =>
`namespace lcd1602 {
    let endereco = ${(typeof MB_PINOS !== 'undefined' && MB_PINOS.lcd.endereco) || 39}
    function enviar(valor: number) {
        pins.i2cWriteNumber(endereco, valor, NumberFormat.UInt8BE)
    }
    function nibble(valor: number, rs: number) {
        const b = (valor & 0xF0) | 0x08 | rs
        enviar(b)
        enviar(b | 0x04)
        control.waitMicros(50)
        enviar(b & 0xFB)
        control.waitMicros(50)
    }
    function comando(valor: number) {
        nibble(valor & 0xF0, 0)
        nibble((valor << 4) & 0xF0, 0)
    }
    function caractere(valor: number) {
        nibble(valor & 0xF0, 1)
        nibble((valor << 4) & 0xF0, 1)
    }
    export function iniciar(novoEndereco: number = 0) {
        if (novoEndereco > 0) endereco = novoEndereco
        basic.pause(50)
        nibble(0x30, 0)
        basic.pause(5)
        nibble(0x30, 0)
        control.waitMicros(150)
        nibble(0x30, 0)
        nibble(0x20, 0)
        comando(0x28)
        comando(0x0C)
        comando(0x06)
        comando(0x01)
        basic.pause(2)
    }
    export function limpar() {
        comando(0x01)
        basic.pause(2)
    }
    export function escrever(texto: string, linha: number, coluna: number) {
        comando((linha == 0 ? 0x80 : 0xC0) + coluna)
        for (let i = 0; i < texto.length; i++) {
            caractere(texto.charCodeAt(i))
        }
    }
}
`,
    py: () =>
`from microbit import i2c, sleep
import utime

_endereco = ${(typeof MB_PINOS !== 'undefined' && MB_PINOS.lcd.endereco) || 39}


def _enviar(valor):
    i2c.write(_endereco, bytes([valor]))


def _nibble(valor, rs):
    b = (valor & 0xF0) | 0x08 | rs
    _enviar(b)
    _enviar(b | 0x04)
    utime.sleep_us(50)
    _enviar(b & 0xFB)
    utime.sleep_us(50)


def _comando(valor):
    _nibble(valor & 0xF0, 0)
    _nibble((valor << 4) & 0xF0, 0)


def _caractere(valor):
    _nibble(valor & 0xF0, 1)
    _nibble((valor << 4) & 0xF0, 1)


def iniciar(novo_endereco=0):
    global _endereco
    if novo_endereco > 0:
        _endereco = novo_endereco
    sleep(50)
    _nibble(0x30, 0)
    sleep(5)
    _nibble(0x30, 0)
    utime.sleep_us(150)
    _nibble(0x30, 0)
    _nibble(0x20, 0)
    _comando(0x28)
    _comando(0x0C)
    _comando(0x06)
    _comando(0x01)
    sleep(2)


def limpar():
    _comando(0x01)
    sleep(2)


def escrever(texto, linha, coluna):
    _comando((0x80 if linha == 0 else 0xC0) + coluna)
    for letra in texto:
        _caractere(ord(letra))
`,
  },

  sonar: {
    js: () =>
`namespace sonar {
    export function distanciaCm(trig: DigitalPin, eco: DigitalPin): number {
        pins.digitalWritePin(trig, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trig, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trig, 0)
        const pulso = pins.pulseIn(eco, PulseValue.High, 25000)
        if (pulso <= 0) {
            return -1
        }
        return Math.idiv(pulso, 58)
    }
}
`,
    py: () =>
`from microbit import sleep
from machine import time_pulse_us
import utime


def distancia_cm(trig, eco):
    trig.write_digital(0)
    utime.sleep_us(2)
    trig.write_digital(1)
    utime.sleep_us(10)
    trig.write_digital(0)
    pulso = time_pulse_us(eco, 1, 25000)
    if pulso <= 0:
        return -1
    return pulso // 58
`,
  },

  sete_seg: {
    js: () => {
      const s = (typeof MB_PINOS !== 'undefined' && MB_PINOS.seteSeg) || { a: 3, b: 4, c: 6, d: 7, e: 10, f: 13, g: 14, dp: 15 };
      return `namespace sete_seg {
    const pinos = [${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((k) => _P(s[k])).join(', ')}]
    const digitos = [
        [1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 1],
        [1, 1, 1, 1, 0, 0, 1],
        [0, 1, 1, 0, 0, 1, 1],
        [1, 0, 1, 1, 0, 1, 1],
        [1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1]
    ]
    export function mostrar(n: number) {
        const d = digitos[Math.constrain(n, 0, 9)]
        for (let i = 0; i < 7; i++) {
            pins.digitalWritePin(pinos[i], d[i])
        }
        pins.digitalWritePin(pinos[7], 0)
    }
    export function apagar() {
        for (let i = 0; i < 8; i++) {
            pins.digitalWritePin(pinos[i], 0)
        }
    }
}
`;
    },
    py: () => {
      const s = (typeof MB_PINOS !== 'undefined' && MB_PINOS.seteSeg) || { a: 3, b: 4, c: 6, d: 7, e: 10, f: 13, g: 14, dp: 15 };
      return `from microbit import pin3, pin4, pin6, pin7, pin10, pin13, pin14, pin15

_pinos = [${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((k) => 'pin' + s[k]).join(', ')}]
_digitos = [
    [1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1],
]


def mostrar(n):
    d = _digitos[max(0, min(9, n))]
    for i in range(7):
        _pinos[i].write_digital(d[i])
    _pinos[7].write_digital(0)


def apagar():
    for p in _pinos:
        p.write_digital(0)
`;
    },
  },
};

/* Quais arquivos auxiliares um programa usa. */
function mbSuportesUsadosJS(codigo) {
  return Object.keys(MB_SUPORTE).filter((n) => new RegExp('\\b' + n + '\\.').test(codigo));
}
function mbSuportesUsadosPy(codigo) {
  return Object.keys(MB_SUPORTE).filter((n) => new RegExp('^(?:import ' + n + '|from ' + n + ' import)', 'm').test(codigo));
}

/* Arquivos extras do projeto MakeCode: { 'lcd1602.ts': '...' } */
function mbArquivosExtrasJS(codigo) {
  const extras = {};
  for (const n of mbSuportesUsadosJS(codigo)) extras[n + '.ts'] = MB_SUPORTE[n].js();
  return extras;
}
/* Arquivos gravados na micro:bit junto do main.py: { 'lcd1602.py': '...' } */
function mbArquivosExtrasPy(codigo) {
  const extras = {};
  for (const n of mbSuportesUsadosPy(codigo)) extras[n + '.py'] = MB_SUPORTE[n].py();
  return extras;
}
