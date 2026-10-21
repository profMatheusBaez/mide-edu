let maxima = 0
let minima = 0
maxima = 0
minima = 100
basic.forever(function () {
    if (input.temperature() > maxima) {
        maxima = input.temperature()
    }
    if (input.temperature() < minima) {
        minima = input.temperature()
    }
    basic.pause(500)
})
input.onButtonPressed(Button.A, function () {
    basic.showNumber(maxima)
})
input.onButtonPressed(Button.B, function () {
    basic.showNumber(minima)
})
