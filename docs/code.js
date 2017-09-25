const Input = require('..')

let div, show, down

function test()
{
    const input = new Input(div, { keys: true, chromeDebug: true })
    input.on('down',
        function (x, y)
        {
            down = true
            show.style.textDecoration = 'underline'
            show.innerText = x + ', ' + y
        })

    input.on('move',
        function (x, y)
        {
            show.style.textDecoration = down ? 'underline' : 'none'
            show.innerText = x + ', ' + y
        })

    input.on('up',
        function (x, y)
        {
            down = false
            show.style.textDecoration = 'none'
            show.innerText = x + ', ' + y
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
    div = document.getElementById('test')

    show = document.getElementById('show')

    test()

    require('fork-me-github')('https://github.com/davidfig/input')
    require('./highlight')()
}