radio.setGroup(1)
input.onButtonPressed(Button.A, function () {
    radio.sendNumber(randint(1, 9))
    basic.showArrow(ArrowNames.East)
    basic.pause(500)
    basic.clearScreen()
})
