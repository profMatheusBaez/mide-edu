#include "unihiker_k10.h"


UNIHIKER_K10 k10;
DFRobot_AHT20 clima;

void setup() {
  k10.begin();
  Serial.begin(115200);
  while (clima.begin() != 0) {
    delay(1000);
  }
}

void loop() {
  clima.startMeasurementReady(true);
  Serial.print("TEMP:");
  Serial.println(clima.getTemperature_C());
  Serial.print("UMID:");
  Serial.println(clima.getHumidity_RH());
  delay(1000);
}
