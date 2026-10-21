#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
  String nome = "Ana";
  k10.canvas->canvasText("EXPLORADOR", 1, 0x00CCBB);
  k10.canvas->canvasText(nome, 2, 0xFFFFFF);
  k10.canvas->canvasText("Minha ideia: um robo", 3, 0xFFCC00);
  k10.canvas->updateCanvas();
}

void loop() {

}
