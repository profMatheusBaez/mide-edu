radio.setGroup(1)
basic.forever(function () {
    radio.sendNumber(input.temperature())
    basic.pause(2000)
})
radio.onReceivedNumber(function (receivedNumber) {
    basic.showNumber(receivedNumber)
})
