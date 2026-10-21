from microbit import *

while True:
    if pin_logo.is_touched():
        display.show(Image.SURPRISED)
        sleep(1000)
        display.clear()
