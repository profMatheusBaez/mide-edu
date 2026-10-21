let inicio = 0
let reacao = 0
led.enable(false)
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
input.onButtonPressed(Button.A, function () {
    pins.digitalWritePin(DigitalPin.P15, 0)
    basic.pause(randint(2000, 5000))
    pins.digitalWritePin(DigitalPin.P15, 1)
    inicio = input.runningTime()
    while (pins.digitalReadPin(DigitalPin.P8) == 1) {
        basic.pause(1)
    }
    reacao = input.runningTime() - inicio
    pins.digitalWritePin(DigitalPin.P15, 0)
    led.enable(true)
    basic.showNumber(reacao)
    led.enable(false)
})
