from microbit import *

i = 0
display.off()

while True:
    for i in range(21):
        pin13.write_analog(i * 50)
        sleep(20)
    for i in range(21):
        pin13.write_analog(1000 - i * 50)
        sleep(20)
