let cliques = 0
lcd1602.iniciar()
cliques = 0
lcd1602.escrever("Cliques: 0", 0, 0)
input.onButtonPressed(Button.A, function () {
    cliques += 1
    lcd1602.limpar()
    lcd1602.escrever("Cliques: " + cliques, 0, 0)
})
input.onButtonPressed(Button.B, function () {
    cliques = 0
    lcd1602.limpar()
    lcd1602.escrever("Cliques: 0", 0, 0)
})
