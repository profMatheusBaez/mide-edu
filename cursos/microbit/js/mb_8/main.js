let contagem = 0
contagem = 0
input.onButtonPressed(Button.A, function () {
    contagem += 1
    basic.showNumber(contagem)
})
input.onButtonPressed(Button.B, function () {
    contagem += -1
    basic.showNumber(contagem)
})
input.onButtonPressed(Button.AB, function () {
    contagem = 0
    basic.showNumber(contagem)
})
