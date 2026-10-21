basic.forever(function () {
    if (input.magneticForce(Dimension.Strength) > 80) {
        basic.showIcon(IconNames.Surprised)
    } else {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(200)
})
