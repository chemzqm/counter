# Counter

  A simple counter with number change animation for component

## Installation

  Install with [component(1)](http://component.io):

    $ component install chemzqm/counter

## API

### new Counter(parentNode)

Init new Counter in parentNode.

### .digit(number)

Set the display integer of Counter.

## Example

``` js
var Counter = require('counter');
var p = document.getElementById('counter');
var counter = new Counter(p);
counter.digit(13764324);)
```

## License

  MIT
