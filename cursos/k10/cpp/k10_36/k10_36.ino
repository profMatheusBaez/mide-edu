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
  k10.canvas->canvasText("CAMERA", 1, 0x00FF00);
  k10.canvas->updateCanvas();
  delay(500);
}
