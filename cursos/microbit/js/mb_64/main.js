basic.forever(function () {
    led.plotBarGraph(pins.analogReadPin(AnalogPin.P2), 1023)
    basic.pause(50)
})
