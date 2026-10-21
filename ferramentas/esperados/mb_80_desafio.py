from microbit import *

i = 0
pin1.set_analog_period(20)
pin1.write_analog(int(26 + (0) * 102 / 180))

while True:
    if button_a.was_pressed():
        for i in range(91):
            pin1.write_analog(int(26 + (i) * 102 / 180))
            sleep(10)
        display.show(Image.HEART)
        sleep(3000)
        display.clear()
        for i in range(91):
            pin1.write_analog(int(26 + (90 - i) * 102 / 180))
            sleep(10)
