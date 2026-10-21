from microbit import *
import lcd1602

lcd1602.iniciar()

while True:
    lcd1602.limpar()
    lcd1602.escrever("Temp: " + str(temperature()) + " C", 0, 0)
    sleep(1000)
