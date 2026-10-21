let passos = 0
passos = 0
input.onGesture(Gesture.Shake, function () {
    passos += 1
    basic.showNumber(passos)
})
input.onButtonPressed(Button.A, function () {
    passos = 0
    basic.showNumber(passos)
})
