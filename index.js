/* Copyright (c) 2017 YOPEY YOPEY LLC */

const EventEmitter = require('eventemitter3')

module.exports = class Input extends EventEmitter
{
    /**
     * basic input support for touch, mouse, and keyboard
     * @param {HTMLElement} object to attach listener to
     * @param {object} [options]
     * @param {boolean} [options.noPointer] turns off mouse/touch handlers
     * @param {boolean} [options.keys] turn on key listener
     * @param {boolean} [options.chromeDebug] ignore chrome debug keys, and force page reload with ctrl/cmd+r
     * @param {number} [options.threshold=5] maximum number of pixels to move while mouse/touch downbefore cancelling 'click'
     * @event down(x, y, event) emits when touch or mouse is first down
     * @event up(x, y, event) emits when touch or mouse is up or cancelled
     * @event move(x, y, event) emits when touch or mouse moves (even if mouse is still up)
     * @event keydown(keyCode:number, {shift:boolean, meta:boolean, ctrl: boolean}, event) emits when key is pressed
     * @event keyup(keyCode:number, {shift:boolean, meta:boolean, ctrl: boolean}, event) emits when key is released
     * @event click(x, y, event) emits awith touch or mouse click
     */
    constructor(div, options)
    {
        super()

        this.options = options || {}
        this.options.threshold = typeof this.options.threshold === 'undefined' ? 5 : this.options.threshold

        this.touches = []
        this.keys = {}
        this.input = []

        if (!this.options.noPointer)
        {
            div.addEventListener('mousedown', this.mouseDown.bind(this))
            div.addEventListener('mousemove', this.mouseMove.bind(this))
            div.addEventListener('mouseup', this.mouseUp.bind(this))
            div.addEventListener('mouseout', this.mouseUp.bind(this))

            div.addEventListener('touchstart', this.touchStart.bind(this))
            div.addEventListener('touchmove', this.touchMove.bind(this))
            div.addEventListener('touchend', this.touchEnd.bind(this))
            div.addEventListener('touchcancel', this.touchEnd.bind(this))
        }

        if (this.options.keys)
        {
            this.keysListener()
        }
    }

    /**
     * helper function to find touch from list based on id
     * @private
     * @param  {number} id for saved touch
     * @return {object}
     */
    findTouch(id)
    {
        for (let i = 0; i < this.touches.length; i++)
        {
            if (this.touches[i].identifier === id)
            {
                return this.touches[i]
            }
        }
        return null
    }

    /**
     * helper function to remove touch from touch list
     * @private
     * @param  {object} touch object
     */
    removeTouch(id)
    {
        for (let i = 0; i < this.touches.length; i++)
        {
            if (this.touches[i].identifier === id)
            {
                this.touches.splice(i, 1)
                return
            }
        }
    }

    /**
     * Handle touch start
     * @private
     * @param  {object} e touch event
     */
    touchStart(e)
    {
        e.preventDefault()
        const touches = e.changedTouches
        for (let i = 0; i < touches.length; i++)
        {
            const touch = touches[i]
            const entry = {
                identifier: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                start: Date.now()
            }
            this.touches.push(entry)
            this.handleDown(touch.clientX, touch.clientY, e)
        }
    }

    /**
     * Handle touch move
     * @private
     * @param  {object} e touch event
     */
    touchMove(e)
    {
        e.preventDefault()
        for (let i = 0; i < e.changedTouches.length; i++)
        {
            const touch = e.changedTouches[i]
            this.handleMove(touch.clientX, touch.clientY, e)
        }
    }

    /**
     * Handle touch end
     * @private
     * @param  {object} e touch event
     */
    touchEnd(e)
    {
        e.preventDefault()
        for (let i = 0; i < e.changedTouches.length; i++)
        {
            const touch = e.changedTouches[i]
            const previous = this.findTouch(touch.identifier)
            if (previous !== null)
            {
                this.removeTouch(touch.identifier)
                this.handleUp(touch.clientX, touch.clientY, e)
            }
        }
    }

    /**
     * Handle mouse down
     * @private
     * @param  {object} e touch event
     */
    mouseDown(e)
    {
        e.preventDefault()
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleDown(x, y, e)
    }

    /**
     * Handle mouse move
     * @private
     * @param  {object} e touch event
     */
    mouseMove(e)
    {
        e.preventDefault()
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleMove(x, y, e)
    }

    /**
     * Handle mouse up
     * @private
     * @param  {object} e touch event
     */
    mouseUp(e)
    {
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleUp(x, y, e)
    }

    handleDown(x, y, e)
    {
        this.emit('down', x, y, e)
        if (this.touches > 1)
        {
            this.start = null
        }
        else
        {
            this.start = { x, y }
        }
    }

    handleUp(x, y, e)
    {
        this.emit('up', x, y, e)
        if (this.start)
        {
            this.emit('click', x, y, e)
        }
    }

    handleMove(x, y, e)
    {
        this.emit('move', x, y, e)
        if (this.start)
        {
            if (Math.abs(this.start.x - x) > this.options.threshold || Math.abs(this.start.y - y) > this.options.threshold)
            {
                this.start = null
            }
        }
    }

    /**
     * Sets event listener for keyboard
     * @private
     */
    keysListener()
    {
        document.addEventListener('keydown', this.keydown.bind(this))
        document.addEventListener('keyup', this.keyup.bind(this))
    }

    /**
     * @private
     * @param  {object} e
     */
    keydown(e)
    {
        this.keys.shift = e.shiftKey
        this.keys.meta = e.metaKey
        this.keys.ctrl = e.ctrlKey
        const code = (typeof e.which === 'number') ? e.which : e.keyCode
        if (this.options.chromeDebug)
        {
            // allow chrome to open developer console
            if (this.keys.meta && code === 73)
            {
                return
            }

            // reload page with meta + r
            if (code === 82 && this.keys.meta)
            {
                window.location.reload()
                return
            }
        }
        this.emit('keydown', code, this.keys, e)
    }

    /**
     * Handle key up
     * @private
     * @param  {object}
     */
    keyup(e)
    {
        this.keys.shift = e.shiftKey
        this.keys.meta = e.metaKey
        this.keys.ctrl = e.ctrlKey
        const code = (typeof e.which === 'number') ? e.which : e.keyCode
        this.emit('keyup', code, this.keys, e)
    }
}