from microbit import *

while True:
    if (compass.get_field_strength() // 1000) > 80:
        display.show(Image.SURPRISED)
    else:
        display.show(Image.HAPPY)
    sleep(200)
