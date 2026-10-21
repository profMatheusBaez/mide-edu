#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  int x = 120 + k10.getAccelerometerX() / 25;
  int y = 120 + k10.getAccelerometerY() / 25;
  x = constrain(x, 10, 230);
  y = constrain(y, 10, 310);
  k10.canvas->canvasClear();
  k10.canvas->canvasCircle(x, y, 10, 0x00FF00, 0x00FF00, true);
  k10.canvas->updateCanvas();
  delay(60);
}
