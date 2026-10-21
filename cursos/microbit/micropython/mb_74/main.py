from microbit import *
import music

speaker.off()

while True:
    if button_a.was_pressed():
        music.pitch(262, 500)
    if button_b.was_pressed():
        music.pitch(330, 500)
    if (button_a.is_pressed() and button_b.is_pressed()):
        music.pitch(392, 500)
    if pin_logo.is_touched():
        audio.stop()
    sleep(20)
