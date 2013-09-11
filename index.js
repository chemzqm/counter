var template = require('./template');
var domify = require ('domify');
var $ = require ('jquery');

/**
 *
 * @param {Node} parent node
 * @api public
 */
function Counter (parent) {
  var el = domify(template);
  parent.appendChild(el);
  this.height = $(el).height();
  this.list = $(el).find('.counter-wrapper');
  this.list.find('div').height(this.height);
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
    this.setValues();
  }
}

/**
 * Set and show the current digit value
 *
 * @api rpivate
 */
Counter.prototype.setValues = function() {
  var cArr = this.str.split('').reverse();
  var pArr = this.pre.split('').reverse();
  var total = this.list.length;
  this.list.addClass('counter-animate');
  var self = this;
  for (var i = 0; i < total; i++) {
    var li = this.list.eq(total - i - 1);
    var cv = cArr[i];
    var pv = pArr[i];
    var divs = li.find('div');
    if (cv) {
      li.show();
    } else {
      li.hide();
    }
    if (cv && pv) {
      if (cv > pv) {
        divs.eq(0).html(cv);
        li.css('top', '0px');
      } else if (cv < pv) {
        divs.eq(2).html(cv);
        li.css('top', (0 - this.height*2) + 'px');
      }
    } else if (cv) {
      divs.eq(1).html(cv);
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
  var preCount = this.list.length - this.str.length;
  this.list.removeClass('counter-animate');
  this.list.css('top', (0 - this.height) + 'px')
  .each(function(i) {
    if (i < preCount) {
      $(this).hide();
    } else {
      $(this).find('div').get(1).innerHTML = self.str[i - preCount];
    }
  })
}

module.exports = Counter;
