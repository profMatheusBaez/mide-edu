from microbit import *

pin1.set_analog_period(20)

while True:
    pin1.write_analog(int(26 + (0) * 102 / 180))
    sleep(1000)
    pin1.write_analog(int(26 + (90) * 102 / 180))
    sleep(1000)
    pin1.write_analog(int(26 + (180) * 102 / 180))
    sleep(1000)
