from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import network
import time

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
while True:
    redes = wifi.scan()
    screen.clear()
    screen.draw_text(text="REDES WIFI", x=10, y=20, font_size=22, color=0x00CCBB)
    screen.draw_text(text=str(len(redes)), x=10, y=65, font_size=32, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(4)
