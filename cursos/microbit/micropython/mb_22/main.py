from microbit import *

while True:
    if accelerometer.was_gesture("face up"):
        display.show(Image.HAPPY)
    if accelerometer.was_gesture("face down"):
        display.show(Image.ASLEEP)
    if accelerometer.was_gesture("left"):
        display.show(Image.ARROW_W)
    if accelerometer.was_gesture("right"):
        display.show(Image.ARROW_E)
    sleep(20)
