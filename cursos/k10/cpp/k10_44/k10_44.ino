#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.initSDFile();
}

void loop() {
  k10.canvas->canvasDrawImage(0, 0, "S:/photo.bmp");
  k10.canvas->updateCanvas();
  delay(1000);
}
