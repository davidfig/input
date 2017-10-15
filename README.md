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
     *
     * @param {object} [options]
     * @param {HTMLElement} [options.div=document] object to attach listener to
     * @param {boolean} [options.noPointer] turns off mouse/touch handlers
     * @param {boolean} [options.keys] turn on key listener
     * @param {boolean} [options.chromeDebug] ignore chrome debug keys, and force page reload with ctrl/cmd+r
     * @param {number} [options.threshold=5] maximum number of pixels to move while mouse/touch downbefore cancelling 'click'
     * @param {boolean} [options.preventDefault] call on handle, otherwise let client handle
     *
     * @event down(x, y, { input, event, id }) emits when touch or mouse is first down
     * @event up(x, y, { input, event, id }) emits when touch or mouse is up or cancelled
     * @event move(x, y, { input, event, id }) emits when touch or mouse moves (even if mouse is still up)
     * @event click(x, y, { input, event, id }) emits when "click" for touch or mouse
     *
     * @event keydown(keyCode:number, {shift:boolean, meta:boolean, ctrl: boolean}, { event, input }) emits when key is pressed
     * @event keyup(keyCode:number, {shift:boolean, meta:boolean, ctrl: boolean}, { event, input }) emits when key is released
     */
    constructor(options)
```
## License  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
