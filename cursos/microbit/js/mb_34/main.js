let palmas = 0
palmas = 0
input.onSound(DetectedSound.Loud, function () {
    palmas += 1
    basic.showNumber(palmas)
    basic.pause(300)
})
input.onButtonPressed(Button.A, function () {
    palmas = 0
    basic.showNumber(palmas)
})
