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
  if (k10.isGesture(ScreenUp)) {
    k10.canvas->canvasText("UP", 1, 0x00FF00);
  } else if (k10.isGesture(ScreenDown)) {
    k10.canvas->canvasText("DOWN", 1, 0xFF0000);
  } else {
    k10.canvas->canvasText("MOVENDO", 1, 0xFFFFFF);
  }
  k10.canvas->updateCanvas();
  delay(150);
}
