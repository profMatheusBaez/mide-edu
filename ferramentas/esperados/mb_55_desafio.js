let i = 0
led.enable(false)
basic.forever(function () {
    for (let i = 0; i <= 20; i++) {
        pins.analogWritePin(AnalogPin.P13, i * 50)
        basic.pause(20)
    }
    for (let i = 0; i <= 20; i++) {
        pins.analogWritePin(AnalogPin.P13, 1000 - i * 50)
        basic.pause(20)
    }
})
