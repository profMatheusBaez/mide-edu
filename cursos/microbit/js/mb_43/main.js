radio.setGroup(1)
input.onButtonPressed(Button.A, function () {
    radio.sendString("oi")
})
radio.onReceivedString(function (receivedString) {
    basic.showString(receivedString)
})
