#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.canvasDrawCode("https://www.unihiker.com");
  k10.canvas->updateCanvas();
}

void loop() {
  delay(1000);
}
