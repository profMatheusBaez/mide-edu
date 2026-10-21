basic.forever(function () {
    serial.writeValue("pot", pins.analogReadPin(AnalogPin.P2))
    basic.pause(100)
})
