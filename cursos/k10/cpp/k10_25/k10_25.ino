#include "unihiker_k10.h"


UNIHIKER_K10 k10;
int passos = 0;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  if (k10.getStrength() > 1000) {
    passos++;
    k10.canvas->canvasClear();
    k10.canvas->canvasText("PASSOS", 1, 0x00CCBB);
    k10.canvas->canvasText(String(passos), 2, 0xFFFFFF);
    k10.canvas->updateCanvas();
    delay(800);
  }
  delay(50);
}
