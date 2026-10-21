let i = 0
pins.servoWritePin(AnalogPin.P1, 0)
input.onButtonPressed(Button.A, function () {
    for (let i = 0; i <= 90; i++) {
        pins.servoWritePin(AnalogPin.P1, i)
        basic.pause(10)
    }
    basic.showIcon(IconNames.Heart)
    basic.pause(3000)
    basic.clearScreen()
    for (let i = 0; i <= 90; i++) {
        pins.servoWritePin(AnalogPin.P1, 90 - i)
        basic.pause(10)
    }
})
