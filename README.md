# yy-input
basic input support for touch, mouse, and keyboard

## rationale

I used this in all my games, so I decided to centralize and share it. This is a very simple class that emits events after a touch, mouse, or (optionally) keyboard event. The events are tied to an HTMLElement.

## installation

    npm i yy-input

## simple example

    const Input = require('yy-input')

    this.input = new Input()
    this.input.on('down', 
        function down(x, y)
        {
            console.log('You clicked at ' + x + ', ' + y)
        })

## live example
https://davidfig.github.io/input/

## API
```
    /**
     * basic input support for touch, mouse, and keyboard
     * @param {HTMLElement} object to attach listener to
     * @param {object} [options]
     * @param {boolean} [options.keys] turn on key listener
     * @param {boolean} [options.chromeDebug] ignore chrome debug keys, and force page reload with ctrl/cmd+r
     * @fires {down} emits a call with (x, y) when touch or mouse is down
     * @fires {up} emits a call with (x, y) when touch or mouse is up or cancelled
     * @fires {move} emits a call with (x, y) when touch or mouse moves
     * @fires {keydown} emits a call with (keycode, { shift: boolean, meta: boolean, ctrl: boolean }) when key is pressed
     * @fires {keyup} emits a call with (keycode, { shift: boolean, meta: boolean, ctrl: boolean }) when key is released
     */
    constructor(div, options)
```
## License  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
