radio.setGroup(1)
radio.onReceivedNumber(function (receivedNumber) {
    basic.showNumber(receivedNumber)
})
