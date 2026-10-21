let coluna = 0
coluna = 2
basic.forever(function () {
    coluna = Math.constrain(pins.map(input.acceleration(Dimension.X), -1000, 1000, 0, 4), 0, 4)
    basic.clearScreen()
    led.plot(coluna, 2)
    basic.pause(50)
})
