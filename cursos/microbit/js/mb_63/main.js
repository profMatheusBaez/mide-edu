led.enable(false)
basic.forever(function () {
    pins.analogWritePin(AnalogPin.P14, pins.analogReadPin(AnalogPin.P2))
    basic.pause(20)
})
