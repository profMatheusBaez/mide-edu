#include "unihiker_k10.h"


UNIHIKER_K10 k10;
int x = 0;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  k10.canvas->canvasClear();
  k10.canvas->canvasCircle(x, 120, 12, 0x00FF00, 0x00FF00, true);
  k10.canvas->updateCanvas();
  x = x + 8;
  if (x > 240) x = 0;
  delay(50);
}
