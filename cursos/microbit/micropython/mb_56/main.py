from microbit import *

pin8.set_pull(pin8.PULL_UP)

while True:
    if pin8.read_digital() == 0:
        display.show(Image.HAPPY)
    else:
        display.clear()
    sleep(20)
