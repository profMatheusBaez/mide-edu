#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  Serial.begin(115200);
}

void loop() {
  int luz = k10.readALS();
  Serial.print("LUZ:");
  Serial.println(luz);
  delay(300);
}
