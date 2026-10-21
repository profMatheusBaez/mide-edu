from microbit import *

timeA = 0
timeB = 0

while True:
    if button_a.was_pressed():
        timeA += 1
        display.scroll(timeA)
    if button_b.was_pressed():
        timeB += 1
        display.scroll(timeB)
    if (button_a.is_pressed() and button_b.is_pressed()):
        display.scroll(str(timeA) + " x " + str(timeB))
    if pin_logo.is_touched():
        timeA = 0
        timeB = 0
        display.show(Image.YES)
    sleep(20)
