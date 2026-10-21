basic.forever(function () {
    led.plotBarGraph(input.lightLevel(), 255)
    basic.pause(100)
})
