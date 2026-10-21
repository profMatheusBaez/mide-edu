from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
from unihiker_k10 import button
import time

jogador = 100
obstaculo_y = 0
a = button(button.a)
b = button(button.b)
while True:
    if a.status():
        jogador -= 5
    if b.status():
        jogador += 5
    jogador = max(0, min(200, jogador))
    obstaculo_y += 6
    if obstaculo_y > 320:
        obstaculo_y = 0
    screen.clear()
    screen.fill_rect(x=110, y=obstaculo_y, w=30, h=30, color=0xFF0000)
    screen.fill_rect(x=jogador, y=280, w=40, h=20, color=0x00FF00)
    screen.show_draw()
    time.sleep(0.05)
