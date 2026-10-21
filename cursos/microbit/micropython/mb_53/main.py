from microbit import *

display.off()

while True:
    pin13.write_digital(0)
    pin14.write_digital(0)
    pin15.write_digital(1)
    sleep(3000)
    pin15.write_digital(0)
    pin14.write_digital(1)
    sleep(1000)
    pin14.write_digital(0)
    pin13.write_digital(1)
    sleep(3000)
