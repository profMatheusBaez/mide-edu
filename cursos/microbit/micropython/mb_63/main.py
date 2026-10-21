from microbit import *

display.off()

while True:
    pin14.write_analog(pin2.read_analog())
    sleep(20)
