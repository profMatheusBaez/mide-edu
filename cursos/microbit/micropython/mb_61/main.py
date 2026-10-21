from microbit import *

while True:
    display.scroll(pin2.read_analog())
    sleep(300)
