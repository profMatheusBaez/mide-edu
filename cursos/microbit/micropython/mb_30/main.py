from microbit import *
import music

compass.calibrate()

while True:
    if compass.heading() > 350 or compass.heading() < 10:
        display.show(Image.HEART)
        music.pitch(523, 250)
    else:
        display.clear()
    sleep(100)
