const Ease = require('pixi-ease')
const Update = require('yy-update')

const Input = require('..')

let div, show, down, hold, click, ease, fadeUp, fadeClick

const FADE_TIME = 1500

function test()
{
    const input = new Input(div, { keys: true, chromeDebug: true })
    input.on('down',
        function (x, y)
        {
            ease.remove(fadeUp)
            hold.style.opacity = 1
            hold.style.left = x + 'px'
            hold.style.top = y + 'px'
            hold.innerHTML = 'down'
            down = true
            show.innerText = x + ', ' + y
        })

    input.on('move',
        function (x, y)
        {
            if (down)
            {
                hold.style.left = x + 'px'
                hold.style.top = y + 'px'
                hold.innerHTML = 'move'
            }
            show.innerText = x + ', ' + y
        })

    input.on('up',
        function (x, y)
        {
            if (down)
            {
                hold.innerHTML = 'up'
                fadeUp = ease.add(new Ease.to(hold.style, {opacity: 0}, FADE_TIME, { ease: 'easeInOutSine'}))
            }
            down = false
            show.innerText = x + ', ' + y
        })
    input.on('click',
        function (x, y)
        {
            ease.remove(fadeClick)
            click.innerText = 'clicked'
            click.style.opacity = 1
            click.style.left = x + 'px'
            click.style.top = y + 'px'
            fadeClick = ease.add(new Ease.to(click.style, {opacity: 0}, FADE_TIME, {ease: 'easeInOutSine'}))
        })


    input.on('keydown', (code, special) => { show.style.textDecoration = 'none'; key(code, special) })
    input.on('keyup', (code, special) => { show.style.textDecoration = 'underline'; key(code, special) })
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
    show.innerText = text
}

window.onload = function ()
{
    ease = new Ease.list()
    Update.init()
    Update.add((elapsed) => ease.update(elapsed))

    div = document.getElementById('test')
    show = document.getElementById('show')
    hold = document.getElementById('hold')
    click = document.getElementById('click')

    test()

    Update.update()

    require('fork-me-github')('https://github.com/davidfig/input')
    require('./highlight')()
}