from unihiker_k10 import screen, button, rgb
import time

screen.init(dir=2)
screen.show_bg(color=0x102638)
a = button(button.a)
b = button(button.b)
rgb.brightness(4)
while True:
    screen.clear()
    if b.status():
        rgb.write(color=0xFF0000)
        mensagem = "PAUSA"
    elif a.status():
        rgb.write(color=0x00FF00)
        mensagem = "PRONTO"
    else:
        rgb.clear()
        mensagem = "AGUARDANDO"
    screen.draw_text(text=mensagem, x=10, y=20, font_size=24, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(0.1)
