from microbit import *
import music

while True:
    if microphone.sound_level() > 120:
        display.show(Image.ANGRY)
        music.pitch(880, 250)
    else:
        display.show(Image.HAPPY)
    sleep(200)
