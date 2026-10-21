from microbit import *

contagem = 0

while True:
    if button_a.was_pressed():
        contagem += 1
        display.scroll(contagem)
    if button_b.was_pressed():
        contagem += -1
        display.scroll(contagem)
    if (button_a.is_pressed() and button_b.is_pressed()):
        contagem = 0
        display.scroll(contagem)
    sleep(20)
