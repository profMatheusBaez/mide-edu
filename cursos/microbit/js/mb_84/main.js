let numero = 0
led.enable(false)
numero = 0
sete_seg.mostrar(0)
input.onButtonPressed(Button.A, function () {
    numero += 1
    if (numero > 9) {
        numero = 0
    }
    sete_seg.mostrar(numero)
})
input.onButtonPressed(Button.B, function () {
    numero = 0
    sete_seg.mostrar(0)
})
