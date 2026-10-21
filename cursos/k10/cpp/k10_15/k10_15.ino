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
  int luz = k10.readALS();
  k10.canvas->canvasClear();
  if (luz < 250) {
    k10.rgb->write(-1, 0xFF0000);
    k10.canvas->canvasText("SOMBRA", 1, 0xFF5555);
  } else {
    k10.rgb->write(-1, 0x00FF00);
    k10.canvas->canvasText("CLARO", 1, 0x00FF88);
  }
  k10.canvas->canvasText(String(luz), 2, 0xFFFFFF);
  k10.canvas->updateCanvas();
  delay(200);
}
