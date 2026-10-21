basic.forever(function () {
    serial.writeValue("luz", input.lightLevel())
    basic.pause(200)
})
