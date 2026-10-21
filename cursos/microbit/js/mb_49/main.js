let x = 0
let fx = 0
let fy = 0
let pontos = 0
x = 2
fx = randint(0, 4)
fy = 0
pontos = 0
input.onButtonPressed(Button.A, function () {
    basic.showNumber(pontos)
})
basic.forever(function () {
    x = Math.constrain(pins.map(input.acceleration(Dimension.X), -1000, 1000, 0, 4), 0, 4)
    basic.clearScreen()
    led.plot(x, 4)
    led.plot(fx, fy)
    basic.pause(250)
    fy += 1
    if (fy > 4) {
        if (fx == x) {
            pontos += 1
        }
        fy = 0
        fx = randint(0, 4)
    }
})
