basic.forever(function () {
    if (input.temperature() >= 30) {
        basic.showIcon(IconNames.Angry)
        music.playTone(880, music.beat(BeatFraction.Quarter))
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(1000)
})
