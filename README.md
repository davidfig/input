# shape-points
Generate points for simple shapes and curves: arcs, rectangles, rounded rectangles, circles, ellipses, bezierCurveTo, bezierCurveThrough (i.e., bezier curves through specific points)

## rationale

I needed to find the points of a rounded rectangle. Then I had fun adding lots of other shapes and curves.

## installation

    npm i shape-points

## programmatic example

    const ShapePoints = require('shape-points')
    ShapePoints.pointsInArc = 10 // sets number of points for arcs
    
    const points = ShapePoints.roundedRect(125, 100, 200, 100, 30)

    // assuming a canvas context was set up
    context.moveTo(points[0], points[1])
    for (let i = 2; i < points.length; i += 2)
    {
        context.lineTo(points[i], points[i + 1])
    }
    context.stroke()

## live example
https://davidfig.github.io/shape-points/

## API
```
    /**
     * basic input support for touch, mouse, and keyboard
     * @param {HTMLElement} object to attach listener to
     * @param {object} [options]
     * @param {boolean} [options.keys] turn on key listener
     * @param {boolean} [options.chromeDebug] ignore chrome debug keys, and force page reload with ctrl/cmd+r
     */
    constructor(div, options)

    /**
     * helper function to find touch from list based on id
     * @param  {number} id for saved touch
     * @return {object}
     */
    findTouch(id)

    /**
     * helper function to remove touch from touch list
     * @private
     * @param  {object} touch object
     */
    removeTouch(id)

    /**
     * Handle touch start
     * @param  {object} e touch event
     */
    touchStart(e)

    /**
     * Handle touch move
     * @param  {object} e touch event
     */
    touchMove(e)

    /**
     * Handle touch end
     * @param  {object} e touch event
     */
    touchEnd(e)

    /**
     * Handle mouse down
     * @param  {object} e touch event
     */
    mouseDown(e)

    /**
     * Handle mouse move
     * @param  {object} e touch event
     */
    mouseMove(e)

    /**
     * Handle mouse up
     * @param  {object} e touch event
     */
    mouseUp(e)

    /**
     * Sets event listener for keyboard
     */
    keysListener()

    /**
     * @param  {object} e
     */
    keydown(e)

    /**
     * Handle key up
     * @param  {object}
     */
    keyup(e)
```
## License  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
