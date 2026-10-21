from microbit import *

while True:
    if button_a.was_pressed():
        display.scroll(1)
    if button_b.was_pressed():
        display.scroll(2)
    if (button_a.is_pressed() and button_b.is_pressed()):
        display.show(Image.HEART)
    sleep(20)
