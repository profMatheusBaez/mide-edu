from microbit import *

while True:
    print("pot:", pin2.read_analog())
    sleep(100)
