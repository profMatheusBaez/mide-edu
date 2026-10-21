from microbit import *

while True:
    if temperature() < 20:
        display.show(Image.SAD)
    elif temperature() < 28:
        display.show(Image.HAPPY)
    else:
        display.show(Image.ANGRY)
    sleep(1000)
