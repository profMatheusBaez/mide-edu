// teste geral de linguagem
#define LIMITE 5
const int TAM = 4;
int v[TAM] = {10, 20, 30, 40};
byte m[2][3] = {{1, 2, 3}, {4, 5, 6}};
char nome[] = "MIDE";
long grande = 100000L;
int contador;
bool flag = true;

int soma(int a, int b) { return a + b; }
long fatorial(int n) { if (n <= 1) return 1; return n * fatorial(n - 1); }
int contaChamadas() { static int vezes = 0; vezes++; return vezes; }
void mostra(int x) {
  switch (x) {
    case 0: Serial.println("zero"); break;
    case 1:
    case 2: Serial.println("um ou dois"); break;
    default: Serial.print("outro "); Serial.println(x);
  }
}

void setup() {
  Serial.begin(9600);
  Serial.println(soma(2, 3));
  Serial.println(fatorial(10));
  for (int i = 0; i < TAM; i++) { v[i] += i; Serial.print(v[i]); Serial.print(i < TAM - 1 ? "," : "\n"); }
  int t = 0;
  for (int i = 0; i < 2; i++) for (int j = 0; j < 3; j++) t += m[i][j] * (i + 1);
  Serial.println(t);
  Serial.println(nome);
  Serial.println('A');
  char c = 'B';
  Serial.println(c);
  Serial.println(255, HEX);
  Serial.println(5, BIN);
  Serial.println(grande * 3);
  int x = 32767; x = x + 1; Serial.println(x);
  byte b = 250; b += 10; Serial.println(b);
  int k = 0; while (k < LIMITE) { k++; if (k == 2) continue; if (k == 4) break; Serial.print(k); }
  Serial.println();
  do { k--; } while (k > 0);
  Serial.println(k);
  for (int i = 0; i < 4; i++) mostra(i);
  int a = 5; int r = a++ + ++a; Serial.println(r); Serial.println(a);
  v[1]++; v[2] -= 5; Serial.println(v[1] + v[2]);
  int y = v[0]++; Serial.println(y); Serial.println(v[0]);
  Serial.println(!flag); Serial.println(flag && (a > 3)); Serial.println((a < 3) || false);
  Serial.println(-17 / 5); Serial.println(-17 % 5); Serial.println(1 << 10); Serial.println(-64 >> 2);
  Serial.println(map(512, 0, 1023, 0, 255)); Serial.println(constrain(300, 0, 255)); Serial.println(abs(-9));
  Serial.println(min(3, 8)); Serial.println(max(3, 8)); Serial.println(sizeof(v) / sizeof(v[0]));
  Serial.println(contaChamadas()); Serial.println(contaChamadas());
  int q = (a > 3) ? 100 : 200; Serial.println(q);
  unsigned long ms = 1000UL; Serial.println(ms);
  Serial.print("fim");
  Serial.println();
}

void loop() {
}
