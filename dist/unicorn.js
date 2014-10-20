;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

},{}],2:[function(require,module,exports){

var synth = require('synthetic-dom-events');

var on = function(element, name, fn, capture) {
    return element.addEventListener(name, fn, capture || false);
};

var off = function(element, name, fn, capture) {
    return element.removeEventListener(name, fn, capture || false);
};

var once = function (element, name, fn, capture) {
    function tmp (ev) {
        off(element, name, tmp, capture);
        fn(ev);
    }
    on(element, name, tmp, capture);
};

var emit = function(element, name, opt) {
    var ev = synth(name, opt);
    element.dispatchEvent(ev);
};

if (!document.addEventListener) {
    on = function(element, name, fn) {
        return element.attachEvent('on' + name, fn);
    };
}

if (!document.removeEventListener) {
    off = function(element, name, fn) {
        return element.detachEvent('on' + name, fn);
    };
}

if (!document.dispatchEvent) {
    emit = function(element, name, opt) {
        var ev = synth(name, opt);
        return element.fireEvent('on' + ev.type, ev);
    };
}

module.exports = {
    on: on,
    off: off,
    once: once,
    emit: emit
};

},{"synthetic-dom-events":3}],3:[function(require,module,exports){

// for compression
var win = window;
var doc = document || {};
var root = doc.documentElement || {};

// detect if we need to use firefox KeyEvents vs KeyboardEvents
var use_key_event = true;
try {
    doc.createEvent('KeyEvents');
}
catch (err) {
    use_key_event = false;
}

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
function check_kb(ev, opts) {
    if (ev.ctrlKey != (opts.ctrlKey || false) ||
        ev.altKey != (opts.altKey || false) ||
        ev.shiftKey != (opts.shiftKey || false) ||
        ev.metaKey != (opts.metaKey || false) ||
        ev.keyCode != (opts.keyCode || 0) ||
        ev.charCode != (opts.charCode || 0)) {

        ev = document.createEvent('Event');
        ev.initEvent(opts.type, opts.bubbles, opts.cancelable);
        ev.ctrlKey  = opts.ctrlKey || false;
        ev.altKey   = opts.altKey || false;
        ev.shiftKey = opts.shiftKey || false;
        ev.metaKey  = opts.metaKey || false;
        ev.keyCode  = opts.keyCode || 0;
        ev.charCode = opts.charCode || 0;
    }

    return ev;
}

// modern browsers, do a proper dispatchEvent()
var modern = function(type, opts) {
    opts = opts || {};

    // which init fn do we use
    var family = typeOf(type);
    var init_fam = family;
    if (family === 'KeyboardEvent' && use_key_event) {
        family = 'KeyEvents';
        init_fam = 'KeyEvent';
    }

    var ev = doc.createEvent(family);
    var init_fn = 'init' + init_fam;
    var init = typeof ev[init_fn] === 'function' ? init_fn : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = type;
    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        used[key] = true;
        args.push(val);
    }
    ev[init].apply(ev, args);

    // webkit key event issue workaround
    if (family === 'KeyboardEvent') {
        ev = check_kb(ev, opts);
    }

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

var legacy = function (type, opts) {
    opts = opts || {};
    var ev = doc.createEventObject();

    ev.type = type;
    for (var key in opts) {
        if (opts[key] !== undefined) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

// expose either the modern version of event generation or legacy
// depending on what we support
// avoids if statements in the code later
module.exports = doc.createEvent ? modern : legacy;

var initSignatures = require('./init.json');
var types = require('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":4,"./types.json":5}],4:[function(require,module,exports){
module.exports=module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyboardEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],5:[function(require,module,exports){
module.exports=module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyboardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvents" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],6:[function(require,module,exports){
/*!
 * object-extend
 * A well-tested function to deep extend (or merge) JavaScript objects without further dependencies.
 *
 * http://github.com/bernhardw
 *
 * Copyright 2013, Bernhard Wanger <mail@bernhardwanger.com>
 * Released under the MIT license.
 *
 * Date: 2013-04-10
 */


/**
 * Extend object a with object b.
 *
 * @param {Object} a Source object.
 * @param {Object} b Object to extend with.
 * @returns {Object} a Extended object.
 */
module.exports = function extend(a, b) {

    // Don't touch 'null' or 'undefined' objects.
    if (a == null || b == null) {
        return a;
    }

    // TODO: Refactor to use for-loop for performance reasons.
    Object.keys(b).forEach(function (key) {

        // Detect object without array, date or null.
        // TODO: Performance test:
        // a) b.constructor === Object.prototype.constructor
        // b) Object.prototype.toString.call(b) == '[object Object]'
        if (Object.prototype.toString.call(b[key]) == '[object Object]') {
            if (Object.prototype.toString.call(a[key]) != '[object Object]') {
                a[key] = b[key];
            } else {
                a[key] = extend(a[key], b[key]);
            }
        } else {
            a[key] = b[key];
        }

    });

    return a;

};
},{}],7:[function(require,module,exports){
module.exports = exports = require('./lib/sliced');

},{"./lib/sliced":8}],8:[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],9:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = throttle;

/**
 * Returns a new function that, when invoked, invokes `func` at most one time per
 * `wait` milliseconds.
 *
 * @param {Function} func The `Function` instance to wrap.
 * @param {Number} wait The minimum number of milliseconds that must elapse in between `func` invokations.
 * @return {Function} A new function that wraps the `func` function passed in.
 * @api public
 */

function throttle (func, wait) {
  var rtn; // return value
  var last = 0; // last invokation timestamp
  return function throttled () {
    var now = new Date().getTime();
    var delta = now - last;
    if (delta >= wait) {
      rtn = func.apply(this, arguments);
      last = now;
    }
    return rtn;
  };
}

},{}],10:[function(require,module,exports){
module.exports = require('./lib/type');

},{"./lib/type":11}],11:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType(obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library() {
  if (!(this instanceof Library)) return new Library();
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function(type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function(obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],12:[function(require,module,exports){
var sliced = require('sliced'),
  type = require('type-detect'),
  split = require("./util/split.js");


var conditions = {};

function addCondition(name, func) {
  if (conditions[name] === undefined) conditions[name] = [];
  conditions[name].push(func);
}

// u.conditions.add("isMobile", function() { return window.innerWidth < 720; })
// u.conditions.add({
//    isRetina: function() { // retina test },
//    isHD: u.debounce(function() { return window.width() >= 1920 && window.height() >= 1080; }, 300)
// })
function add(name, func) {
  var args = sliced(arguments);

  // u.conditions.add(obj);
  if (type(args[0]) === 'object') {
    for (var prop in args[0]) {
      addCondition(prop, args[0][prop]);
    }

  // u.conditions.add(string, func/bool)
  } else if (type(args[0]) === 'string') {
    // u.conditions.add("isMobile", function() { return window.width() > 720; });
    // u.conditions.add("isLarge", function() { return window.width() < 1280; });
    var names = split(args[0]);

    names.forEach(function(name) {
      addCondition(name, args[1]);
    });
  }
}

/*
  Remove Functions

  removes one or more conditions from the
*/


function removeCondition(name) {
  delete conditions[name];
}

function removeConditionFunction(name, func) {
  // logic to remove specific function from callback array
}

// u.conditions.remove("isRetina")
// u.conditions.remove("isMobile isLarge")
function remove(names) {
  // if (names === undefined) throw new Error();
  split(names).forEach(function(name) {
    removeCondition(name);
  });
}

/*
  Test Functions

  takes condition(s) and returns boolean based on result
*/

// u.conditions.test("isRetina") ==> true/false
// alias: test
function test(name) {
  if (name === undefined) return false;
  var invert = name.indexOf("!") !== -1 ? true : false,
    subTests;

  name = invert ? name.substr(1) : name;

  if (conditions[name] !== undefined) {
    subTests = conditions[name].map(function(condition) {
      if (type(condition) === 'function')
        return condition() !== invert;
      return condition !== invert;
    });
  }

  return subTests !== undefined && subTests.indexOf(false) === -1;
}

// u.conditions.testAll("isRetina isMobile isHD") ==> [true, true, false]
function testAll(names) {
  return split(names).map(function(name) {
    return test(name);
  });
}

// u.conditions.testOr("isRetina isMobile") ==> true/false
function testOr(names) {
  return testAll(names).some(function(name) { return name; });
}

// u.conditions.testAnd("isRetina isMobile") ==> true/false
function testAnd(names) {
  return testAll(names).every(function(name) { return name; });
}


// exports
exports.add = add;
exports.remove = remove;
exports.test = test;
exports.testAll = testAll;
exports.testOr = testOr;

},{"./util/split.js":15,"sliced":7,"type-detect":10}],13:[function(require,module,exports){
var dom = require('dom-events'),
  timer = require('./util/timers.js');

exports.dom = dom;
exports.timer = timer;
},{"./util/timers.js":16,"dom-events":2}],14:[function(require,module,exports){
var sliced = require('sliced'),
  type = require('type-detect'),
  split = require('./util/split.js'),
  conditions = require('./core.conditions.js');


var respondIf = function respondIf (name, func) {  
  if (type(name) === 'boolean' && name) {
    return func();
  }
};


module.exports = {
  respond: function(condition, func, args) {
    var args = sliced(arguments);
    
    if (type(args[0]) === 'object') {
      
    } else if (type(args[0]) === 'string') {
      if (conditions.test(condition)) func.apply(this, args.slice(2));
    }
    
    console.log(conditions.test(condition))


  },
  respondOnce: function() {},
  respondWhen: function() {},
  respondWhile: function() {}
}


/*
  unicorn.prototype.respond = function(condition, func) {
    var result = null;
    if (isFunction(condition) && !condition.call(this)) return;
    if (isString(condition) && !respondIf.call(this, condition)) return;
    
    if (isFunction(func)) {
      func();
    } else if (isArray(func)) {
      for(var i = 0; i < func.length; i++) {
        func[i]();
      }
    }
  }
*/
},{"./core.conditions.js":12,"./util/split.js":15,"sliced":7,"type-detect":10}],15:[function(require,module,exports){
module.exports = function(string) {
  return string.split(" ");
};
},{}],16:[function(require,module,exports){
exports.delay = setTimeout;
exports.repeat = setInterval;

exports.clear = function(tid) {
  clearTimeout(tid);
  clearInterval(tid);
}
},{}],17:[function(require,module,exports){
var extend = require('object-extend');

var conditions = require("./core/core.conditions.js"),
	runners = require("./core/core.runners.js"),
	events = require("./core/core.events.js");

var unicorn = function() {
  this._events = events;
  this._conditions = conditions;
 // this._runners = runners;

  this.debounce = require('debounce');
  this.throttle = require('throttleit');

  this.addCondition = conditions.add;
  this.testCondition = conditions.test;

  extend(this, runners);
};

window.unicorn = window.u = new unicorn();
module.exports = unicorn;

/*

u.conditions.add("isMobile", function() { return window.width() > 720; });
u.conditions.add("isLarge", function() { return window.width() < 1280; });
u.conditions.add({
    isRetina: function() { // retina test },
    isHD: function() { return window.width() >= 1920 && window.height() >= 1080; }.debounce(300)
});

u.conditions.remove("isRetina");
u.conditions.remove("isMobile isLarge");

u.conditions.test("isRetina") ==> true/false

u.condition() => forms: {
    obj ==> u.conditions.add(obj) form
    string, func ==> u.conditions.add(string, func) form
    string ==> u.conditions.test("string string string") form
}



u.events.on(".app", "hover", "isMobile");
u.events.once(window, "resize", "isMobile isLarge");



u.events.off(".app", "hover", "isLarge");
u.events.off(".app", "hover");


u.when("isMobile", function() {});
u.when("isMobile", function() {});


u = {
	_events,
	_conditions,

	throttle,
	debounce,

	addCondition,
	testCondition

	respond
	once,
	when,
	while

}

*/

},{"./core/core.conditions.js":12,"./core/core.events.js":13,"./core/core.runners.js":14,"debounce":1,"object-extend":6,"throttleit":9}]},{},[12,13,14,15,16,17])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvZGVib3VuY2UvaW5kZXguanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvZG9tLWV2ZW50cy9pbmRleC5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbmRleC5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbml0Lmpzb24iLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvZG9tLWV2ZW50cy9ub2RlX21vZHVsZXMvc3ludGhldGljLWRvbS1ldmVudHMvdHlwZXMuanNvbiIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL25vZGVfbW9kdWxlcy9vYmplY3QtZXh0ZW5kL2xpYi9leHRlbmQuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvc2xpY2VkL2luZGV4LmpzIiwiL1VzZXJzL2V2YW4vU2l0ZXMvaWw3L3VuaWNvcm4uanMvbm9kZV9tb2R1bGVzL3NsaWNlZC9saWIvc2xpY2VkLmpzIiwiL1VzZXJzL2V2YW4vU2l0ZXMvaWw3L3VuaWNvcm4uanMvbm9kZV9tb2R1bGVzL3Rocm90dGxlaXQvaW5kZXguanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvdHlwZS1kZXRlY3QvaW5kZXguanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvdHlwZS1kZXRlY3QvbGliL3R5cGUuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9zb3VyY2UvY29yZS9jb3JlLmNvbmRpdGlvbnMuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9zb3VyY2UvY29yZS9jb3JlLmV2ZW50cy5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL3NvdXJjZS9jb3JlL2NvcmUucnVubmVycy5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL3NvdXJjZS9jb3JlL3V0aWwvc3BsaXQuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9zb3VyY2UvY29yZS91dGlsL3RpbWVycy5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL3NvdXJjZS91bmljb3JuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERlYm91bmNlcyBhIGZ1bmN0aW9uIGJ5IHRoZSBnaXZlbiB0aHJlc2hvbGQuXG4gKlxuICogQHNlZSBodHRwOi8vdW5zY3JpcHRhYmxlLmNvbS8yMDA5LzAzLzIwL2RlYm91bmNpbmctamF2YXNjcmlwdC1tZXRob2RzL1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY3Rpb24gdG8gd3JhcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXQgaW4gbXMgKGAxMDBgKVxuICogQHBhcmFtIHtCb29sZWFufSB3aGV0aGVyIHRvIGV4ZWN1dGUgYXQgdGhlIGJlZ2lubmluZyAoYGZhbHNlYClcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB0aHJlc2hvbGQsIGV4ZWNBc2FwKXtcbiAgdmFyIHRpbWVvdXQ7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZCgpe1xuICAgIHZhciBvYmogPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgZnVuY3Rpb24gZGVsYXllZCAoKSB7XG4gICAgICBpZiAoIWV4ZWNBc2FwKSB7XG4gICAgICAgIGZ1bmMuYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgfSBlbHNlIGlmIChleGVjQXNhcCkge1xuICAgICAgZnVuYy5hcHBseShvYmosIGFyZ3MpO1xuICAgIH1cblxuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGRlbGF5ZWQsIHRocmVzaG9sZCB8fCAxMDApO1xuICB9O1xufTtcbiIsIlxudmFyIHN5bnRoID0gcmVxdWlyZSgnc3ludGhldGljLWRvbS1ldmVudHMnKTtcblxudmFyIG9uID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZm4sIGNhcHR1cmUpIHtcbiAgICByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbn07XG5cbnZhciBvZmYgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbiwgY2FwdHVyZSkge1xuICAgIHJldHVybiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xufTtcblxudmFyIG9uY2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgbmFtZSwgZm4sIGNhcHR1cmUpIHtcbiAgICBmdW5jdGlvbiB0bXAgKGV2KSB7XG4gICAgICAgIG9mZihlbGVtZW50LCBuYW1lLCB0bXAsIGNhcHR1cmUpO1xuICAgICAgICBmbihldik7XG4gICAgfVxuICAgIG9uKGVsZW1lbnQsIG5hbWUsIHRtcCwgY2FwdHVyZSk7XG59O1xuXG52YXIgZW1pdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIG9wdCkge1xuICAgIHZhciBldiA9IHN5bnRoKG5hbWUsIG9wdCk7XG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2KTtcbn07XG5cbmlmICghZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIG9uID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIG5hbWUsIGZuKTtcbiAgICB9O1xufVxuXG5pZiAoIWRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBvZmYgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbikge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgbmFtZSwgZm4pO1xuICAgIH07XG59XG5cbmlmICghZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCkge1xuICAgIGVtaXQgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBvcHQpIHtcbiAgICAgICAgdmFyIGV2ID0gc3ludGgobmFtZSwgb3B0KTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuZmlyZUV2ZW50KCdvbicgKyBldi50eXBlLCBldik7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgb246IG9uLFxuICAgIG9mZjogb2ZmLFxuICAgIG9uY2U6IG9uY2UsXG4gICAgZW1pdDogZW1pdFxufTtcbiIsIlxuLy8gZm9yIGNvbXByZXNzaW9uXG52YXIgd2luID0gd2luZG93O1xudmFyIGRvYyA9IGRvY3VtZW50IHx8IHt9O1xudmFyIHJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50IHx8IHt9O1xuXG4vLyBkZXRlY3QgaWYgd2UgbmVlZCB0byB1c2UgZmlyZWZveCBLZXlFdmVudHMgdnMgS2V5Ym9hcmRFdmVudHNcbnZhciB1c2Vfa2V5X2V2ZW50ID0gdHJ1ZTtcbnRyeSB7XG4gICAgZG9jLmNyZWF0ZUV2ZW50KCdLZXlFdmVudHMnKTtcbn1cbmNhdGNoIChlcnIpIHtcbiAgICB1c2Vfa2V5X2V2ZW50ID0gZmFsc2U7XG59XG5cbi8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNjczNVxuZnVuY3Rpb24gY2hlY2tfa2IoZXYsIG9wdHMpIHtcbiAgICBpZiAoZXYuY3RybEtleSAhPSAob3B0cy5jdHJsS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5hbHRLZXkgIT0gKG9wdHMuYWx0S2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5zaGlmdEtleSAhPSAob3B0cy5zaGlmdEtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYubWV0YUtleSAhPSAob3B0cy5tZXRhS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5rZXlDb2RlICE9IChvcHRzLmtleUNvZGUgfHwgMCkgfHxcbiAgICAgICAgZXYuY2hhckNvZGUgIT0gKG9wdHMuY2hhckNvZGUgfHwgMCkpIHtcblxuICAgICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICBldi5pbml0RXZlbnQob3B0cy50eXBlLCBvcHRzLmJ1YmJsZXMsIG9wdHMuY2FuY2VsYWJsZSk7XG4gICAgICAgIGV2LmN0cmxLZXkgID0gb3B0cy5jdHJsS2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5hbHRLZXkgICA9IG9wdHMuYWx0S2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5zaGlmdEtleSA9IG9wdHMuc2hpZnRLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2Lm1ldGFLZXkgID0gb3B0cy5tZXRhS2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5rZXlDb2RlICA9IG9wdHMua2V5Q29kZSB8fCAwO1xuICAgICAgICBldi5jaGFyQ29kZSA9IG9wdHMuY2hhckNvZGUgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59XG5cbi8vIG1vZGVybiBicm93c2VycywgZG8gYSBwcm9wZXIgZGlzcGF0Y2hFdmVudCgpXG52YXIgbW9kZXJuID0gZnVuY3Rpb24odHlwZSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgLy8gd2hpY2ggaW5pdCBmbiBkbyB3ZSB1c2VcbiAgICB2YXIgZmFtaWx5ID0gdHlwZU9mKHR5cGUpO1xuICAgIHZhciBpbml0X2ZhbSA9IGZhbWlseTtcbiAgICBpZiAoZmFtaWx5ID09PSAnS2V5Ym9hcmRFdmVudCcgJiYgdXNlX2tleV9ldmVudCkge1xuICAgICAgICBmYW1pbHkgPSAnS2V5RXZlbnRzJztcbiAgICAgICAgaW5pdF9mYW0gPSAnS2V5RXZlbnQnO1xuICAgIH1cblxuICAgIHZhciBldiA9IGRvYy5jcmVhdGVFdmVudChmYW1pbHkpO1xuICAgIHZhciBpbml0X2ZuID0gJ2luaXQnICsgaW5pdF9mYW07XG4gICAgdmFyIGluaXQgPSB0eXBlb2YgZXZbaW5pdF9mbl0gPT09ICdmdW5jdGlvbicgPyBpbml0X2ZuIDogJ2luaXRFdmVudCc7XG5cbiAgICB2YXIgc2lnID0gaW5pdFNpZ25hdHVyZXNbaW5pdF07XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICB2YXIgdXNlZCA9IHt9O1xuXG4gICAgb3B0cy50eXBlID0gdHlwZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0gc2lnW2ldO1xuICAgICAgICB2YXIgdmFsID0gb3B0c1trZXldO1xuICAgICAgICAvLyBpZiBubyB1c2VyIHNwZWNpZmllZCB2YWx1ZSwgdGhlbiB1c2UgZXZlbnQgZGVmYXVsdFxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbCA9IGV2W2tleV07XG4gICAgICAgIH1cbiAgICAgICAgdXNlZFtrZXldID0gdHJ1ZTtcbiAgICAgICAgYXJncy5wdXNoKHZhbCk7XG4gICAgfVxuICAgIGV2W2luaXRdLmFwcGx5KGV2LCBhcmdzKTtcblxuICAgIC8vIHdlYmtpdCBrZXkgZXZlbnQgaXNzdWUgd29ya2Fyb3VuZFxuICAgIGlmIChmYW1pbHkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICBldiA9IGNoZWNrX2tiKGV2LCBvcHRzKTtcbiAgICB9XG5cbiAgICAvLyBhdHRhY2ggcmVtYWluaW5nIHVudXNlZCBvcHRpb25zIHRvIHRoZSBvYmplY3RcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cykge1xuICAgICAgICBpZiAoIXVzZWRba2V5XSkge1xuICAgICAgICAgICAgZXZba2V5XSA9IG9wdHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldjtcbn07XG5cbnZhciBsZWdhY3kgPSBmdW5jdGlvbiAodHlwZSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHZhciBldiA9IGRvYy5jcmVhdGVFdmVudE9iamVjdCgpO1xuXG4gICAgZXYudHlwZSA9IHR5cGU7XG4gICAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcbiAgICAgICAgaWYgKG9wdHNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBldltrZXldID0gb3B0c1trZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufTtcblxuLy8gZXhwb3NlIGVpdGhlciB0aGUgbW9kZXJuIHZlcnNpb24gb2YgZXZlbnQgZ2VuZXJhdGlvbiBvciBsZWdhY3lcbi8vIGRlcGVuZGluZyBvbiB3aGF0IHdlIHN1cHBvcnRcbi8vIGF2b2lkcyBpZiBzdGF0ZW1lbnRzIGluIHRoZSBjb2RlIGxhdGVyXG5tb2R1bGUuZXhwb3J0cyA9IGRvYy5jcmVhdGVFdmVudCA/IG1vZGVybiA6IGxlZ2FjeTtcblxudmFyIGluaXRTaWduYXR1cmVzID0gcmVxdWlyZSgnLi9pbml0Lmpzb24nKTtcbnZhciB0eXBlcyA9IHJlcXVpcmUoJy4vdHlwZXMuanNvbicpO1xudmFyIHR5cGVPZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHR5cHMgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdHlwZXMpIHtcbiAgICAgICAgdmFyIHRzID0gdHlwZXNba2V5XTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHlwc1t0c1tpXV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cHNbbmFtZV0gfHwgJ0V2ZW50JztcbiAgICB9O1xufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzPW1vZHVsZS5leHBvcnRzPXtcbiAgXCJpbml0RXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIlxuICBdLFxuICBcImluaXRVSUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJkZXRhaWxcIlxuICBdLFxuICBcImluaXRNb3VzZUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJkZXRhaWxcIixcbiAgICBcInNjcmVlblhcIixcbiAgICBcInNjcmVlbllcIixcbiAgICBcImNsaWVudFhcIixcbiAgICBcImNsaWVudFlcIixcbiAgICBcImN0cmxLZXlcIixcbiAgICBcImFsdEtleVwiLFxuICAgIFwic2hpZnRLZXlcIixcbiAgICBcIm1ldGFLZXlcIixcbiAgICBcImJ1dHRvblwiLFxuICAgIFwicmVsYXRlZFRhcmdldFwiXG4gIF0sXG4gIFwiaW5pdE11dGF0aW9uRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInJlbGF0ZWROb2RlXCIsXG4gICAgXCJwcmV2VmFsdWVcIixcbiAgICBcIm5ld1ZhbHVlXCIsXG4gICAgXCJhdHRyTmFtZVwiLFxuICAgIFwiYXR0ckNoYW5nZVwiXG4gIF0sXG4gIFwiaW5pdEtleWJvYXJkRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImN0cmxLZXlcIixcbiAgICBcImFsdEtleVwiLFxuICAgIFwic2hpZnRLZXlcIixcbiAgICBcIm1ldGFLZXlcIixcbiAgICBcImtleUNvZGVcIixcbiAgICBcImNoYXJDb2RlXCJcbiAgXSxcbiAgXCJpbml0S2V5RXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImN0cmxLZXlcIixcbiAgICBcImFsdEtleVwiLFxuICAgIFwic2hpZnRLZXlcIixcbiAgICBcIm1ldGFLZXlcIixcbiAgICBcImtleUNvZGVcIixcbiAgICBcImNoYXJDb2RlXCJcbiAgXVxufVxuIiwibW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9e1xuICBcIk1vdXNlRXZlbnRcIiA6IFtcbiAgICBcImNsaWNrXCIsXG4gICAgXCJtb3VzZWRvd25cIixcbiAgICBcIm1vdXNldXBcIixcbiAgICBcIm1vdXNlb3ZlclwiLFxuICAgIFwibW91c2Vtb3ZlXCIsXG4gICAgXCJtb3VzZW91dFwiXG4gIF0sXG4gIFwiS2V5Ym9hcmRFdmVudFwiIDogW1xuICAgIFwia2V5ZG93blwiLFxuICAgIFwia2V5dXBcIixcbiAgICBcImtleXByZXNzXCJcbiAgXSxcbiAgXCJNdXRhdGlvbkV2ZW50XCIgOiBbXG4gICAgXCJET01TdWJ0cmVlTW9kaWZpZWRcIixcbiAgICBcIkRPTU5vZGVJbnNlcnRlZFwiLFxuICAgIFwiRE9NTm9kZVJlbW92ZWRcIixcbiAgICBcIkRPTU5vZGVSZW1vdmVkRnJvbURvY3VtZW50XCIsXG4gICAgXCJET01Ob2RlSW5zZXJ0ZWRJbnRvRG9jdW1lbnRcIixcbiAgICBcIkRPTUF0dHJNb2RpZmllZFwiLFxuICAgIFwiRE9NQ2hhcmFjdGVyRGF0YU1vZGlmaWVkXCJcbiAgXSxcbiAgXCJIVE1MRXZlbnRzXCIgOiBbXG4gICAgXCJsb2FkXCIsXG4gICAgXCJ1bmxvYWRcIixcbiAgICBcImFib3J0XCIsXG4gICAgXCJlcnJvclwiLFxuICAgIFwic2VsZWN0XCIsXG4gICAgXCJjaGFuZ2VcIixcbiAgICBcInN1Ym1pdFwiLFxuICAgIFwicmVzZXRcIixcbiAgICBcImZvY3VzXCIsXG4gICAgXCJibHVyXCIsXG4gICAgXCJyZXNpemVcIixcbiAgICBcInNjcm9sbFwiXG4gIF0sXG4gIFwiVUlFdmVudFwiIDogW1xuICAgIFwiRE9NRm9jdXNJblwiLFxuICAgIFwiRE9NRm9jdXNPdXRcIixcbiAgICBcIkRPTUFjdGl2YXRlXCJcbiAgXVxufVxuIiwiLyohXG4gKiBvYmplY3QtZXh0ZW5kXG4gKiBBIHdlbGwtdGVzdGVkIGZ1bmN0aW9uIHRvIGRlZXAgZXh0ZW5kIChvciBtZXJnZSkgSmF2YVNjcmlwdCBvYmplY3RzIHdpdGhvdXQgZnVydGhlciBkZXBlbmRlbmNpZXMuXG4gKlxuICogaHR0cDovL2dpdGh1Yi5jb20vYmVybmhhcmR3XG4gKlxuICogQ29weXJpZ2h0IDIwMTMsIEJlcm5oYXJkIFdhbmdlciA8bWFpbEBiZXJuaGFyZHdhbmdlci5jb20+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKlxuICogRGF0ZTogMjAxMy0wNC0xMFxuICovXG5cblxuLyoqXG4gKiBFeHRlbmQgb2JqZWN0IGEgd2l0aCBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBTb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGIgT2JqZWN0IHRvIGV4dGVuZCB3aXRoLlxuICogQHJldHVybnMge09iamVjdH0gYSBFeHRlbmRlZCBvYmplY3QuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKGEsIGIpIHtcblxuICAgIC8vIERvbid0IHRvdWNoICdudWxsJyBvciAndW5kZWZpbmVkJyBvYmplY3RzLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFJlZmFjdG9yIHRvIHVzZSBmb3ItbG9vcCBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucy5cbiAgICBPYmplY3Qua2V5cyhiKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblxuICAgICAgICAvLyBEZXRlY3Qgb2JqZWN0IHdpdGhvdXQgYXJyYXksIGRhdGUgb3IgbnVsbC5cbiAgICAgICAgLy8gVE9ETzogUGVyZm9ybWFuY2UgdGVzdDpcbiAgICAgICAgLy8gYSkgYi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvclxuICAgICAgICAvLyBiKSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYikgPT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChiW2tleV0pID09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFba2V5XSkgIT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFba2V5XSA9IGV4dGVuZChhW2tleV0sIGJba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGE7XG5cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gcmVxdWlyZSgnLi9saWIvc2xpY2VkJyk7XG4iLCJcbi8qKlxuICogQW4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSBhbHRlcm5hdGl2ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzIHNvbWV0aGluZyB3aXRoIGEgbGVuZ3RoXG4gKiBAcGFyYW0ge051bWJlcn0gc2xpY2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBzbGljZUVuZFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBzbGljZSwgc2xpY2VFbmQpIHtcbiAgdmFyIHJldCA9IFtdO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG5cbiAgaWYgKDAgPT09IGxlbikgcmV0dXJuIHJldDtcblxuICB2YXIgc3RhcnQgPSBzbGljZSA8IDBcbiAgICA/IE1hdGgubWF4KDAsIHNsaWNlICsgbGVuKVxuICAgIDogc2xpY2UgfHwgMDtcblxuICBpZiAoc2xpY2VFbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIGxlbiA9IHNsaWNlRW5kIDwgMFxuICAgICAgPyBzbGljZUVuZCArIGxlblxuICAgICAgOiBzbGljZUVuZFxuICB9XG5cbiAgd2hpbGUgKGxlbi0tID4gc3RhcnQpIHtcbiAgICByZXRbbGVuIC0gc3RhcnRdID0gYXJnc1tsZW5dO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuIiwiXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0aGF0LCB3aGVuIGludm9rZWQsIGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25lIHRpbWUgcGVyXG4gKiBgd2FpdGAgbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGBGdW5jdGlvbmAgaW5zdGFuY2UgdG8gd3JhcC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB3YWl0IFRoZSBtaW5pbXVtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBtdXN0IGVsYXBzZSBpbiBiZXR3ZWVuIGBmdW5jYCBpbnZva2F0aW9ucy5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIG5ldyBmdW5jdGlvbiB0aGF0IHdyYXBzIHRoZSBgZnVuY2AgZnVuY3Rpb24gcGFzc2VkIGluLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiB0aHJvdHRsZSAoZnVuYywgd2FpdCkge1xuICB2YXIgcnRuOyAvLyByZXR1cm4gdmFsdWVcbiAgdmFyIGxhc3QgPSAwOyAvLyBsYXN0IGludm9rYXRpb24gdGltZXN0YW1wXG4gIHJldHVybiBmdW5jdGlvbiB0aHJvdHRsZWQgKCkge1xuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgZGVsdGEgPSBub3cgLSBsYXN0O1xuICAgIGlmIChkZWx0YSA+PSB3YWl0KSB7XG4gICAgICBydG4gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBsYXN0ID0gbm93O1xuICAgIH1cbiAgICByZXR1cm4gcnRuO1xuICB9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi90eXBlJyk7XG4iLCIvKiFcbiAqIHR5cGUtZGV0ZWN0XG4gKiBDb3B5cmlnaHQoYykgMjAxMyBqYWtlIGx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qIVxuICogUHJpbWFyeSBFeHBvcnRzXG4gKi9cblxudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGdldFR5cGU7XG5cbi8qIVxuICogRGV0ZWN0YWJsZSBqYXZhc2NyaXB0IG5hdGl2ZXNcbiAqL1xuXG52YXIgbmF0aXZlcyA9IHtcbiAgICAnW29iamVjdCBBcnJheV0nOiAnYXJyYXknXG4gICwgJ1tvYmplY3QgUmVnRXhwXSc6ICdyZWdleHAnXG4gICwgJ1tvYmplY3QgRnVuY3Rpb25dJzogJ2Z1bmN0aW9uJ1xuICAsICdbb2JqZWN0IEFyZ3VtZW50c10nOiAnYXJndW1lbnRzJ1xuICAsICdbb2JqZWN0IERhdGVdJzogJ2RhdGUnXG59O1xuXG4vKipcbiAqICMjIyB0eXBlT2YgKG9iailcbiAqXG4gKiBVc2Ugc2V2ZXJhbCBkaWZmZXJlbnQgdGVjaG5pcXVlcyB0byBkZXRlcm1pbmVcbiAqIHRoZSB0eXBlIG9mIG9iamVjdCBiZWluZyB0ZXN0ZWQuXG4gKlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9iamVjdFxuICogQHJldHVybiB7U3RyaW5nfSBvYmplY3QgdHlwZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuICB2YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7XG4gIGlmIChuYXRpdmVzW3N0cl0pIHJldHVybiBuYXRpdmVzW3N0cl07XG4gIGlmIChvYmogPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmIChvYmogPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAob2JqID09PSBPYmplY3Qob2JqKSkgcmV0dXJuICdvYmplY3QnO1xuICByZXR1cm4gdHlwZW9mIG9iajtcbn1cblxuZXhwb3J0cy5MaWJyYXJ5ID0gTGlicmFyeTtcblxuLyoqXG4gKiAjIyMgTGlicmFyeVxuICpcbiAqIENyZWF0ZSBhIHJlcG9zaXRvcnkgZm9yIGN1c3RvbSB0eXBlIGRldGVjdGlvbi5cbiAqXG4gKiBgYGBqc1xuICogdmFyIGxpYiA9IG5ldyB0eXBlLkxpYnJhcnk7XG4gKiBgYGBcbiAqXG4gKi9cblxuZnVuY3Rpb24gTGlicmFyeSgpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIExpYnJhcnkpKSByZXR1cm4gbmV3IExpYnJhcnkoKTtcbiAgdGhpcy50ZXN0cyA9IHt9O1xufVxuXG4vKipcbiAqICMjIyMgLm9mIChvYmopXG4gKlxuICogRXhwb3NlIHJlcGxhY2VtZW50IGB0eXBlb2ZgIGRldGVjdGlvbiB0byB0aGUgbGlicmFyeS5cbiAqXG4gKiBgYGBqc1xuICogaWYgKCdzdHJpbmcnID09PSBsaWIub2YoJ2hlbGxvIHdvcmxkJykpIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmplY3QgdG8gdGVzdFxuICogQHJldHVybiB7U3RyaW5nfSB0eXBlXG4gKi9cblxuTGlicmFyeS5wcm90b3R5cGUub2YgPSBnZXRUeXBlO1xuXG4vKipcbiAqICMjIyMgLmRlZmluZSAodHlwZSwgdGVzdClcbiAqXG4gKiBBZGQgYSB0ZXN0IHRvIGZvciB0aGUgYC50ZXN0KClgIGFzc2VydGlvbi5cbiAqXG4gKiBDYW4gYmUgZGVmaW5lZCBhcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbjpcbiAqXG4gKiBgYGBqc1xuICogbGliLmRlZmluZSgnaW50JywgL15bMC05XSskLyk7XG4gKiBgYGBcbiAqXG4gKiAuLi4gb3IgYXMgYSBmdW5jdGlvbjpcbiAqXG4gKiBgYGBqc1xuICogbGliLmRlZmluZSgnYmxuJywgZnVuY3Rpb24gKG9iaikge1xuICogICBpZiAoJ2Jvb2xlYW4nID09PSBsaWIub2Yob2JqKSkgcmV0dXJuIHRydWU7XG4gKiAgIHZhciBibG5zID0gWyAneWVzJywgJ25vJywgJ3RydWUnLCAnZmFsc2UnLCAxLCAwIF07XG4gKiAgIGlmICgnc3RyaW5nJyA9PT0gbGliLm9mKG9iaikpIG9iaiA9IG9iai50b0xvd2VyQ2FzZSgpO1xuICogICByZXR1cm4gISEgfmJsbnMuaW5kZXhPZihvYmopO1xuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtSZWdFeHB8RnVuY3Rpb259IHRlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlicmFyeS5wcm90b3R5cGUuZGVmaW5lID0gZnVuY3Rpb24odHlwZSwgdGVzdCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHRoaXMudGVzdHNbdHlwZV07XG4gIHRoaXMudGVzdHNbdHlwZV0gPSB0ZXN0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogIyMjIyAudGVzdCAob2JqLCB0ZXN0KVxuICpcbiAqIEFzc2VydCB0aGF0IGFuIG9iamVjdCBpcyBvZiB0eXBlLiBXaWxsIGZpcnN0XG4gKiBjaGVjayBuYXRpdmVzLCBhbmQgaWYgdGhhdCBkb2VzIG5vdCBwYXNzIGl0IHdpbGxcbiAqIHVzZSB0aGUgdXNlciBkZWZpbmVkIGN1c3RvbSB0ZXN0cy5cbiAqXG4gKiBgYGBqc1xuICogYXNzZXJ0KGxpYi50ZXN0KCcxJywgJ2ludCcpKTtcbiAqIGFzc2VydChsaWIudGVzdCgneWVzJywgJ2JsbicpKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9iamVjdFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHJlc3VsdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaWJyYXJ5LnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24ob2JqLCB0eXBlKSB7XG4gIGlmICh0eXBlID09PSBnZXRUeXBlKG9iaikpIHJldHVybiB0cnVlO1xuICB2YXIgdGVzdCA9IHRoaXMudGVzdHNbdHlwZV07XG5cbiAgaWYgKHRlc3QgJiYgJ3JlZ2V4cCcgPT09IGdldFR5cGUodGVzdCkpIHtcbiAgICByZXR1cm4gdGVzdC50ZXN0KG9iaik7XG4gIH0gZWxzZSBpZiAodGVzdCAmJiAnZnVuY3Rpb24nID09PSBnZXRUeXBlKHRlc3QpKSB7XG4gICAgcmV0dXJuIHRlc3Qob2JqKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ1R5cGUgdGVzdCBcIicgKyB0eXBlICsgJ1wiIG5vdCBkZWZpbmVkIG9yIGludmFsaWQuJyk7XG4gIH1cbn07XG4iLCJ2YXIgc2xpY2VkID0gcmVxdWlyZSgnc2xpY2VkJyksXG4gIHR5cGUgPSByZXF1aXJlKCd0eXBlLWRldGVjdCcpLFxuICBzcGxpdCA9IHJlcXVpcmUoXCIuL3V0aWwvc3BsaXQuanNcIik7XG5cblxudmFyIGNvbmRpdGlvbnMgPSB7fTtcblxuZnVuY3Rpb24gYWRkQ29uZGl0aW9uKG5hbWUsIGZ1bmMpIHtcbiAgaWYgKGNvbmRpdGlvbnNbbmFtZV0gPT09IHVuZGVmaW5lZCkgY29uZGl0aW9uc1tuYW1lXSA9IFtdO1xuICBjb25kaXRpb25zW25hbWVdLnB1c2goZnVuYyk7XG59XG5cbi8vIHUuY29uZGl0aW9ucy5hZGQoXCJpc01vYmlsZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIDwgNzIwOyB9KVxuLy8gdS5jb25kaXRpb25zLmFkZCh7XG4vLyAgICBpc1JldGluYTogZnVuY3Rpb24oKSB7IC8vIHJldGluYSB0ZXN0IH0sXG4vLyAgICBpc0hEOiB1LmRlYm91bmNlKGZ1bmN0aW9uKCkgeyByZXR1cm4gd2luZG93LndpZHRoKCkgPj0gMTkyMCAmJiB3aW5kb3cuaGVpZ2h0KCkgPj0gMTA4MDsgfSwgMzAwKVxuLy8gfSlcbmZ1bmN0aW9uIGFkZChuYW1lLCBmdW5jKSB7XG4gIHZhciBhcmdzID0gc2xpY2VkKGFyZ3VtZW50cyk7XG5cbiAgLy8gdS5jb25kaXRpb25zLmFkZChvYmopO1xuICBpZiAodHlwZShhcmdzWzBdKSA9PT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIGFyZ3NbMF0pIHtcbiAgICAgIGFkZENvbmRpdGlvbihwcm9wLCBhcmdzWzBdW3Byb3BdKTtcbiAgICB9XG5cbiAgLy8gdS5jb25kaXRpb25zLmFkZChzdHJpbmcsIGZ1bmMvYm9vbClcbiAgfSBlbHNlIGlmICh0eXBlKGFyZ3NbMF0pID09PSAnc3RyaW5nJykge1xuICAgIC8vIHUuY29uZGl0aW9ucy5hZGQoXCJpc01vYmlsZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy53aWR0aCgpID4gNzIwOyB9KTtcbiAgICAvLyB1LmNvbmRpdGlvbnMuYWRkKFwiaXNMYXJnZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy53aWR0aCgpIDwgMTI4MDsgfSk7XG4gICAgdmFyIG5hbWVzID0gc3BsaXQoYXJnc1swXSk7XG5cbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGFkZENvbmRpdGlvbihuYW1lLCBhcmdzWzFdKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlxuICBSZW1vdmUgRnVuY3Rpb25zXG5cbiAgcmVtb3ZlcyBvbmUgb3IgbW9yZSBjb25kaXRpb25zIGZyb20gdGhlXG4qL1xuXG5cbmZ1bmN0aW9uIHJlbW92ZUNvbmRpdGlvbihuYW1lKSB7XG4gIGRlbGV0ZSBjb25kaXRpb25zW25hbWVdO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDb25kaXRpb25GdW5jdGlvbihuYW1lLCBmdW5jKSB7XG4gIC8vIGxvZ2ljIHRvIHJlbW92ZSBzcGVjaWZpYyBmdW5jdGlvbiBmcm9tIGNhbGxiYWNrIGFycmF5XG59XG5cbi8vIHUuY29uZGl0aW9ucy5yZW1vdmUoXCJpc1JldGluYVwiKVxuLy8gdS5jb25kaXRpb25zLnJlbW92ZShcImlzTW9iaWxlIGlzTGFyZ2VcIilcbmZ1bmN0aW9uIHJlbW92ZShuYW1lcykge1xuICAvLyBpZiAobmFtZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gIHNwbGl0KG5hbWVzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZW1vdmVDb25kaXRpb24obmFtZSk7XG4gIH0pO1xufVxuXG4vKlxuICBUZXN0IEZ1bmN0aW9uc1xuXG4gIHRha2VzIGNvbmRpdGlvbihzKSBhbmQgcmV0dXJucyBib29sZWFuIGJhc2VkIG9uIHJlc3VsdFxuKi9cblxuLy8gdS5jb25kaXRpb25zLnRlc3QoXCJpc1JldGluYVwiKSA9PT4gdHJ1ZS9mYWxzZVxuLy8gYWxpYXM6IHRlc3RcbmZ1bmN0aW9uIHRlc3QobmFtZSkge1xuICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpbnZlcnQgPSBuYW1lLmluZGV4T2YoXCIhXCIpICE9PSAtMSA/IHRydWUgOiBmYWxzZSxcbiAgICBzdWJUZXN0cztcblxuICBuYW1lID0gaW52ZXJ0ID8gbmFtZS5zdWJzdHIoMSkgOiBuYW1lO1xuXG4gIGlmIChjb25kaXRpb25zW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICBzdWJUZXN0cyA9IGNvbmRpdGlvbnNbbmFtZV0ubWFwKGZ1bmN0aW9uKGNvbmRpdGlvbikge1xuICAgICAgaWYgKHR5cGUoY29uZGl0aW9uKSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIGNvbmRpdGlvbigpICE9PSBpbnZlcnQ7XG4gICAgICByZXR1cm4gY29uZGl0aW9uICE9PSBpbnZlcnQ7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gc3ViVGVzdHMgIT09IHVuZGVmaW5lZCAmJiBzdWJUZXN0cy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG59XG5cbi8vIHUuY29uZGl0aW9ucy50ZXN0QWxsKFwiaXNSZXRpbmEgaXNNb2JpbGUgaXNIRFwiKSA9PT4gW3RydWUsIHRydWUsIGZhbHNlXVxuZnVuY3Rpb24gdGVzdEFsbChuYW1lcykge1xuICByZXR1cm4gc3BsaXQobmFtZXMpLm1hcChmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRlc3QobmFtZSk7XG4gIH0pO1xufVxuXG4vLyB1LmNvbmRpdGlvbnMudGVzdE9yKFwiaXNSZXRpbmEgaXNNb2JpbGVcIikgPT0+IHRydWUvZmFsc2VcbmZ1bmN0aW9uIHRlc3RPcihuYW1lcykge1xuICByZXR1cm4gdGVzdEFsbChuYW1lcykuc29tZShmdW5jdGlvbihuYW1lKSB7IHJldHVybiBuYW1lOyB9KTtcbn1cblxuLy8gdS5jb25kaXRpb25zLnRlc3RBbmQoXCJpc1JldGluYSBpc01vYmlsZVwiKSA9PT4gdHJ1ZS9mYWxzZVxuZnVuY3Rpb24gdGVzdEFuZChuYW1lcykge1xuICByZXR1cm4gdGVzdEFsbChuYW1lcykuZXZlcnkoZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gbmFtZTsgfSk7XG59XG5cblxuLy8gZXhwb3J0c1xuZXhwb3J0cy5hZGQgPSBhZGQ7XG5leHBvcnRzLnJlbW92ZSA9IHJlbW92ZTtcbmV4cG9ydHMudGVzdCA9IHRlc3Q7XG5leHBvcnRzLnRlc3RBbGwgPSB0ZXN0QWxsO1xuZXhwb3J0cy50ZXN0T3IgPSB0ZXN0T3I7XG4iLCJ2YXIgZG9tID0gcmVxdWlyZSgnZG9tLWV2ZW50cycpLFxuICB0aW1lciA9IHJlcXVpcmUoJy4vdXRpbC90aW1lcnMuanMnKTtcblxuZXhwb3J0cy5kb20gPSBkb207XG5leHBvcnRzLnRpbWVyID0gdGltZXI7IiwidmFyIHNsaWNlZCA9IHJlcXVpcmUoJ3NsaWNlZCcpLFxuICB0eXBlID0gcmVxdWlyZSgndHlwZS1kZXRlY3QnKSxcbiAgc3BsaXQgPSByZXF1aXJlKCcuL3V0aWwvc3BsaXQuanMnKSxcbiAgY29uZGl0aW9ucyA9IHJlcXVpcmUoJy4vY29yZS5jb25kaXRpb25zLmpzJyk7XG5cblxudmFyIHJlc3BvbmRJZiA9IGZ1bmN0aW9uIHJlc3BvbmRJZiAobmFtZSwgZnVuYykgeyAgXG4gIGlmICh0eXBlKG5hbWUpID09PSAnYm9vbGVhbicgJiYgbmFtZSkge1xuICAgIHJldHVybiBmdW5jKCk7XG4gIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlc3BvbmQ6IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZnVuYywgYXJncykge1xuICAgIHZhciBhcmdzID0gc2xpY2VkKGFyZ3VtZW50cyk7XG4gICAgXG4gICAgaWYgKHR5cGUoYXJnc1swXSkgPT09ICdvYmplY3QnKSB7XG4gICAgICBcbiAgICB9IGVsc2UgaWYgKHR5cGUoYXJnc1swXSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoY29uZGl0aW9ucy50ZXN0KGNvbmRpdGlvbikpIGZ1bmMuYXBwbHkodGhpcywgYXJncy5zbGljZSgyKSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGNvbmRpdGlvbnMudGVzdChjb25kaXRpb24pKVxuXG5cbiAgfSxcbiAgcmVzcG9uZE9uY2U6IGZ1bmN0aW9uKCkge30sXG4gIHJlc3BvbmRXaGVuOiBmdW5jdGlvbigpIHt9LFxuICByZXNwb25kV2hpbGU6IGZ1bmN0aW9uKCkge31cbn1cblxuXG4vKlxuICB1bmljb3JuLnByb3RvdHlwZS5yZXNwb25kID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmdW5jKSB7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uKSAmJiAhY29uZGl0aW9uLmNhbGwodGhpcykpIHJldHVybjtcbiAgICBpZiAoaXNTdHJpbmcoY29uZGl0aW9uKSAmJiAhcmVzcG9uZElmLmNhbGwodGhpcywgY29uZGl0aW9uKSkgcmV0dXJuO1xuICAgIFxuICAgIGlmIChpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICBmdW5jKCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGZ1bmMpKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZnVuYy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmdW5jW2ldKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4qLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcuc3BsaXQoXCIgXCIpO1xufTsiLCJleHBvcnRzLmRlbGF5ID0gc2V0VGltZW91dDtcbmV4cG9ydHMucmVwZWF0ID0gc2V0SW50ZXJ2YWw7XG5cbmV4cG9ydHMuY2xlYXIgPSBmdW5jdGlvbih0aWQpIHtcbiAgY2xlYXJUaW1lb3V0KHRpZCk7XG4gIGNsZWFySW50ZXJ2YWwodGlkKTtcbn0iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnb2JqZWN0LWV4dGVuZCcpO1xuXG52YXIgY29uZGl0aW9ucyA9IHJlcXVpcmUoXCIuL2NvcmUvY29yZS5jb25kaXRpb25zLmpzXCIpLFxuXHRydW5uZXJzID0gcmVxdWlyZShcIi4vY29yZS9jb3JlLnJ1bm5lcnMuanNcIiksXG5cdGV2ZW50cyA9IHJlcXVpcmUoXCIuL2NvcmUvY29yZS5ldmVudHMuanNcIik7XG5cbnZhciB1bmljb3JuID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2V2ZW50cyA9IGV2ZW50cztcbiAgdGhpcy5fY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XG4gLy8gdGhpcy5fcnVubmVycyA9IHJ1bm5lcnM7XG5cbiAgdGhpcy5kZWJvdW5jZSA9IHJlcXVpcmUoJ2RlYm91bmNlJyk7XG4gIHRoaXMudGhyb3R0bGUgPSByZXF1aXJlKCd0aHJvdHRsZWl0Jyk7XG5cbiAgdGhpcy5hZGRDb25kaXRpb24gPSBjb25kaXRpb25zLmFkZDtcbiAgdGhpcy50ZXN0Q29uZGl0aW9uID0gY29uZGl0aW9ucy50ZXN0O1xuXG4gIGV4dGVuZCh0aGlzLCBydW5uZXJzKTtcbn07XG5cbndpbmRvdy51bmljb3JuID0gd2luZG93LnUgPSBuZXcgdW5pY29ybigpO1xubW9kdWxlLmV4cG9ydHMgPSB1bmljb3JuO1xuXG4vKlxuXG51LmNvbmRpdGlvbnMuYWRkKFwiaXNNb2JpbGVcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cud2lkdGgoKSA+IDcyMDsgfSk7XG51LmNvbmRpdGlvbnMuYWRkKFwiaXNMYXJnZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy53aWR0aCgpIDwgMTI4MDsgfSk7XG51LmNvbmRpdGlvbnMuYWRkKHtcbiAgICBpc1JldGluYTogZnVuY3Rpb24oKSB7IC8vIHJldGluYSB0ZXN0IH0sXG4gICAgaXNIRDogZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cud2lkdGgoKSA+PSAxOTIwICYmIHdpbmRvdy5oZWlnaHQoKSA+PSAxMDgwOyB9LmRlYm91bmNlKDMwMClcbn0pO1xuXG51LmNvbmRpdGlvbnMucmVtb3ZlKFwiaXNSZXRpbmFcIik7XG51LmNvbmRpdGlvbnMucmVtb3ZlKFwiaXNNb2JpbGUgaXNMYXJnZVwiKTtcblxudS5jb25kaXRpb25zLnRlc3QoXCJpc1JldGluYVwiKSA9PT4gdHJ1ZS9mYWxzZVxuXG51LmNvbmRpdGlvbigpID0+IGZvcm1zOiB7XG4gICAgb2JqID09PiB1LmNvbmRpdGlvbnMuYWRkKG9iaikgZm9ybVxuICAgIHN0cmluZywgZnVuYyA9PT4gdS5jb25kaXRpb25zLmFkZChzdHJpbmcsIGZ1bmMpIGZvcm1cbiAgICBzdHJpbmcgPT0+IHUuY29uZGl0aW9ucy50ZXN0KFwic3RyaW5nIHN0cmluZyBzdHJpbmdcIikgZm9ybVxufVxuXG5cblxudS5ldmVudHMub24oXCIuYXBwXCIsIFwiaG92ZXJcIiwgXCJpc01vYmlsZVwiKTtcbnUuZXZlbnRzLm9uY2Uod2luZG93LCBcInJlc2l6ZVwiLCBcImlzTW9iaWxlIGlzTGFyZ2VcIik7XG5cblxuXG51LmV2ZW50cy5vZmYoXCIuYXBwXCIsIFwiaG92ZXJcIiwgXCJpc0xhcmdlXCIpO1xudS5ldmVudHMub2ZmKFwiLmFwcFwiLCBcImhvdmVyXCIpO1xuXG5cbnUud2hlbihcImlzTW9iaWxlXCIsIGZ1bmN0aW9uKCkge30pO1xudS53aGVuKFwiaXNNb2JpbGVcIiwgZnVuY3Rpb24oKSB7fSk7XG5cblxudSA9IHtcblx0X2V2ZW50cyxcblx0X2NvbmRpdGlvbnMsXG5cblx0dGhyb3R0bGUsXG5cdGRlYm91bmNlLFxuXG5cdGFkZENvbmRpdGlvbixcblx0dGVzdENvbmRpdGlvblxuXG5cdHJlc3BvbmRcblx0b25jZSxcblx0d2hlbixcblx0d2hpbGVcblxufVxuXG4qL1xuIl19
;