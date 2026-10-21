basic.forever(function () {
    if (input.temperature() < 20) {
        basic.showIcon(IconNames.Sad)
    } else if (input.temperature() < 28) {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.showIcon(IconNames.Angry)
    }
    basic.pause(1000)
})
