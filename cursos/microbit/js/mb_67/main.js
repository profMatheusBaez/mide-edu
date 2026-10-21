basic.forever(function () {
    serial.writeValue("dist", sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1))
    basic.pause(200)
})
