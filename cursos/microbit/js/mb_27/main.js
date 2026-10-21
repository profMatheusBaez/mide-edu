input.calibrateCompass()
basic.forever(function () {
    if (input.compassHeading() > 315 || input.compassHeading() < 45) {
        basic.showString("N")
    } else if (input.compassHeading() < 135) {
        basic.showString("L")
    } else if (input.compassHeading() < 225) {
        basic.showString("S")
    } else {
        basic.showString("O")
    }
    basic.pause(500)
})
