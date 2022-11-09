---
'@dnd-kit/core': minor
---

Adding new KeyboardCodeModifiers property to the KeyboardSensor interface to allow users to specify whether they want to require the use of Alt, Ctrl, and/or the Shift Key for Start, Cancel, and End dnd events.

This is being added for users who want to expand the KeyboardCodes to also use combinations of the Alt, Ctrl, and Shift keys. Some examples would be: Shift+Space, Shift+AltLeft, Ctrl+Shift+Alt+Space.

To use this code. Add the KeyboardCodeModifiers optional parameter when setting up the KeyboardSensor options. You can then define rules for Start, Cancel, and End and each modifier set to true will apply to their respective keyboard code.

The following is an example if you wanted to set up Shift+Space to start and end.
`
keyboardCodes: {
    start: ['Space'],
    cancel: ['Escape'],
    end: ['Space'],
},
keyboardCodeModifiers: {
    start: {
        altKey: true,
        shiftKey: false,
        ctrlKey: false,
    },
    end: {
        altKey: true,
        shiftKey: false,
        ctrlKey: false,
    },
},
`
