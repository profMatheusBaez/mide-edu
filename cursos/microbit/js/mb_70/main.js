let distancia = 0
music.setBuiltInSpeakerEnabled(false)
distancia = 0
basic.forever(function () {
    distancia = sonar.distanciaCm(DigitalPin.P16, DigitalPin.P1)
    if (distancia > 0 && distancia < 30) {
        music.playTone(880, music.beat(BeatFraction.Sixteenth))
        basic.pause(distancia * 10)
    }
    basic.pause(50)
})
