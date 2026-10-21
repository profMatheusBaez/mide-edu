input.calibrateCompass()
basic.forever(function () {
    if (input.compassHeading() > 350 || input.compassHeading() < 10) {
        basic.showIcon(IconNames.Heart)
        music.playTone(Note.C5, music.beat(BeatFraction.Eighth))
    } else {
        basic.clearScreen()
    }
    basic.pause(100)
})
