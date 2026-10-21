from microbit import *

while True:
    if microphone.was_event(SoundEvent.LOUD):
        display.show(Image.HAPPY)
        sleep(1000)
        display.clear()
