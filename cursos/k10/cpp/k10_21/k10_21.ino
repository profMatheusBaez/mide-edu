#include "unihiker_k10.h"

UNIHIKER_K10 k10;

void setup() {
  k10.begin();
  Serial.begin(115200);
}

void loop() {
  Serial.print("X:");
  Serial.print(k10.getAccelerometerX());
  Serial.print(" Y:");
  Serial.print(k10.getAccelerometerY());
  Serial.print(" Z:");
  Serial.println(k10.getAccelerometerZ());
  delay(200);
}
