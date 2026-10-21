from microbit import *

compass.calibrate()

while True:
    if compass.heading() > 315 or compass.heading() < 45:
        display.scroll("N")
    elif compass.heading() < 135:
        display.scroll("L")
    elif compass.heading() < 225:
        display.scroll("S")
    else:
        display.scroll("O")
    sleep(500)
