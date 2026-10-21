from microbit import *

while True:
    if button_a.was_pressed():
        audio.play(Sound.GIGGLE)
    if button_b.was_pressed():
        audio.play(Sound.HELLO)
    sleep(20)
