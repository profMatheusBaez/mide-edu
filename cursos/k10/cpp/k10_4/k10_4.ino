#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.canvas->canvasText("Criar", 1, 0x00CC88);
  k10.canvas->canvasText("Aprender", 2, 0xFFCC00);
  k10.canvas->canvasText("Explorar", 3, 0xFFFFFF);
  k10.canvas->updateCanvas();
}

void loop() {

}
