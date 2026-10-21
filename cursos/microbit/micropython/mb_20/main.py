from microbit import *
import music

while True:
    if temperature() >= 30:
        display.show(Image.ANGRY)
        music.pitch(880, 500)
    else:
        display.show(Image.HAPPY)
    sleep(1000)
