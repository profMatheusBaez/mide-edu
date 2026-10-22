// Gerado pelo Modo Blocos — MIDE EDU
#define NOTA_DO 262

const int DIGITOS_7SEG[10][7] = {
  {1, 1, 1, 1, 1, 1, 0},
  {0, 1, 1, 0, 0, 0, 0},
  {1, 1, 0, 1, 1, 0, 1},
  {1, 1, 1, 1, 0, 0, 1},
  {0, 1, 1, 0, 0, 1, 1},
  {1, 0, 1, 1, 0, 1, 1},
  {1, 0, 1, 1, 1, 1, 1},
  {1, 1, 1, 0, 0, 0, 0},
  {1, 1, 1, 1, 1, 1, 1},
  {1, 1, 1, 1, 0, 1, 1}
};
const int PINOS_7SEG[7] = {2, 3, 4, 5, 6, 7, 8};
int cm = 0;

void mostrarDigito(int n) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(PINOS_7SEG[i], DIGITOS_7SEG[n][i]);
  }
}

long distanciaCM(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duracao = pulseIn(echo, HIGH, 30000);
  return duracao / 29 / 2;
}

void setup() {
  Serial.begin(9600);
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(11, OUTPUT);
  for (int i = 0; i < 3; i++) {
    mostrarDigito(8);
    delay(100);
  }
}

void loop() {
  cm = distanciaCM(6, 7);
  if (cm < 10) {
    mostrarDigito(1);
    tone(5, NOTA_DO, 200);
  } else {
    digitalWrite(2, LOW);
    digitalWrite(3, LOW);
    digitalWrite(4, LOW);
    digitalWrite(5, LOW);
    digitalWrite(6, LOW);
    digitalWrite(7, LOW);
    digitalWrite(8, LOW);
    digitalWrite(9, LOW);
    noTone(5);
  }
  Serial.println(cm);
  analogWrite(11, map(analogRead(A0), 0, 1023, 0, 255));
  delay(50);
}
