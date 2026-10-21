from microbit import *
import lcd1602

lcd1602.iniciar()
cliques = 0
lcd1602.escrever("Cliques: 0", 0, 0)

while True:
    if button_a.was_pressed():
        cliques += 1
        lcd1602.limpar()
        lcd1602.escrever("Cliques: " + str(cliques), 0, 0)
    if button_b.was_pressed():
        cliques = 0
        lcd1602.limpar()
        lcd1602.escrever("Cliques: 0", 0, 0)
    sleep(20)
