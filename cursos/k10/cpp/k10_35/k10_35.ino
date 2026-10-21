#include "unihiker_k10.h"


UNIHIKER_K10 k10;
int jogador = 100;
int obstaculoY = 0;

void setup() {
  k10.begin();
  k10.initScreen(2);
  k10.creatCanvas();
  k10.setScreenBackground(0x102638);
}

void loop() {
  if (k10.buttonA->isPressed()) jogador -= 5;
  if (k10.buttonB->isPressed()) jogador += 5;
  jogador = constrain(jogador, 0, 200);
  obstaculoY += 6;
  if (obstaculoY > 320) obstaculoY = 0;
  k10.canvas->canvasClear();
  k10.canvas->canvasRectangle(110, obstaculoY, 30, 30, 0xFF0000, 0xFF0000, true);
  k10.canvas->canvasRectangle(jogador, 280, 40, 20, 0x00FF00, 0x00FF00, true);
  k10.canvas->updateCanvas();
  delay(50);
}
