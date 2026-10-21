// Gerado pelo Modo Blocos — MIDE EDU
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
int angulo = 0;
Servo servo9;

void setup() {
  lcd.init();
  lcd.backlight();
  pinMode(2, INPUT);
  servo9.attach(9);
  angulo = 90;
}

void loop() {
  if (digitalRead(2) == HIGH) {
    angulo += 10;
    servo9.write(angulo);
    lcd.setCursor(0, 1);
    lcd.print("Angulo");
  }
  delay(200);
}
