from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
screen.draw_text(text="Criar", x=10, y=20, font_size=24, color=0x00CC88)
screen.draw_text(text="Aprender", x=10, y=60, font_size=24, color=0xFFCC00)
screen.draw_text(text="Explorar", x=10, y=100, font_size=24, color=0xFFFFFF)
screen.show_draw()
