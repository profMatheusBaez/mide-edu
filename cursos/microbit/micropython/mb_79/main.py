from microbit import *

pin1.set_analog_period(20)

while True:
    if button_a.was_pressed():
        pin1.write_analog(int(26 + (0) * 102 / 180))
    if button_b.was_pressed():
        pin1.write_analog(int(26 + (180) * 102 / 180))
    if (button_a.is_pressed() and button_b.is_pressed()):
        pin1.write_analog(int(26 + (90) * 102 / 180))
    sleep(20)
