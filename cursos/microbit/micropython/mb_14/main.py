from microbit import *

while True:
    print("luz:", display.read_light_level())
    sleep(200)
