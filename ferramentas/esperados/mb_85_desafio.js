let dado = 0
led.enable(false)
sete_seg.apagar()
input.onGesture(Gesture.Shake, function () {
    dado = randint(1, 6)
    sete_seg.mostrar(dado)
})
