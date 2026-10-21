from microbit import *

display.off()

while True:
    pin14.write_analog(100)
    sleep(1000)
    pin14.write_analog(500)
    sleep(1000)
    pin14.write_analog(1023)
    sleep(1000)
