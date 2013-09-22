var dom = require ('dom');

var styles = window.getComputedStyle;

var itemHtml = '<li><div class="counter-wrapper"><div></div><div></div><div></div></div></li>';
/**
 *
 * @param {Node} parent node
 * @param {Number} count [optional] charactor count, default 10 (10 million)
 * @api public
 */
function Counter (parent, count) {
  count = count || 10;
  var el = dom('<ul class="counter"></ul>');
  el.appendTo(parent);
  for (var i = 0; i < count; i++) {
    dom(itemHtml).appendTo(el);
  }
  this.list = el.find('.counter-wrapper');
  this.height = parseInt(styles(parent).height, 10);
}

function numberWithCommas(x) {
  x = x || 0;
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


/**
 * Set the digit value
 *
 * @param {Number} number
 * @api public
 */
Counter.prototype.digit = function(number) {
  this.pre = this.str;
  this.str = numberWithCommas(number);
  if (!this.pre) {
    this.reset();
  } else {
    this.changeValues();
  }
}

/**
 * Set and show the current digit value
 *
 * @api rpivate
 */
Counter.prototype.changeValues = function() {
  var cArr = this.str.split('').reverse();
  var pArr = this.pre.split('').reverse();
  var total = this.list.length();
  this.list.addClass('counter-animate');
  var self = this;
  for (var i = 0; i < total; i++) {
    var li = this.list.at(total - i - 1);
    var cv = cArr[i];
    var pv = pArr[i];
    var divs = li.find('div');
    if (cv) {
      li.css('display', 'block');
    } else {
      li.css('display', 'none');
    }
    if (cv && pv) {
      if (cv > pv) {
        divs.first().html(cv);
        li.css('top', '0px');
      } else if (cv < pv) {
        divs.last().html(cv);
        li.css('top', (0 - this.height*2) + 'px');
      }
    } else if (cv) {
      divs.at(1).html(cv);
      li.css('top', (0 - this.height) + 'px');
    }
  }
  setTimeout(function() {
    self.reset();
  }, 400);
}

/**
 * reset the elements positions
 *
 * @api private
 */
Counter.prototype.reset = function() {
  var self = this;
  var preCount = this.list.length() - this.str.length;
  this.list.removeClass('counter-animate');
  this.list.css('top', (0 - this.height) + 'px');
  this.list.each(function(li, i) {
    if (i < preCount) {
      li.css('display', 'none');
    } else {
      li.find('div').at(1).html(self.str[i - preCount]);
    }
  })
}

module.exports = Counter;
