from microbit import *

while True:
    display.scroll(microphone.sound_level())
    sleep(200)
