basic.forever(function () {
    serial.writeValue("temp", input.temperature())
    basic.pause(1000)
})
