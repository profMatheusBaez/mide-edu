lcd1602.iniciar()
basic.forever(function () {
    lcd1602.limpar()
    lcd1602.escrever("Temp: " + input.temperature() + " C", 0, 0)
    basic.pause(1000)
})
