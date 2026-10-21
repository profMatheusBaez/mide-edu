from unihiker_k10 import screen

screen.init(dir=2)
screen.show_bg(color=0x102638)
nome = "Ana"
screen.draw_text(text="EXPLORADOR", x=10, y=20, font_size=24, color=0x00CCBB)
screen.draw_text(text=nome, x=10, y=60, font_size=24, color=0xFFFFFF)
screen.draw_text(text="Minha ideia: um robo", x=10, y=100, font_size=16, color=0xFFCC00)
screen.show_draw()
