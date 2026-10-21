let limite = 0
let distancia = 0
music.setBuiltInSpeakerEnabled(false)
limite = 20
distancia = 0
basic.forever(function () {
    limite = pins.map(pins.analogReadPin(AnalogPin.P2), 0, 1023, 5, 50)
    distancia = sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1)
    if (distancia > 0 && distancia < limite) {
        music.playTone(880, music.beat(BeatFraction.Eighth))
    }
    basic.pause(100)
})
