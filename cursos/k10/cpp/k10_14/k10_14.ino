#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.rgb->brightness(4);
}

void loop() {
  int luz = k10.readALS();
  k10.rgb->write(-1, 0x000000);
  if (luz > 150) k10.rgb->write(0, 0x00FF00);
  if (luz > 450) k10.rgb->write(1, 0x00FF00);
  if (luz > 800) k10.rgb->write(2, 0x00FF00);
  delay(150);
}
