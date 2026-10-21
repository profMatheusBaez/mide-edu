# Descobrir portas: qual motor esta em cada porta do hub?
# Envie este programa e abra o Monitor Serial: ele tenta ligar
# um motor em cada porta (A, B, C e D) e conta o que encontrou.
from pybricks.pupdevices import Motor
from pybricks.parameters import Port
from pybricks.tools import wait

portas = [Port.A, Port.B, Port.C, Port.D]
nomes = ["A", "B", "C", "D"]

for i in range(4):
    try:
        motor = Motor(portas[i])
        print("Porta", nomes[i], "-> motor encontrado, angulo:", motor.angle())
    except OSError:
        print("Porta", nomes[i], "-> nenhum motor")
    wait(200)

print("Pronto!")
