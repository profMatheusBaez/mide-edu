from microbit import *
import lcd1602

lcd1602.iniciar()

while True:
    lcd1602.limpar()
    lcd1602.escrever("Luz: " + str(display.read_light_level()), 0, 0)
    lcd1602.escrever("Temp: " + str(temperature()) + " C", 1, 0)
    sleep(1000)
