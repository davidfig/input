/* Copyright (c) 2017 YOPEY YOPEY LLC */

const EventEmitter = require('eventemitter3')

module.exports = class Input extends EventEmitter
{
    /**
     * basic input support for touch, mouse, and keyboard
     *
     * @param {object} [options]
     * @param {HTMLElement} [options.div=document] object to attach listener to
     * @param {boolean} [options.noPointers] turns off mouse/touch/pen handlers
     * @param {boolean} [options.keys] turn on key listener
     * @param {boolean} [options.chromeDebug] ignore chrome debug keys, and force page reload with ctrl/cmd+r
     * @param {number} [options.threshold=5] maximum number of pixels to move while mouse/touch downbefore cancelling 'click'
     * @param {boolean} [options.preventDefault] call on handle, otherwise let client handle
     *
     * @event down(x, y, { input, event, id }) emits when touch or mouse is first down
     * @event up(x, y, { input, event, id }) emits when touch or mouse is up or cancelled
     * @event move(x, y, { input, event, id }) emits when touch or mouse moves (even if mouse is still up)
     * @event click(x, y, { input, event, id }) emits when "click" for touch or mouse
     * @event wheel(dx, dy, dz, { event, id, x, y }) emits when "wheel" scroll for mouse
     *
     * @event keydown(keyCode:number, {shift:boolean, meta:boolean, ctrl: boolean}, { event, input }) emits when key is pressed
     * @event keyup(keyCode:number, {shift:boolean, meta:boolean, ctrl: boolean}, { event, input }) emits when key is released
     */
    constructor(options)
    {
        super()
        options = options || {}
        this.threshold = typeof options.threshold === 'undefined' ? 5 : options.threshold
        this.chromeDebug = options.chromeDebug
        this.preventDefault = options.preventDefault

        this.pointers = []
        this.keys = {}
        this.input = []

        this.div = options.div || document
        this.options = options
        this.callbacks = [
            this.mouseDown.bind(this),
            this.mouseMove.bind(this),
            this.mouseUp.bind(this), // 2
            this.touchStart.bind(this),
            this.touchMove.bind(this),
            this.touchEnd.bind(this),
            this.keydown.bind(this), // 6
            this.keyup.bind(this),
            this.wheel.bind(this) // 8
        ]
        if (!options.noPointers)
        {
            this.addPointers()
        }
        if (options.keys)
        {
            this.addKeyboard()
        }
    }

    /**
     * remove all listeners
     */
    destroy()
    {
        this.removePointers()
        this.removeKeyboard()
    }

    /**
     * turns on pointer listeners (on by default); can be used after removePointers()
     */
    addPointers()
    {
        if (!this.listeningPointer)
        {
            const div = this.div
            div.addEventListener('mousedown', this.callbacks[0])
            div.addEventListener('mousemove', this.callbacks[1])
            div.addEventListener('mouseup', this.callbacks[2])
            div.addEventListener('mouseout', this.callbacks[2])
            div.addEventListener('wheel', this.callbacks[8])

            div.addEventListener('touchstart', this.callbacks[3])
            div.addEventListener('touchmove', this.callbacks[4])
            div.addEventListener('touchend', this.callbacks[5])
            div.addEventListener('touchcancel', this.callbacks[5])
            this.listeningPointer = true
        }
    }

    /**
     * remove pointers listener
     */
    removePointers()
    {
        if (this.listeningPointer)
        {
            const div = this.div
            div.removeEventListener('mousedown', this.callbacks[0])
            div.removeEventListener('mousemove', this.callbacks[1])
            div.removeEventListener('mouseup', this.callbacks[2])
            div.removeEventListener('mouseout', this.callbacks[2])
            div.removeEventListener('wheel', this.callbacks[8])

            div.removeEventListener('touchstart', this.callbacks[3])
            div.removeEventListener('touchmove', this.callbacks[4])
            div.removeEventListener('touchend', this.callbacks[5])
            div.removeEventListener('touchcancel', this.callbacks[5])
            this.listeningPointer = false
        }
    }

    /**
     * turns on keyboard listener (off by default); can be used after removeKeyboard()
     */
    addKeyboard()
    {
        if (!this.listeningKeyboard)
        {
            document.addEventListener('keydown', this.callbacks[6])
            document.addEventListener('keyup', this.callbacks[7])
            this.listeningKeyboard = true
        }
    }

    /**
     * removes keyboard listener
     */
    removeKeyboard()
    {
        if (this.listeningKeyboard)
        {
            document.removeEventListener('keydown', this.callbacks[6])
            document.removeEventListener('keyup', this.callbacks[7])
            this.listeningKeyboard = false
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
        for (let i = 0; i < this.pointers.length; i++)
        {
            if (this.pointers[i].identifier === id)
            {
                return this.pointers[i]
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
        for (let i = 0; i < this.pointers.length; i++)
        {
            if (this.pointers[i].identifier === id)
            {
                this.pointers.splice(i, 1)
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
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        const touches = e.changedTouches
        for (let i = 0; i < touches.length; i++)
        {
            const touch = touches[i]
            const entry = {
                identifier: touch.identifier,
                x: touch.clientX,
                y: touch.clientY
            }
            this.pointers.push(entry)
            this.handleDown(touch.clientX, touch.clientY, e, touch.identifier)
        }
    }

    /**
     * Handle touch move
     * @private
     * @param  {object} e touch event
     */
    touchMove(e)
    {
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        for (let i = 0; i < e.changedTouches.length; i++)
        {
            const touch = e.changedTouches[i]
            this.handleMove(touch.clientX, touch.clientY, e, touch.identifier)
        }
    }

    /**
     * Handle touch end
     * @private
     * @param  {object} e touch event
     */
    touchEnd(e)
    {
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        for (let i = 0; i < e.changedTouches.length; i++)
        {
            const touch = e.changedTouches[i]
            const previous = this.findTouch(touch.identifier)
            if (previous !== null)
            {
                this.removeTouch(touch.identifier)
                this.handleUp(touch.clientX, touch.clientY, e, touch.identifier)
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
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        while (this.pointers.length)
        {
            this.pointers.pop()
        }
        this.pointers.push({id: 'mouse'})
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleDown(x, y, e, 'mouse')
    }

    /**
     * Handle mouse move
     * @private
     * @param  {object} e touch event
     */
    mouseMove(e)
    {
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleMove(x, y, e, 'mouse')
    }

    /**
     * Handle mouse up
     * @private
     * @param  {object} e touch event
     */
    mouseUp(e)
    {
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.pointers.pop()
        this.handleUp(x, y, e, 'mouse')
    }

    handleDown(x, y, e, id)
    {
        this.emit('down', x, y, { event: e, input: this, id })
        if (!this.threshold || this.pointers > 1)
        {
            this.start = null
        }
        else
        {
            this.start = { x, y }
        }
    }

    handleUp(x, y, e, id)
    {
        if (this.start)
        {
            this.emit('click', x, y, { event: e, input: this, id })
        }
        this.emit('up', x, y, { event: e, input: this, id })
    }

    handleMove(x, y, e, id)
    {
        if (this.start)
        {
            if (Math.abs(this.start.x - x) > this.threshold || Math.abs(this.start.y - y) > this.threshold)
            {
                this.start = null
            }
        }
        this.emit('move', x, y, { event: e, input: this, id })
    }

    wheel(e)
    {
        this.emit('wheel', e.deltaX, e.deltaY, e.deltaZ, { event: e, id: 'mouse', x: e.clientX, y: e.clientY })
    }

    /**
     * Sets event listener for keyboard
     * @private
     */
    keysListener()
    {
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
        if (this.chromeDebug)
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
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        this.emit('keydown', code, this.keys, { event: e, input: this })
    }

    /**
     * Handle key up
     * @private
     * @param  {object}
     */
    keyup(e)
    {
        if (this.preventDefault)
        {
            e.preventDefault()
        }
        this.keys.shift = e.shiftKey
        this.keys.meta = e.metaKey
        this.keys.ctrl = e.ctrlKey
        const code = (typeof e.which === 'number') ? e.which : e.keyCode
        this.emit('keyup', code, this.keys, { event: e, input: this })
    }
}