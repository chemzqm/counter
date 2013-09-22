
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var matches = require('matches-selector')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    if (matches(e.target, selector)) fn(e);\n\
  }, capture);\n\
  return callback;\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Properties to ignore appending \"px\".\n\
 */\n\
\n\
var ignore = {\n\
  columnCount: true,\n\
  fillOpacity: true,\n\
  fontWeight: true,\n\
  lineHeight: true,\n\
  opacity: true,\n\
  orphans: true,\n\
  widows: true,\n\
  zIndex: true,\n\
  zoom: true\n\
};\n\
\n\
/**\n\
 * Set `el` css values.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} obj\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, obj){\n\
  for (var key in obj) {\n\
    var val = obj[key];\n\
    if ('number' == typeof val && !ignore[key]) val += 'px';\n\
    el.style[key] = val;\n\
  }\n\
  return el;\n\
};\n\
//@ sourceURL=component-css/index.js"
));
require.register("component-sort/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `sort`.\n\
 */\n\
\n\
exports = module.exports = sort;\n\
\n\
/**\n\
 * Sort `el`'s children with the given `fn(a, b)`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function sort(el, fn) {\n\
  var arr = [].slice.call(el.children).sort(fn);\n\
  var frag = document.createDocumentFragment();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    frag.appendChild(arr[i]);\n\
  }\n\
  el.appendChild(frag);\n\
};\n\
\n\
/**\n\
 * Sort descending.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.desc = function(el, fn){\n\
  sort(el, function(a, b){\n\
    return ~fn(a, b) + 1;\n\
  });\n\
};\n\
\n\
/**\n\
 * Sort ascending.\n\
 */\n\
\n\
exports.asc = sort;\n\
//@ sourceURL=component-sort/index.js"
));
require.register("component-value/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var typeOf = require('type');\n\
\n\
/**\n\
 * Set or get `el`'s' value.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, val){\n\
  if (2 == arguments.length) return set(el, val);\n\
  return get(el);\n\
};\n\
\n\
/**\n\
 * Get `el`'s value.\n\
 */\n\
\n\
function get(el) {\n\
  switch (type(el)) {\n\
    case 'checkbox':\n\
    case 'radio':\n\
      if (el.checked) {\n\
        var attr = el.getAttribute('value');\n\
        return null == attr ? true : attr;\n\
      } else {\n\
        return false;\n\
      }\n\
    case 'radiogroup':\n\
      for (var i = 0, radio; radio = el[i]; i++) {\n\
        if (radio.checked) return radio.value;\n\
      }\n\
      break;\n\
    case 'select':\n\
      for (var i = 0, option; option = el.options[i]; i++) {\n\
        if (option.selected) return option.value;\n\
      }\n\
      break;\n\
    default:\n\
      return el.value;\n\
  }\n\
}\n\
\n\
/**\n\
 * Set `el`'s value.\n\
 */\n\
\n\
function set(el, val) {\n\
  switch (type(el)) {\n\
    case 'checkbox':\n\
    case 'radio':\n\
      if (val) {\n\
        el.checked = true;\n\
      } else {\n\
        el.checked = false;\n\
      }\n\
      break;\n\
    case 'radiogroup':\n\
      for (var i = 0, radio; radio = el[i]; i++) {\n\
        radio.checked = radio.value === val;\n\
      }\n\
      break;\n\
    case 'select':\n\
      for (var i = 0, option; option = el.options[i]; i++) {\n\
        option.selected = option.value === val;\n\
      }\n\
      break;\n\
    default:\n\
      el.value = val;\n\
  }\n\
}\n\
\n\
/**\n\
 * Element type.\n\
 */\n\
\n\
function type(el) {\n\
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);\n\
  if (group) el = el[0];\n\
  var name = el.nodeName.toLowerCase();\n\
  var type = el.getAttribute('type');\n\
\n\
  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';\n\
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';\n\
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';\n\
  if ('select' == name) return 'select';\n\
  return name;\n\
}\n\
//@ sourceURL=component-value/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matchesSelector\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("yields-traverse/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
var matches = require('matches-selector');\n\
\n\
/**\n\
 * Traverse with the given `el`, `selector` and `len`.\n\
 *\n\
 * @param {String} type\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {Number} len\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(type, el, selector, len){\n\
  var el = el[type]\n\
    , n = len || 1\n\
    , ret = [];\n\
\n\
  if (!el) return ret;\n\
\n\
  do {\n\
    if (n == ret.length) break;\n\
    if (1 != el.nodeType) continue;\n\
    if (matches(el, selector)) ret.push(el);\n\
    if (!selector) ret.push(el);\n\
  } while (el = el[type]);\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=yields-traverse/index.js"
));
require.register("component-dom/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var matches = require('matches-selector');\n\
var delegate = require('delegate');\n\
var classes = require('classes');\n\
var traverse = require('traverse');\n\
var indexof = require('indexof');\n\
var domify = require('domify');\n\
var events = require('event');\n\
var value = require('value');\n\
var query = require('query');\n\
var type = require('type');\n\
var css = require('css');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'type',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'style',\n\
  'width',\n\
  'height',\n\
  'action',\n\
  'method',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Expose `dom()`.\n\
 */\n\
\n\
exports = module.exports = dom;\n\
\n\
/**\n\
 * Expose supported attrs.\n\
 */\n\
\n\
exports.attrs = attrs;\n\
\n\
/**\n\
 * Return a dom `List` for the given\n\
 * `html`, selector, or element.\n\
 *\n\
 * @param {String|Element|List}\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
function dom(selector, context) {\n\
  // array\n\
  if (Array.isArray(selector)) {\n\
    return new List(selector);\n\
  }\n\
\n\
  // List\n\
  if (selector instanceof List) {\n\
    return selector;\n\
  }\n\
\n\
  // node\n\
  if (selector.nodeName) {\n\
    return new List([selector]);\n\
  }\n\
\n\
  if ('string' != typeof selector) {\n\
    throw new TypeError('invalid selector');\n\
  }\n\
\n\
  // html\n\
  if ('<' == selector.charAt(0)) {\n\
    return new List([domify(selector)], selector);\n\
  }\n\
\n\
  // selector\n\
  var ctx = context\n\
    ? (context.els ? context.els[0] : context)\n\
    : document;\n\
\n\
  return new List(query.all(selector, ctx), selector);\n\
}\n\
\n\
/**\n\
 * Expose `List` constructor.\n\
 */\n\
\n\
exports.List = List;\n\
\n\
/**\n\
 * Initialize a new `List` with the\n\
 * given array-ish of `els` and `selector`\n\
 * string.\n\
 *\n\
 * @param {Mixed} els\n\
 * @param {String} selector\n\
 * @api private\n\
 */\n\
\n\
function List(els, selector) {\n\
  this.els = els || [];\n\
  this.selector = selector;\n\
}\n\
\n\
/**\n\
 * Enumerable iterator.\n\
 */\n\
\n\
List.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.els.length },\n\
    get: function(i){ return new List([self.els[i]]) }\n\
  }\n\
};\n\
\n\
/**\n\
 * Remove elements from the DOM.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
List.prototype.remove = function(){\n\
  for (var i = 0; i < this.els.length; i++) {\n\
    var el = this.els[i];\n\
    var parent = el.parentNode;\n\
    if (parent) parent.removeChild(el);\n\
  }\n\
};\n\
\n\
/**\n\
 * Set attribute `name` to `val`, or get attr `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {String|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.attr = function(name, val){\n\
  // get\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0].getAttribute(name);\n\
  }\n\
\n\
  // remove\n\
  if (null == val) {\n\
    return this.removeAttr(name);\n\
  }\n\
\n\
  // set\n\
  return this.forEach(function(el){\n\
    el.setAttribute(name, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Remove attribute `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeAttr = function(name){\n\
  return this.forEach(function(el){\n\
    el.removeAttribute(name);\n\
  });\n\
};\n\
\n\
/**\n\
 * Set property `name` to `val`, or get property `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {Object|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prop = function(name, val){\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0][name];\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    el[name] = val;\n\
  });\n\
};\n\
\n\
/**\n\
 * Get the first element's value or set selected\n\
 * element values to `val`.\n\
 *\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.val =\n\
List.prototype.value = function(val){\n\
  if (0 == arguments.length) {\n\
    return this.els[0]\n\
      ? value(this.els[0])\n\
      : undefined;\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    value(el, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Return a cloned `List` with all elements cloned.\n\
 *\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.clone = function(){\n\
  var arr = [];\n\
  for (var i = 0, len = this.els.length; i < len; ++i) {\n\
    arr.push(this.els[i].cloneNode(true));\n\
  }\n\
  return new List(arr);\n\
};\n\
\n\
/**\n\
 * Prepend `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prepend = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    if (el.children.length) {\n\
      el.insertBefore(val.els[i], el.firstChild);\n\
    } else {\n\
      el.appendChild(val.els[i]);\n\
    }\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.append = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    el.appendChild(val.els[i]);\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append self's `el` to `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.appendTo = function(val){\n\
  dom(val).append(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Insert self's `els` after `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.insertAfter = function(val){\n\
  val = dom(val).els[0];\n\
  if (!val || !val.parentNode) return this;\n\
  this.forEach(function(el){\n\
    val.parentNode.insertBefore(el, val.nextSibling);\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the element at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.at = function(i){\n\
  return new List([this.els[i]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the first element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.first = function(){\n\
  return new List([this.els[0]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the last element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.last = function(){\n\
  return new List([this.els[this.els.length - 1]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return an `Element` at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.get = function(i){\n\
  return this.els[i || 0];\n\
};\n\
\n\
/**\n\
 * Return list length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.length = function(){\n\
  return this.els.length;\n\
};\n\
\n\
/**\n\
 * Return element text.\n\
 *\n\
 * @param {String} str\n\
 * @return {String|List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.text = function(str){\n\
  // TODO: real impl\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.textContent = str;\n\
    });\n\
    return this;\n\
  }\n\
\n\
  var str = '';\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    str += this.els[i].textContent;\n\
  }\n\
  return str;\n\
};\n\
\n\
/**\n\
 * Return element html.\n\
 *\n\
 * @return {String} html\n\
 * @api public\n\
 */\n\
