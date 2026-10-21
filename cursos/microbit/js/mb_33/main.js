basic.forever(function () {
    led.plotBarGraph(input.soundLevel(), 255)
    basic.pause(50)
})
