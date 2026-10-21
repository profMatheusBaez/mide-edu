#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.rgb->brightness(4);
}

void loop() {
  int luz = k10.readALS();
  if (luz < 300) {
    k10.rgb->write(-1, 0xFFCC00);
  } else {
    k10.rgb->write(-1, 0x000000);
  }
  delay(100);
}