\n\
List.prototype.html = function(html){\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.innerHTML = html;\n\
    });\n\
  }\n\
  // TODO: real impl\n\
  return this.els[0] && this.els[0].innerHTML;\n\
};\n\
\n\
/**\n\
 * Bind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then events are delegated.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.on = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.bind(this.els[i], event, fn, capture);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then delegated event\n\
 * handlers are unbound.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.off = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      // TODO: add selector support back\n\
      delegate.unbind(this.els[i], event, fn._delegate, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.unbind(this.els[i], event, fn, capture);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.each = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(new List([this.els[i]], this.selector), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(el, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.forEach = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(this.els[i], i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map elements invoking `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.map = function(fn){\n\
  var arr = [];\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    arr.push(fn(new List([this.els[i]], this.selector), i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a truthy value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.select =\n\
List.prototype.filter = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a falsey value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.reject = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (!fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Add the given class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.addClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given class `name`.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeClass = function(name){\n\
  var el;\n\
\n\
  if ('regexp' == type(name)) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      el = this.els[i];\n\
      el._classes = el._classes || classes(el);\n\
      var arr = el._classes.array();\n\
      for (var j = 0; j < arr.length; j++) {\n\
        if (name.test(arr[j])) {\n\
          el._classes.remove(arr[j]);\n\
        }\n\
      }\n\
    }\n\
    return this;\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.remove(name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle the given class `name`,\n\
 * optionally a `bool` may be given\n\
 * to indicate that the class should\n\
 * be added when truthy.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} bool\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.toggleClass = function(name, bool){\n\
  var el;\n\
  var fn = 'toggle';\n\
\n\
  // toggle with boolean\n\
  if (2 == arguments.length) {\n\
    fn = bool ? 'add' : 'remove';\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes[fn](name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if the given class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.hasClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    if (el._classes.has(name)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Set CSS `prop` to `val` or get `prop` value.\n\
 * Also accepts an object (`prop`: `val`)\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {List|String}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.css = function(prop, val){\n\
  if (2 == arguments.length) {\n\
    var obj = {};\n\
    obj[prop] = val;\n\
    return this.setStyle(obj);\n\
  }\n\
\n\
  if ('object' == type(prop)) {\n\
    return this.setStyle(prop);\n\
  }\n\
\n\
  return this.getStyle(prop);\n\
};\n\
\n\
/**\n\
 * Set CSS `props`.\n\
 *\n\
 * @param {Object} props\n\
 * @return {List} self\n\
 * @api private\n\
 */\n\
