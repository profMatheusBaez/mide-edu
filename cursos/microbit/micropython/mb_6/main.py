from microbit import *

while True:
    if button_a.was_pressed():
        display.show(Image.HAPPY)
        sleep(1000)
        display.clear()
