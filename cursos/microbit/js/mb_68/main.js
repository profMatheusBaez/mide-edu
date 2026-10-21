let distancia = 0
distancia = 0
basic.forever(function () {
    distancia = sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1)
    if (distancia > 0 && distancia < 10) {
        basic.showIcon(IconNames.Angry)
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(100)
})