\n\
List.prototype.setStyle = function(props){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    css(this.els[i], props);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get CSS `prop` value.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
List.prototype.getStyle = function(prop){\n\
  var el = this.els[0];\n\
  if (el) return el.style[prop];\n\
};\n\
\n\
/**\n\
 * Find children matching the given `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.find = function(selector){\n\
  return dom(selector, this);\n\
};\n\
\n\
/**\n\
 * Empty the dom list\n\
 *\n\
 * @return self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.empty = function(){\n\
  var elem, el;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    while (el.firstChild) {\n\
      el.removeChild(el.firstChild);\n\
    }\n\
  }\n\
\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Check if the first element matches `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.is = function(selector){\n\
  return matches(this.get(0), selector);\n\
};\n\
\n\
/**\n\
 * Get parent(s) with optional `selector` and `limit`\n\
 *\n\
 * @param {String} selector\n\
 * @param {Number} limit\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.parent = function(selector, limit){\n\
  return new List(traverse('parentNode',\n\
    this.get(0),\n\
    selector,\n\
    limit\n\
    || 1));\n\
};\n\
\n\
/**\n\
 * Get next element(s) with optional `selector` and `limit`.\n\
 *\n\
 * @param {String} selector\n\
 * @param {Number} limit\n\
 * @retrun {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.next = function(selector, limit){\n\
  return new List(traverse('nextSibling',\n\
    this.get(0),\n\
    selector,\n\
    limit\n\
    || 1));\n\
};\n\
\n\
/**\n\
 * Get previous element(s) with optional `selector` and `limit`.\n\
 *\n\
 * @param {String} selector\n\
 * @param {Number} limit\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prev =\n\
List.prototype.previous = function(selector, limit){\n\
  return new List(traverse('previousSibling',\n\
    this.get(0),\n\
    selector,\n\
    limit\n\
    || 1));\n\
};\n\
\n\
/**\n\
 * Attribute accessors.\n\
 */\n\
\n\
attrs.forEach(function(name){\n\
  List.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attr(name);\n\
    return this.attr(name, val);\n\
  };\n\
});\n\
\n\
//@ sourceURL=component-dom/index.js"
));
require.register("counter/index.js", Function("exports, require, module",
"var dom = require ('dom');\n\
\n\
var styles = window.getComputedStyle;\n\
\n\
var itemHtml = '<li><div class=\"counter-wrapper\"><div></div><div></div><div></div></div></li>';\n\
/**\n\
 *\n\
 * @param {Node} parent node\n\
 * @param {Number} count [optional] charactor count, default 10 (10 million)\n\
 * @api public\n\
 */\n\
function Counter (parent, count) {\n\
  count = count || 10;\n\
  var el = dom('<ul class=\"counter\"></ul>');\n\
  el.appendTo(parent);\n\
  for (var i = 0; i < count; i++) {\n\
    dom(itemHtml).appendTo(el);\n\
  }\n\
  this.list = el.find('.counter-wrapper');\n\
  this.height = parseInt(styles(parent).height, 10);\n\
}\n\
\n\
function numberWithCommas(x) {\n\
  x = x || 0;\n\
  return x.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');\n\
}\n\
\n\
\n\
/**\n\
 * Set the digit value\n\
 *\n\
 * @param {Number} number\n\
 * @api public\n\
 */\n\
Counter.prototype.digit = function(number) {\n\
  this.pre = this.str;\n\
  this.str = numberWithCommas(number);\n\
  if (!this.pre) {\n\
    this.reset();\n\
  } else {\n\
    this.changeValues();\n\
  }\n\
}\n\
\n\
/**\n\
 * Set and show the current digit value\n\
 *\n\
 * @api rpivate\n\
 */\n\
Counter.prototype.changeValues = function() {\n\
  var cArr = this.str.split('').reverse();\n\
  var pArr = this.pre.split('').reverse();\n\
  var total = this.list.length();\n\
  this.list.addClass('counter-animate');\n\
  var self = this;\n\
  for (var i = 0; i < total; i++) {\n\
    var li = this.list.at(total - i - 1);\n\
    var cv = cArr[i];\n\
    var pv = pArr[i];\n\
    var divs = li.find('div');\n\
    if (cv) {\n\
      li.css('display', 'block');\n\
    } else {\n\
      li.css('display', 'none');\n\
    }\n\
    if (cv && pv) {\n\
      if (cv > pv) {\n\
        divs.first().html(cv);\n\
        li.css('top', '0px');\n\
      } else if (cv < pv) {\n\
        divs.last().html(cv);\n\
        li.css('top', (0 - this.height*2) + 'px');\n\
      }\n\
    } else if (cv) {\n\
      divs.at(1).html(cv);\n\
      li.css('top', (0 - this.height) + 'px');\n\
    }\n\
  }\n\
  setTimeout(function() {\n\
    self.reset();\n\
  }, 400);\n\
}\n\
\n\
/**\n\
 * reset the elements positions\n\
 *\n\
 * @api private\n\
 */\n\
Counter.prototype.reset = function() {\n\
  var self = this;\n\
  var preCount = this.list.length() - this.str.length;\n\
  this.list.removeClass('counter-animate');\n\
  this.list.css('top', (0 - this.height) + 'px');\n\
  this.list.each(function(li, i) {\n\
    if (i < preCount) {\n\
      li.css('display', 'none');\n\
    } else {\n\
      li.find('div').at(1).html(self.str[i - preCount]);\n\
    }\n\
  })\n\
}\n\
\n\
module.exports = Counter;\n\
//@ sourceURL=counter/index.js"
));












require.alias("component-dom/index.js", "counter/deps/dom/index.js");
require.alias("component-dom/index.js", "dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("counter/index.js", "counter/index.js");