basic.forever(function () {
    pins.servoWritePin(AnalogPin.P1, 0)
    basic.pause(1000)
    pins.servoWritePin(AnalogPin.P1, 90)
    basic.pause(1000)
    pins.servoWritePin(AnalogPin.P1, 180)
    basic.pause(1000)
})
