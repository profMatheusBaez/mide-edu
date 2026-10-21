from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import network
import time

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
while True:
    luz = 520
    screen.clear()
    screen.draw_text(text="IOT K10", x=10, y=20, font_size=24, color=0x00CCBB)
    screen.draw_text(text="ONLINE" if wifi.isconnected() else "SEM REDE", x=10, y=60, font_size=22, color=0xFFFFFF)
    screen.draw_text(text="LUZ " + str(luz), x=10, y=100, font_size=22, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(1)
