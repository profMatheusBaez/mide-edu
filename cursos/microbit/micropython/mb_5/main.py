from microbit import *

while True:
    display.show(Image("00000:00000:00900:00000:00000"))
    sleep(200)
    display.show(Image("00000:09990:09090:09990:00000"))
    sleep(200)
    display.show(Image("99999:90009:90009:90009:99999"))
    sleep(200)
    display.clear()
    sleep(200)
