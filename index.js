/* Copyright (c) 2017 YOPEY YOPEY LLC */

const EventEmitter = require('eventemitter3')

module.exports = class Input extends EventEmitter
{
    /**
     * basic input support for touch, mouse, and keyboard
     * @param {HTMLElement} object to attach listener to
     * @param {object} [options]
     * @param {boolean} [options.keys] turn on key listener
     * @param {boolean} [options.chromeDebug] ignore chrome debug keys, and force page reload with ctrl/cmd+r
     */
    constructor(div, options)
    {
        super()

        this.options = options || {}

        this.touches = []
        this.keys = {}
        this.input = []

        div.addEventListener('mousedown', this.mouseDown.bind(this))
        div.addEventListener('mousemove', this.mouseMove.bind(this))
        div.addEventListener('mouseup', this.mouseUp.bind(this))
        div.addEventListener('mouseout', this.mouseUp.bind(this))

        div.addEventListener('touchstart', this.touchStart.bind(this))
        div.addEventListener('touchmove', this.touchMove.bind(this))
        div.addEventListener('touchend', this.touchEnd.bind(this))
        div.addEventListener('touchcancel', this.touchEnd.bind(this))

        if (this.options.keys)
        {
            this.keysListener()
        }
    }

    /**
     * helper function to find touch from list based on id
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
            this.handleDown(touch.clientX, touch.clientY)
        }
    }

    /**
     * Handle touch move
     * @param  {object} e touch event
     */
    touchMove(e)
    {
        e.preventDefault()
        for (let i = 0; i < e.changedTouches.length; i++)
        {
            const touch = e.changedTouches[i]
            this.handleMove(touch.clientX, touch.clientY)
        }
    }

    /**
     * Handle touch end
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
                this.handleUp(touch.clientX, touch.clientY)
            }
        }
    }

    /**
     * Handle mouse down
     * @param  {object} e touch event
     */
    mouseDown(e)
    {
        e.preventDefault()
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleDown(x, y)
    }

    /**
     * Handle mouse move
     * @param  {object} e touch event
     */
    mouseMove(e)
    {
        e.preventDefault()
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleMove(x, y)
    }

    /**
     * Handle mouse up
     * @param  {object} e touch event
     */
    mouseUp(e)
    {
        const x = window.navigator.msPointerEnabled ? e.offsetX : e.clientX
        const y = window.navigator.msPointerEnabled ? e.offsetY : e.clientY
        this.handleUp(x, y)
    }

    handleDown(x, y)
    {
        this.emit('down', x, y)
    }

    handleUp(x, y)
    {
        this.emit('up', x, y)
    }

    handleMove(x, y)
    {
        this.emit('move', x, y)
    }

    /**
     * Sets event listener for keyboard
     */
    keysListener()
    {
        document.addEventListener('keydown', this.keydown.bind(this))
        document.addEventListener('keyup', this.keyup.bind(this))
    }

    /**
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
        this.emit('keydown', code, this.keys)
    }

    /**
     * Handle key up
     * @param  {object}
     */
    keyup(e)
    {
        this.keys.shift = e.shiftKey
        this.keys.meta = e.metaKey
        this.keys.ctrl = e.ctrlKey
        const code = (typeof e.which === 'number') ? e.which : e.keyCode
        this.emit('keyup', code, this.keys)
    }
}