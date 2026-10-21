input.calibrateCompass()
basic.forever(function () {
    if (input.compassHeading() > 315 || input.compassHeading() < 45) {
        basic.showArrow(ArrowNames.North)
    } else if (input.compassHeading() < 135) {
        basic.showArrow(ArrowNames.West)
    } else if (input.compassHeading() < 225) {
        basic.showArrow(ArrowNames.South)
    } else {
        basic.showArrow(ArrowNames.East)
    }
    basic.pause(300)
})
