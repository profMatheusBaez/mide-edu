#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.initBgCamerImage();
  k10.setBgCamerImage(true);
  k10.creatCanvas();
}

void loop() {
  k10.canvas->canvasRectangle(30, 50, 180, 180, 0xFFCC00, 0x000000, false);
  k10.canvas->canvasText("enquadre", 1, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(500);
}
