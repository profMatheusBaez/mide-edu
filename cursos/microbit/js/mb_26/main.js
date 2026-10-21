input.calibrateCompass()
basic.forever(function () {
    basic.showNumber(input.compassHeading())
    basic.pause(500)
})
