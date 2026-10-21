led.enable(false)
basic.forever(function () {
    pins.analogWritePin(AnalogPin.P14, 100)
    basic.pause(1000)
    pins.analogWritePin(AnalogPin.P14, 500)
    basic.pause(1000)
    pins.analogWritePin(AnalogPin.P14, 1023)
    basic.pause(1000)
})
