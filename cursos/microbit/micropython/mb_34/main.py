from microbit import *

palmas = 0

while True:
    if microphone.was_event(SoundEvent.LOUD):
        palmas += 1
        display.scroll(palmas)
        sleep(300)
    if button_a.was_pressed():
        palmas = 0
        display.scroll(palmas)
