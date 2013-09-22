# Counter

  A simple counter with number change animation for component

  [Demo](http://chemzqm.github.io/counter/index.html)

## Installation

  Install with [component(1)](http://component.io):

    $ component install chemzqm/counter

## API

### new Counter(parentNode, [count])

Init new Counter in parentNode and optional charactor count (default 10).

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
