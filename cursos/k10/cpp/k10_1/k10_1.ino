#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  k10.canvas->canvasText("K10 EXPLORER", 1, 0xFFFFFF);
  k10.canvas->canvasText("Tela + botoes + RGB", 2, 0x00CCBB);
  k10.canvas->updateCanvas();
}

void loop() {

}
