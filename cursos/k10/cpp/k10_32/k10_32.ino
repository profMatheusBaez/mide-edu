#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  k10.canvas->canvasClear();
  k10.canvas->canvasLine(10, 20, 220, 20, 0xFFFFFF);
  k10.canvas->canvasCircle(80, 120, 30, 0x00CCBB, 0x00CCBB, false);
  k10.canvas->canvasRectangle(130, 90, 70, 60, 0xFFCC00, 0xFFCC00, false);
  k10.canvas->updateCanvas();
  delay(1000);
}
