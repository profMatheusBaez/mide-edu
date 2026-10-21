from microbit import *

compass.calibrate()

while True:
    if compass.heading() > 315 or compass.heading() < 45:
        display.show(Image.ARROW_N)
    elif compass.heading() < 135:
        display.show(Image.ARROW_W)
    elif compass.heading() < 225:
        display.show(Image.ARROW_S)
    else:
        display.show(Image.ARROW_E)
    sleep(300)
