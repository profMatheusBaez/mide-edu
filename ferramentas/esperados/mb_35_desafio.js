basic.forever(function () {
    if (input.soundLevel() > 120) {
        basic.showIcon(IconNames.Angry)
        music.playTone(880, music.beat(BeatFraction.Eighth))
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(200)
})
