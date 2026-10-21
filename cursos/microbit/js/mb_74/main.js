music.setBuiltInSpeakerEnabled(false)
input.onButtonPressed(Button.A, function () {
    music.playTone(Note.C, music.beat(BeatFraction.Quarter))
})
input.onButtonPressed(Button.B, function () {
    music.playTone(Note.E, music.beat(BeatFraction.Quarter))
})
input.onButtonPressed(Button.AB, function () {
    music.playTone(Note.G, music.beat(BeatFraction.Quarter))
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    music.stopAllSounds()
})
