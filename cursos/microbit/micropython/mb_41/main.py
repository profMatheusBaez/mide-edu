from microbit import *
import radio
import random

radio.on()
radio.config(group=1)

while True:
    if button_a.was_pressed():
        radio.send(str(random.randint(1, 9)))
        display.show(Image.ARROW_E)
        sleep(500)
        display.clear()
