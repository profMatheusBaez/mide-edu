from microbit import *

while True:
    print("x:", accelerometer.get_x())
    print("y:", accelerometer.get_y())
    sleep(100)
