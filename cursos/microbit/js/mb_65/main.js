let escolha = 0
led.enable(false)
escolha = 0
basic.forever(function () {
    escolha = Math.constrain(pins.map(pins.analogReadPin(AnalogPin.P2), 0, 1023, 0, 2), 0, 2)
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.digitalWritePin(DigitalPin.P15, 0)
    if (escolha == 0) {
        pins.digitalWritePin(DigitalPin.P13, 1)
    } else if (escolha == 1) {
        pins.digitalWritePin(DigitalPin.P14, 1)
    } else {
        pins.digitalWritePin(DigitalPin.P15, 1)
    }
    basic.pause(50)
})
