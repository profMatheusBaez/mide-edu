let inicio = 0
let reacao = 0
input.onButtonPressed(Button.A, function () {
    basic.clearScreen()
    basic.pause(randint(2000, 5000))
    basic.showIcon(IconNames.Square)
    inicio = input.runningTime()
    while (!input.buttonIsPressed(Button.B)) {
        basic.pause(1)
    }
    reacao = input.runningTime() - inicio
    basic.showNumber(reacao)
})
