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
  k10.canvas->canvasClear();
  k10.canvas->canvasText("microSD", 1, 0x00CCBB);
  k10.canvas->canvasText("pronto", 2, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(1000);
}
