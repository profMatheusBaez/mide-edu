from microbit import *

display.off()
pin8.set_pull(pin8.PULL_UP)

while True:
    if pin8.read_digital() == 0:
        pin13.write_digital(1)
    else:
        pin13.write_digital(0)
    sleep(20)
