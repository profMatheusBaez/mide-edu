#include "unihiker_k10.h"


UNIHIKER_K10 k10;
int x = 100;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  if (k10.buttonA->isPressed()) x -= 5;
  if (k10.buttonB->isPressed()) x += 5;
  x = constrain(x, 0, 200);
  k10.canvas->canvasClear();
  k10.canvas->canvasRectangle(x, 130, 35, 35, 0x00CCBB, 0x00CCBB, true);
  k10.canvas->updateCanvas();
  delay(40);
}
