let minha = 0
let dele = 0
let vitorias = 0
let resultado = 0
radio.setGroup(7)
minha = 0
dele = 0
vitorias = 0
input.onGesture(Gesture.Shake, function () {
    minha = randint(1, 3)
    radio.sendNumber(minha)
    if (minha == 1) {
        basic.showIcon(IconNames.Diamond)
    } else if (minha == 2) {
        basic.showIcon(IconNames.Square)
    } else {
        basic.showIcon(IconNames.Scissors)
    }
})
radio.onReceivedNumber(function (receivedNumber) {
    dele = receivedNumber
    basic.pause(1500)
    resultado = ((minha - dele) + 3) % 3
    if (resultado == 0) {
        basic.showString("=")
    } else if (resultado == 1) {
        vitorias += 1
        basic.showIcon(IconNames.Happy)
    } else {
        basic.showIcon(IconNames.Sad)
    }
})
input.onButtonPressed(Button.A, function () {
    basic.showNumber(vitorias)
})
