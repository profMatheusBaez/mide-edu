led.enable(false)
basic.forever(function () {
    pins.digitalWritePin(DigitalPin.P13, 1)
    basic.pause(1000)
    pins.digitalWritePin(DigitalPin.P13, 0)
    basic.pause(1000)
})
