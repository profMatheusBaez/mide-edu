radio.setGroup(1)
input.onButtonPressed(Button.A, function () {
    radio.sendString("SIM")
})
input.onButtonPressed(Button.B, function () {
    radio.sendString("NAO")
})
radio.onReceivedString(function (receivedString) {
    basic.showString(receivedString)
})
