from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
import network
import time

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
# wifi.connect("SUA_REDE", "SUA_SENHA")
while True:
    screen.clear()
    texto = "ONLINE" if wifi.isconnected() else "OFFLINE"
    screen.draw_text(text=texto, x=10, y=20, font_size=28, color=0xFFFFFF)
    screen.show_draw()
    time.sleep(1)
