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
  int forca = k10.getStrength();
  k10.canvas->canvasClear();
  if (forca > 1000) {
    k10.rgb->write(-1, 0xFF0000);
    k10.canvas->canvasText("SHAKE", 1, 0xFF5555);
  } else {
    k10.rgb->write(-1, 0x000000);
    k10.canvas->canvasText("calmo", 1, 0xFFFFFF);
  }
  k10.canvas->canvasText(String(forca), 2, 0x00CCBB);
  k10.canvas->updateCanvas();
  delay(100);
}
