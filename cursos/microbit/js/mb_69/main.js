basic.forever(function () {
    led.plotBarGraph(sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1), 50)
    basic.pause(100)
})
