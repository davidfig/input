const Ease = require('pixi-ease')

const Input = require('..')

let div, button, ease, keyboard, wheel, shows = []

const FADE_TIME = 1500

function test()
{
    const input = new Input({ div, keys: true, chromeDebug: true, preventDefault: true })
    input.on('down',
        function (x, y, data)
        {
            const show = document.createElement('div')
            div.appendChild(show)
            show.className = 'show'
            show.style.left = x + 'px'
            show.style.top = y + 'px'
            show.innerHTML = 'down'
            shows[data.id] = show
        })

    input.on('move',
        function (x, y, data)
        {
            const show = shows[data.id]
            if (show)
            {
                show.style.left = x + 'px'
                show.style.top = y + 'px'
                show.innerHTML = 'move'
            }
        })

    input.on('up',
        function (x, y, data)
        {
            const show = shows[data.id]
            if (show)
            {
                show.innerHTML = 'up'
                shows[data.id] = null
                ease.to(show.style, { opacity: 0 }, FADE_TIME, { ease: 'easeInOutSine' })
                    .on('done',
                        function ()
                        {
                            div.removeChild(show)
                        })
            }
        })
    input.on('click',
        function (x, y, data)
        {
            const show = shows[data.id]
            if (show)
            {
                show.innerHTML = 'clicked'
                shows[data.id] = null
                ease.to(show.style, { opacity: 0 }, FADE_TIME, { ease: 'easeInOutSine' })
                    .on('done',
                        function ()
                        {
                            div.removeChild(show)
                        })
            }
        })

    input.on('wheel',
        function (dx, dy, dz, data)
        {
            wheel.style.opacity = 1
            wheel.style.left = data.x + 'px'
            wheel.style.top = data.y + 'px'
            wheel.innerText = dx + ', ' + dy + ', ' + dz
            ease.remove(wheel.easing)
            wheel.easing = ease.to(wheel.style, { opacity: 0 }, FADE_TIME, { ease: 'easeInOutSine' })
            data.event.preventDefault()
        })
    input.on('keydown', (code, special) => key(code, special))
    input.on('keyup', (code, special) => key(code, special))

    button.onclick = function (e)
    {
        if (button.innerText === 'Remove Listeners')
        {
            button.innerText = 'Add Listeners'
            input.removePointers()
            input.removeKeyboard()
        }
        else
        {
            button.innerText = 'Remove Listeners'
            input.addPointers()
            input.addKeyboard()
        }
        e.stopPropagation()
    }
}

function key(code, special)
{
    let text = String.fromCharCode(code) + ' (' + code + ')'
    if (special.shift)
    {
        text += ' [SHIFT]'
    }
    if (special.meta)
    {
        text += ' [META]'
    }
    if (special.ctrl)
    {
        text += ' [CTRL]'
    }
    keyboard.innerText = text
}

window.onload = function ()
{
    ease = new Ease.list()
    div = document.getElementById('test')
    keyboard = document.getElementById('keyboard')
    button = document.getElementById('button')
    wheel = document.getElementById('wheel')
    test()
    ease.start()

    require('fork-me-github')('https://github.com/davidfig/input')
    require('./highlight')()
}