from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
screen.draw_qr_code(text="https://www.unihiker.com", x=35, y=45, size=6)
screen.show_draw()
