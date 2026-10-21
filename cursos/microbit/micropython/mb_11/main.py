from microbit import *

while True:
    display.scroll(display.read_light_level())
    sleep(500)
