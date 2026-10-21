pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
basic.forever(function () {
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.clearScreen()
    }
})
