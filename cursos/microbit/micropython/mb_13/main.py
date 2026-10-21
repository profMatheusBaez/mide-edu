from microbit import *

while True:
    if display.read_light_level() < 50:
        display.show(Image.ASLEEP)
    else:
        display.show(Image.HAPPY)
    sleep(300)
