/* ============================================================
 * microbit_exemplos.js — MIDE EDU, placa BBC micro:bit V2
 * ------------------------------------------------------------
 * Seis programas prontos (Arquivo → Exemplos → Programas prontos).
 * Cada um vem em JavaScript (MakeCode) e, quando dá, em MicroPython.
 * Os que usam sprites (jogo) ou Bluetooth só existem em JavaScript.
 * O teste ferramentas/testar_mb_gen.mjs compila todos.
 * ============================================================ */
const MB_EXEMPLOS = [
  {
    id: 'bussola',
    nome: 'Bússola',
    descricao: 'Mostra N, L, S ou O conforme o lado para onde a placa aponta. O botão A calibra a bússola.',
    js: `// Bússola: o botão A calibra (incline a placa até encher a tela)
input.onButtonPressed(Button.A, function () {
    input.calibrateCompass()
})
basic.forever(function () {
    let graus = input.compassHeading()
    if (graus < 45 || graus >= 315) {
        basic.showString("N")
    } else if (graus < 135) {
        basic.showString("L")
    } else if (graus < 225) {
        basic.showString("S")
    } else {
        basic.showString("O")
    }
})
`,
    py: `from microbit import *

# Bússola: o botão A calibra (incline a placa até encher a tela)
while True:
    if button_a.was_pressed():
        compass.calibrate()
    graus = compass.heading()
    if graus < 45 or graus >= 315:
        display.show("N")
    elif graus < 135:
        display.show("L")
    elif graus < 225:
        display.show("S")
    else:
        display.show("O")
    sleep(200)
`,
  },
  {
    id: 'nivel',
    nome: 'Nível de bolha',
    descricao: 'Um ponto de luz mostra para que lado a placa está inclinada, como a bolha de um nível.',
    js: `// Nível de bolha: o ponto anda para o lado que a placa inclina
basic.forever(function () {
    let coluna = Math.constrain(pins.map(input.acceleration(Dimension.X), -1000, 1000, 0, 4), 0, 4)
    let linha = Math.constrain(pins.map(input.acceleration(Dimension.Y), -1000, 1000, 0, 4), 0, 4)
    led.stopAnimation()
    basic.clearScreen()
    led.plot(coluna, linha)
    basic.pause(50)
})
`,
    py: `from microbit import *

# Nível de bolha: o ponto anda para o lado que a placa inclina
def para_led(valor):
    posicao = (valor + 1000) * 4 // 2000
    return max(0, min(4, posicao))

while True:
    coluna = para_led(accelerometer.get_x())
    linha = para_led(accelerometer.get_y())
    display.clear()
    display.set_pixel(coluna, linha, 9)
    sleep(50)
`,
  },
  {
    id: 'ppt',
    nome: 'Pedra, papel e tesoura',
    descricao: 'Sacuda a placa: ela sorteia pedra, papel ou tesoura e mostra o desenho.',
    js: `// Pedra, papel e tesoura: sacuda a placa para jogar
input.onGesture(Gesture.Shake, function () {
    let sorteio = randint(0, 2)
    if (sorteio == 0) {
        basic.showIcon(IconNames.SmallDiamond)
    } else if (sorteio == 1) {
        basic.showIcon(IconNames.Square)
    } else {
        basic.showIcon(IconNames.Scissors)
    }
})
`,
    py: `from microbit import *
import random

# Pedra, papel e tesoura: sacuda a placa para jogar
while True:
    if accelerometer.was_gesture("shake"):
        sorteio = random.randint(0, 2)
        if sorteio == 0:
            display.show(Image.DIAMOND_SMALL)
        elif sorteio == 1:
            display.show(Image.SQUARE)
        else:
            display.show(Image.SCISSORS)
    sleep(50)
`,
  },
  {
    id: 'nave',
    nome: 'Nave desviando de pedras',
    descricao: 'Jogo: A e B movem a nave para os lados e você desvia da pedra que cai. Só em JavaScript.',
    js: `// Nave: desvie das pedras que caem
let nave = game.createSprite(2, 4)
let pedra = game.createSprite(randint(0, 4), 0)
input.onButtonPressed(Button.A, function () {
    nave.change(LedSpriteProperty.X, -1)
})
input.onButtonPressed(Button.B, function () {
    nave.change(LedSpriteProperty.X, 1)
})
basic.forever(function () {
    basic.pause(400)
    pedra.change(LedSpriteProperty.Y, 1)
    if (pedra.isTouching(nave)) {
        game.gameOver()
    }
    if (pedra.get(LedSpriteProperty.Y) == 4) {
        game.addScore(1)
        pedra.set(LedSpriteProperty.X, randint(0, 4))
        pedra.set(LedSpriteProperty.Y, 0)
    }
})
`,
    py: null,
  },
  {
    id: 'termometro',
    nome: 'Termômetro remoto',
    descricao: 'Com duas micro:bits: aperte A em uma para mandar a temperatura por rádio; a outra mostra o número.',
    js: `// Termômetro remoto: use duas micro:bits, as duas com este programa
radio.setGroup(1)
input.onButtonPressed(Button.A, function () {
    radio.sendNumber(input.temperature())
    basic.showIcon(IconNames.Yes)
})
radio.onReceivedNumber(function (receivedNumber) {
    basic.showNumber(receivedNumber)
})
`,
    py: `from microbit import *
import radio

# Termômetro remoto: use duas micro:bits, as duas com este programa
radio.on()
radio.config(group=1)
while True:
    if button_a.was_pressed():
        radio.send(str(temperature()))
        display.show(Image.YES)
    mensagem = radio.receive()
    if mensagem:
        display.scroll(mensagem)
    sleep(50)
`,
  },
  {
    id: 'painel-ble',
    nome: 'Painel ao vivo por Bluetooth',
    descricao: 'Liga os serviços Bluetooth: o Painel ao vivo da IDE mostra inclinação, botões, bússola e temperatura sem cabo. Só em JavaScript.',
    js: `// Painel ao vivo por Bluetooth: grave por USB e depois conecte por Bluetooth
bluetooth.startUartService()
bluetooth.startAccelerometerService()
bluetooth.startButtonService()
bluetooth.startMagnetometerService()
bluetooth.startTemperatureService()
bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.No)
})
basic.showIcon(IconNames.Heart)
basic.forever(function () {
    bluetooth.uartWriteValue("temp", input.temperature())
    basic.pause(1000)
})
`,
    py: null,
  },
];
