let timeA = 0
let timeB = 0
timeA = 0
timeB = 0
input.onButtonPressed(Button.A, function () {
    timeA += 1
    basic.showNumber(timeA)
})
input.onButtonPressed(Button.B, function () {
    timeB += 1
    basic.showNumber(timeB)
})
input.onButtonPressed(Button.AB, function () {
    basic.showString("" + timeA + " x " + timeB)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    timeA = 0
    timeB = 0
    basic.showIcon(IconNames.Yes)
})
