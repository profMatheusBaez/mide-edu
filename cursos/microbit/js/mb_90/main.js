lcd1602.iniciar()
basic.forever(function () {
    lcd1602.limpar()
    lcd1602.escrever("Luz: " + input.lightLevel(), 0, 0)
    lcd1602.escrever("Temp: " + input.temperature() + " C", 1, 0)
    basic.pause(1000)
})
