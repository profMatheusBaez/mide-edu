let ligado = 0
led.enable(false)
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
ligado = 0
basic.forever(function () {
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        ligado = 1 - ligado
        pins.digitalWritePin(DigitalPin.P13, ligado)
        while (pins.digitalReadPin(DigitalPin.P8) == 0) {
            basic.pause(10)
        }
    }
})
