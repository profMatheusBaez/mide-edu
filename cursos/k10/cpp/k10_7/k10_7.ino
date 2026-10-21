#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  k10.rgb->brightness(4);
  k10.rgb->write(0, 0xFF0000);
  k10.rgb->write(1, 0x00FF00);
  k10.rgb->write(2, 0x0000FF);
}

void loop() {

}
