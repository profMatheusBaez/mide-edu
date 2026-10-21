let escolha = 0
escolha = 0
input.onGesture(Gesture.Shake, function () {
    escolha = randint(1, 3)
    if (escolha == 1) {
        basic.showIcon(IconNames.Diamond)
    } else if (escolha == 2) {
        basic.showIcon(IconNames.Square)
    } else {
        basic.showIcon(IconNames.Scissors)
    }
})
