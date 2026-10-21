from microbit import *

def grafico_barras(valor, maximo):
    proporcao = abs(valor) / maximo if maximo > 0 else 0
    k = 0
    for y in range(4, -1, -1):
        for x in range(3):
            brilho = 9 if k <= proporcao else 0
            display.set_pixel(2 - x, y, brilho)
            display.set_pixel(2 + x, y, brilho)
            k += 1 / 16

while True:
    grafico_barras(display.read_light_level(), 255)
    sleep(100)
