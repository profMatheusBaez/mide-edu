#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.rgb->brightness(4);
}

void loop() {
  k10.canvas->canvasClear();
  if (k10.buttonB->isPressed()) {
    k10.rgb->write(-1, 0xFF0000);
    k10.canvas->canvasText("PAUSA", 1, 0xFF5555);
  } else if (k10.buttonA->isPressed()) {
    k10.rgb->write(-1, 0x00FF00);
    k10.canvas->canvasText("PRONTO", 1, 0x00FF88);
  } else {
    k10.rgb->write(-1, 0x000000);
    k10.canvas->canvasText("AGUARDANDO", 1, 0xFFFFFF);
  }
  k10.canvas->updateCanvas();
  delay(100);
}
