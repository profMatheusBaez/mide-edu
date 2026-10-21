let x = 0
let fx = 0
let fy = 0
let pontos = 0
x = 2
fx = randint(0, 4)
fy = 0
pontos = 0
input.onButtonPressed(Button.A, function () {
    if (x > 0) {
        x += -1
    }
})
input.onButtonPressed(Button.B, function () {
    if (x < 4) {
        x += 1
    }
})
basic.forever(function () {
    basic.clearScreen()
    led.plot(x, 4)
    led.plot(fx, fy)
    basic.pause(300)
    fy += 1
    if (fy > 4) {
        if (fx == x) {
            basic.showIcon(IconNames.Skull)
            basic.pause(1500)
            basic.showNumber(pontos)
            pontos = 0
        } else {
            pontos += 1
        }
        fy = 0
        fx = randint(0, 4)
    }
})
