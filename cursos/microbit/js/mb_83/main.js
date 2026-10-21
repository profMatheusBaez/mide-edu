let i = 0
led.enable(false)
basic.forever(function () {
    for (let i = 0; i <= 9; i++) {
        sete_seg.mostrar(i)
        basic.pause(1000)
    }
})
