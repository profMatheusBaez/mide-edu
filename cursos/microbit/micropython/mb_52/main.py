from microbit import *

display.off()

while True:
    pin13.write_digital(1)
    sleep(1000)
    pin13.write_digital(0)
    sleep(1000)
