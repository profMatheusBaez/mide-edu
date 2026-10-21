basic.forever(function () {
    if (input.lightLevel() < 50) {
        basic.showIcon(IconNames.Asleep)
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(300)
})
