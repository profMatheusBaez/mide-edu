from microbit import *
import music

while True:
    if button_a.was_pressed():
        music.pitch(262, 500)
    if button_b.was_pressed():
        music.pitch(330, 500)
    if pin_logo.is_touched():
        music.pitch(392, 500)
    sleep(20)
