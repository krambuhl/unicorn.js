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

var addCondition = function(name, func) {
  if (conditions[name] === undefined) conditions[name] = [];
  conditions[name].push(func);""
};

var removeCondition = function(name) {
  delete conditions[name];
}

var testCondition = function(name) {
  if (name === undefined) return false;
  var invert = name.indexOf("!") !== -1 ? true : false;
  name = invert ? name.substr(1) : name;

  if (conditions[name] !== undefined) {
    var subTests = conditions[name].map(function(condition) {
      if (type(condition) === 'function')
        return condition() !== invert;
      return condition !== invert;
    });
  }
  
  return subTests !== undefined && subTests.indexOf(false) === -1;
}

var testAll = function(names) {
  return split(names).map(function(name) {
    return testCondition(name);
  });
};


module.exports = {
  list: conditions,

  // u.conditions.add("isMobile", function() { return window.innerWidth < 720; })
  // u.conditions.add({
  //    isRetina: function() { // retina test },
  //    isHD: u.debounce(function() { return window.width() >= 1920 && window.height() >= 1080; }, 300)
  // })
  add: function(name, func) {
    var args = sliced(arguments);

    // u.conditions.add(obj);
    if (type(args[0]) === 'object') {
      for (var name in args[0]) {
        addCondition(name, args[0][name])
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
  },


  // u.conditions.remove("isRetina")
  // u.conditions.remove("isMobile isLarge")
  remove: function(names) {
    split(names).forEach(function(name) {
      removeCondition(name)
    });
  },

  // u.conditions.test("isRetina") ==> true/false
  test: function(name) {
    return testCondition(name);
  },

  testAll: testAll,

  testOr: function(names) {
    return testAll(names).some(function(name) { return name; });
  },

  testAnd: function(names) {
    return testAll(names).every(function(name) { return name; });
  }
}


// tests ... should write good stuff instead

// u.conditions.add("isMobile", function() { return window.innerWidth < 640; });
// u.conditions.add("isLarge", function() { return window.innerWidth < 1080; });
// u.conditions.add({
//  isRetina: function() { // retina test },
//  isHD: function() { return window.innerWidth >= 1920 && window.innerHeight >= 1080; }
// });

// u.conditions.remove("isMobile");
// u.conditions.remove("isMobile isLarge");

// u.conditions.test("isMobile") ==> true/false
// u.conditions.testAll("isMobile isLarge") ==> [true, false]
// u.conditions.testOr("isMobile isLarge") ==> true
// u.conditions.testAnd("isMobile isLarge") ==> false
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvZGVib3VuY2UvaW5kZXguanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvZG9tLWV2ZW50cy9pbmRleC5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbmRleC5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbml0Lmpzb24iLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvZG9tLWV2ZW50cy9ub2RlX21vZHVsZXMvc3ludGhldGljLWRvbS1ldmVudHMvdHlwZXMuanNvbiIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL25vZGVfbW9kdWxlcy9vYmplY3QtZXh0ZW5kL2xpYi9leHRlbmQuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvc2xpY2VkL2luZGV4LmpzIiwiL1VzZXJzL2V2YW4vU2l0ZXMvaWw3L3VuaWNvcm4uanMvbm9kZV9tb2R1bGVzL3NsaWNlZC9saWIvc2xpY2VkLmpzIiwiL1VzZXJzL2V2YW4vU2l0ZXMvaWw3L3VuaWNvcm4uanMvbm9kZV9tb2R1bGVzL3Rocm90dGxlaXQvaW5kZXguanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvdHlwZS1kZXRlY3QvaW5kZXguanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9ub2RlX21vZHVsZXMvdHlwZS1kZXRlY3QvbGliL3R5cGUuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9zb3VyY2UvY29yZS9jb3JlLmNvbmRpdGlvbnMuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9zb3VyY2UvY29yZS9jb3JlLmV2ZW50cy5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL3NvdXJjZS9jb3JlL2NvcmUucnVubmVycy5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL3NvdXJjZS9jb3JlL3V0aWwvc3BsaXQuanMiLCIvVXNlcnMvZXZhbi9TaXRlcy9pbDcvdW5pY29ybi5qcy9zb3VyY2UvY29yZS91dGlsL3RpbWVycy5qcyIsIi9Vc2Vycy9ldmFuL1NpdGVzL2lsNy91bmljb3JuLmpzL3NvdXJjZS91bmljb3JuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGVib3VuY2VzIGEgZnVuY3Rpb24gYnkgdGhlIGdpdmVuIHRocmVzaG9sZC5cbiAqXG4gKiBAc2VlIGh0dHA6Ly91bnNjcmlwdGFibGUuY29tLzIwMDkvMDMvMjAvZGVib3VuY2luZy1qYXZhc2NyaXB0LW1ldGhvZHMvXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiB0byB3cmFwXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZW91dCBpbiBtcyAoYDEwMGApXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHdoZXRoZXIgdG8gZXhlY3V0ZSBhdCB0aGUgYmVnaW5uaW5nIChgZmFsc2VgKVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHRocmVzaG9sZCwgZXhlY0FzYXApe1xuICB2YXIgdGltZW91dDtcblxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkKCl7XG4gICAgdmFyIG9iaiA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICBmdW5jdGlvbiBkZWxheWVkICgpIHtcbiAgICAgIGlmICghZXhlY0FzYXApIHtcbiAgICAgICAgZnVuYy5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9IGVsc2UgaWYgKGV4ZWNBc2FwKSB7XG4gICAgICBmdW5jLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgfVxuXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQoZGVsYXllZCwgdGhyZXNob2xkIHx8IDEwMCk7XG4gIH07XG59O1xuIiwiXG52YXIgc3ludGggPSByZXF1aXJlKCdzeW50aGV0aWMtZG9tLWV2ZW50cycpO1xuXG52YXIgb24gPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbiwgY2FwdHVyZSkge1xuICAgIHJldHVybiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xufTtcblxudmFyIG9mZiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIGZuLCBjYXB0dXJlKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBmbiwgY2FwdHVyZSB8fCBmYWxzZSk7XG59O1xuXG52YXIgb25jZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBuYW1lLCBmbiwgY2FwdHVyZSkge1xuICAgIGZ1bmN0aW9uIHRtcCAoZXYpIHtcbiAgICAgICAgb2ZmKGVsZW1lbnQsIG5hbWUsIHRtcCwgY2FwdHVyZSk7XG4gICAgICAgIGZuKGV2KTtcbiAgICB9XG4gICAgb24oZWxlbWVudCwgbmFtZSwgdG1wLCBjYXB0dXJlKTtcbn07XG5cbnZhciBlbWl0ID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgb3B0KSB7XG4gICAgdmFyIGV2ID0gc3ludGgobmFtZSwgb3B0KTtcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXYpO1xufTtcblxuaWYgKCFkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgb24gPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbikge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgbmFtZSwgZm4pO1xuICAgIH07XG59XG5cbmlmICghZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIG9mZiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIGZuKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBuYW1lLCBmbik7XG4gICAgfTtcbn1cblxuaWYgKCFkb2N1bWVudC5kaXNwYXRjaEV2ZW50KSB7XG4gICAgZW1pdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIG9wdCkge1xuICAgICAgICB2YXIgZXYgPSBzeW50aChuYW1lLCBvcHQpO1xuICAgICAgICByZXR1cm4gZWxlbWVudC5maXJlRXZlbnQoJ29uJyArIGV2LnR5cGUsIGV2KTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBvbjogb24sXG4gICAgb2ZmOiBvZmYsXG4gICAgb25jZTogb25jZSxcbiAgICBlbWl0OiBlbWl0XG59O1xuIiwiXG4vLyBmb3IgY29tcHJlc3Npb25cbnZhciB3aW4gPSB3aW5kb3c7XG52YXIgZG9jID0gZG9jdW1lbnQgfHwge307XG52YXIgcm9vdCA9IGRvYy5kb2N1bWVudEVsZW1lbnQgfHwge307XG5cbi8vIGRldGVjdCBpZiB3ZSBuZWVkIHRvIHVzZSBmaXJlZm94IEtleUV2ZW50cyB2cyBLZXlib2FyZEV2ZW50c1xudmFyIHVzZV9rZXlfZXZlbnQgPSB0cnVlO1xudHJ5IHtcbiAgICBkb2MuY3JlYXRlRXZlbnQoJ0tleUV2ZW50cycpO1xufVxuY2F0Y2ggKGVycikge1xuICAgIHVzZV9rZXlfZXZlbnQgPSBmYWxzZTtcbn1cblxuLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE2NzM1XG5mdW5jdGlvbiBjaGVja19rYihldiwgb3B0cykge1xuICAgIGlmIChldi5jdHJsS2V5ICE9IChvcHRzLmN0cmxLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2LmFsdEtleSAhPSAob3B0cy5hbHRLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2LnNoaWZ0S2V5ICE9IChvcHRzLnNoaWZ0S2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5tZXRhS2V5ICE9IChvcHRzLm1ldGFLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2LmtleUNvZGUgIT0gKG9wdHMua2V5Q29kZSB8fCAwKSB8fFxuICAgICAgICBldi5jaGFyQ29kZSAhPSAob3B0cy5jaGFyQ29kZSB8fCAwKSkge1xuXG4gICAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIGV2LmluaXRFdmVudChvcHRzLnR5cGUsIG9wdHMuYnViYmxlcywgb3B0cy5jYW5jZWxhYmxlKTtcbiAgICAgICAgZXYuY3RybEtleSAgPSBvcHRzLmN0cmxLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2LmFsdEtleSAgID0gb3B0cy5hbHRLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2LnNoaWZ0S2V5ID0gb3B0cy5zaGlmdEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYubWV0YUtleSAgPSBvcHRzLm1ldGFLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2LmtleUNvZGUgID0gb3B0cy5rZXlDb2RlIHx8IDA7XG4gICAgICAgIGV2LmNoYXJDb2RlID0gb3B0cy5jaGFyQ29kZSB8fCAwO1xuICAgIH1cblxuICAgIHJldHVybiBldjtcbn1cblxuLy8gbW9kZXJuIGJyb3dzZXJzLCBkbyBhIHByb3BlciBkaXNwYXRjaEV2ZW50KClcbnZhciBtb2Rlcm4gPSBmdW5jdGlvbih0eXBlLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAvLyB3aGljaCBpbml0IGZuIGRvIHdlIHVzZVxuICAgIHZhciBmYW1pbHkgPSB0eXBlT2YodHlwZSk7XG4gICAgdmFyIGluaXRfZmFtID0gZmFtaWx5O1xuICAgIGlmIChmYW1pbHkgPT09ICdLZXlib2FyZEV2ZW50JyAmJiB1c2Vfa2V5X2V2ZW50KSB7XG4gICAgICAgIGZhbWlseSA9ICdLZXlFdmVudHMnO1xuICAgICAgICBpbml0X2ZhbSA9ICdLZXlFdmVudCc7XG4gICAgfVxuXG4gICAgdmFyIGV2ID0gZG9jLmNyZWF0ZUV2ZW50KGZhbWlseSk7XG4gICAgdmFyIGluaXRfZm4gPSAnaW5pdCcgKyBpbml0X2ZhbTtcbiAgICB2YXIgaW5pdCA9IHR5cGVvZiBldltpbml0X2ZuXSA9PT0gJ2Z1bmN0aW9uJyA/IGluaXRfZm4gOiAnaW5pdEV2ZW50JztcblxuICAgIHZhciBzaWcgPSBpbml0U2lnbmF0dXJlc1tpbml0XTtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIHZhciB1c2VkID0ge307XG5cbiAgICBvcHRzLnR5cGUgPSB0eXBlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBrZXkgPSBzaWdbaV07XG4gICAgICAgIHZhciB2YWwgPSBvcHRzW2tleV07XG4gICAgICAgIC8vIGlmIG5vIHVzZXIgc3BlY2lmaWVkIHZhbHVlLCB0aGVuIHVzZSBldmVudCBkZWZhdWx0XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsID0gZXZba2V5XTtcbiAgICAgICAgfVxuICAgICAgICB1c2VkW2tleV0gPSB0cnVlO1xuICAgICAgICBhcmdzLnB1c2godmFsKTtcbiAgICB9XG4gICAgZXZbaW5pdF0uYXBwbHkoZXYsIGFyZ3MpO1xuXG4gICAgLy8gd2Via2l0IGtleSBldmVudCBpc3N1ZSB3b3JrYXJvdW5kXG4gICAgaWYgKGZhbWlseSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgIGV2ID0gY2hlY2tfa2IoZXYsIG9wdHMpO1xuICAgIH1cblxuICAgIC8vIGF0dGFjaCByZW1haW5pbmcgdW51c2VkIG9wdGlvbnMgdG8gdGhlIG9iamVjdFxuICAgIGZvciAodmFyIGtleSBpbiBvcHRzKSB7XG4gICAgICAgIGlmICghdXNlZFtrZXldKSB7XG4gICAgICAgICAgICBldltrZXldID0gb3B0c1trZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufTtcblxudmFyIGxlZ2FjeSA9IGZ1bmN0aW9uICh0eXBlLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdmFyIGV2ID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG5cbiAgICBldi50eXBlID0gdHlwZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cykge1xuICAgICAgICBpZiAob3B0c1trZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGV2W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59O1xuXG4vLyBleHBvc2UgZWl0aGVyIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiBldmVudCBnZW5lcmF0aW9uIG9yIGxlZ2FjeVxuLy8gZGVwZW5kaW5nIG9uIHdoYXQgd2Ugc3VwcG9ydFxuLy8gYXZvaWRzIGlmIHN0YXRlbWVudHMgaW4gdGhlIGNvZGUgbGF0ZXJcbm1vZHVsZS5leHBvcnRzID0gZG9jLmNyZWF0ZUV2ZW50ID8gbW9kZXJuIDogbGVnYWN5O1xuXG52YXIgaW5pdFNpZ25hdHVyZXMgPSByZXF1aXJlKCcuL2luaXQuanNvbicpO1xudmFyIHR5cGVzID0gcmVxdWlyZSgnLi90eXBlcy5qc29uJyk7XG52YXIgdHlwZU9mID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHlwcyA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiB0eXBlcykge1xuICAgICAgICB2YXIgdHMgPSB0eXBlc1trZXldO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0eXBzW3RzW2ldXSA9IGtleTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gdHlwc1tuYW1lXSB8fCAnRXZlbnQnO1xuICAgIH07XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9e1xuICBcImluaXRFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiXG4gIF0sXG4gIFwiaW5pdFVJRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImRldGFpbFwiXG4gIF0sXG4gIFwiaW5pdE1vdXNlRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImRldGFpbFwiLFxuICAgIFwic2NyZWVuWFwiLFxuICAgIFwic2NyZWVuWVwiLFxuICAgIFwiY2xpZW50WFwiLFxuICAgIFwiY2xpZW50WVwiLFxuICAgIFwiY3RybEtleVwiLFxuICAgIFwiYWx0S2V5XCIsXG4gICAgXCJzaGlmdEtleVwiLFxuICAgIFwibWV0YUtleVwiLFxuICAgIFwiYnV0dG9uXCIsXG4gICAgXCJyZWxhdGVkVGFyZ2V0XCJcbiAgXSxcbiAgXCJpbml0TXV0YXRpb25FdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwicmVsYXRlZE5vZGVcIixcbiAgICBcInByZXZWYWx1ZVwiLFxuICAgIFwibmV3VmFsdWVcIixcbiAgICBcImF0dHJOYW1lXCIsXG4gICAgXCJhdHRyQ2hhbmdlXCJcbiAgXSxcbiAgXCJpbml0S2V5Ym9hcmRFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiY3RybEtleVwiLFxuICAgIFwiYWx0S2V5XCIsXG4gICAgXCJzaGlmdEtleVwiLFxuICAgIFwibWV0YUtleVwiLFxuICAgIFwia2V5Q29kZVwiLFxuICAgIFwiY2hhckNvZGVcIlxuICBdLFxuICBcImluaXRLZXlFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiY3RybEtleVwiLFxuICAgIFwiYWx0S2V5XCIsXG4gICAgXCJzaGlmdEtleVwiLFxuICAgIFwibWV0YUtleVwiLFxuICAgIFwia2V5Q29kZVwiLFxuICAgIFwiY2hhckNvZGVcIlxuICBdXG59XG4iLCJtb2R1bGUuZXhwb3J0cz1tb2R1bGUuZXhwb3J0cz17XG4gIFwiTW91c2VFdmVudFwiIDogW1xuICAgIFwiY2xpY2tcIixcbiAgICBcIm1vdXNlZG93blwiLFxuICAgIFwibW91c2V1cFwiLFxuICAgIFwibW91c2VvdmVyXCIsXG4gICAgXCJtb3VzZW1vdmVcIixcbiAgICBcIm1vdXNlb3V0XCJcbiAgXSxcbiAgXCJLZXlib2FyZEV2ZW50XCIgOiBbXG4gICAgXCJrZXlkb3duXCIsXG4gICAgXCJrZXl1cFwiLFxuICAgIFwia2V5cHJlc3NcIlxuICBdLFxuICBcIk11dGF0aW9uRXZlbnRcIiA6IFtcbiAgICBcIkRPTVN1YnRyZWVNb2RpZmllZFwiLFxuICAgIFwiRE9NTm9kZUluc2VydGVkXCIsXG4gICAgXCJET01Ob2RlUmVtb3ZlZFwiLFxuICAgIFwiRE9NTm9kZVJlbW92ZWRGcm9tRG9jdW1lbnRcIixcbiAgICBcIkRPTU5vZGVJbnNlcnRlZEludG9Eb2N1bWVudFwiLFxuICAgIFwiRE9NQXR0ck1vZGlmaWVkXCIsXG4gICAgXCJET01DaGFyYWN0ZXJEYXRhTW9kaWZpZWRcIlxuICBdLFxuICBcIkhUTUxFdmVudHNcIiA6IFtcbiAgICBcImxvYWRcIixcbiAgICBcInVubG9hZFwiLFxuICAgIFwiYWJvcnRcIixcbiAgICBcImVycm9yXCIsXG4gICAgXCJzZWxlY3RcIixcbiAgICBcImNoYW5nZVwiLFxuICAgIFwic3VibWl0XCIsXG4gICAgXCJyZXNldFwiLFxuICAgIFwiZm9jdXNcIixcbiAgICBcImJsdXJcIixcbiAgICBcInJlc2l6ZVwiLFxuICAgIFwic2Nyb2xsXCJcbiAgXSxcbiAgXCJVSUV2ZW50XCIgOiBbXG4gICAgXCJET01Gb2N1c0luXCIsXG4gICAgXCJET01Gb2N1c091dFwiLFxuICAgIFwiRE9NQWN0aXZhdGVcIlxuICBdXG59XG4iLCIvKiFcbiAqIG9iamVjdC1leHRlbmRcbiAqIEEgd2VsbC10ZXN0ZWQgZnVuY3Rpb24gdG8gZGVlcCBleHRlbmQgKG9yIG1lcmdlKSBKYXZhU2NyaXB0IG9iamVjdHMgd2l0aG91dCBmdXJ0aGVyIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBodHRwOi8vZ2l0aHViLmNvbS9iZXJuaGFyZHdcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMywgQmVybmhhcmQgV2FuZ2VyIDxtYWlsQGJlcm5oYXJkd2FuZ2VyLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqXG4gKiBEYXRlOiAyMDEzLTA0LTEwXG4gKi9cblxuXG4vKipcbiAqIEV4dGVuZCBvYmplY3QgYSB3aXRoIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFNvdXJjZSBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gYiBPYmplY3QgdG8gZXh0ZW5kIHdpdGguXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBhIEV4dGVuZGVkIG9iamVjdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoYSwgYikge1xuXG4gICAgLy8gRG9uJ3QgdG91Y2ggJ251bGwnIG9yICd1bmRlZmluZWQnIG9iamVjdHMuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogUmVmYWN0b3IgdG8gdXNlIGZvci1sb29wIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxuICAgIE9iamVjdC5rZXlzKGIpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXG4gICAgICAgIC8vIERldGVjdCBvYmplY3Qgd2l0aG91dCBhcnJheSwgZGF0ZSBvciBudWxsLlxuICAgICAgICAvLyBUT0RPOiBQZXJmb3JtYW5jZSB0ZXN0OlxuICAgICAgICAvLyBhKSBiLmNvbnN0cnVjdG9yID09PSBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yXG4gICAgICAgIC8vIGIpIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChiKSA9PSAnW29iamVjdCBPYmplY3RdJ1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJba2V5XSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYVtrZXldKSAhPSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYVtrZXldID0gZXh0ZW5kKGFba2V5XSwgYltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gYTtcblxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9zbGljZWQnKTtcbiIsIlxuLyoqXG4gKiBBbiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpIGFsdGVybmF0aXZlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFyZ3Mgc29tZXRoaW5nIHdpdGggYSBsZW5ndGhcbiAqIEBwYXJhbSB7TnVtYmVyfSBzbGljZVxuICogQHBhcmFtIHtOdW1iZXJ9IHNsaWNlRW5kXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIHNsaWNlLCBzbGljZUVuZCkge1xuICB2YXIgcmV0ID0gW107XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcblxuICBpZiAoMCA9PT0gbGVuKSByZXR1cm4gcmV0O1xuXG4gIHZhciBzdGFydCA9IHNsaWNlIDwgMFxuICAgID8gTWF0aC5tYXgoMCwgc2xpY2UgKyBsZW4pXG4gICAgOiBzbGljZSB8fCAwO1xuXG4gIGlmIChzbGljZUVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuID0gc2xpY2VFbmQgPCAwXG4gICAgICA/IHNsaWNlRW5kICsgbGVuXG4gICAgICA6IHNsaWNlRW5kXG4gIH1cblxuICB3aGlsZSAobGVuLS0gPiBzdGFydCkge1xuICAgIHJldFtsZW4gLSBzdGFydF0gPSBhcmdzW2xlbl07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4iLCJcbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQsIHdoZW4gaW52b2tlZCwgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmUgdGltZSBwZXJcbiAqIGB3YWl0YCBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgYEZ1bmN0aW9uYCBpbnN0YW5jZSB0byB3cmFwLlxuICogQHBhcmFtIHtOdW1iZXJ9IHdhaXQgVGhlIG1pbmltdW0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IG11c3QgZWxhcHNlIGluIGJldHdlZW4gYGZ1bmNgIGludm9rYXRpb25zLlxuICogQHJldHVybiB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHRoYXQgd3JhcHMgdGhlIGBmdW5jYCBmdW5jdGlvbiBwYXNzZWQgaW4uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHRocm90dGxlIChmdW5jLCB3YWl0KSB7XG4gIHZhciBydG47IC8vIHJldHVybiB2YWx1ZVxuICB2YXIgbGFzdCA9IDA7IC8vIGxhc3QgaW52b2thdGlvbiB0aW1lc3RhbXBcbiAgcmV0dXJuIGZ1bmN0aW9uIHRocm90dGxlZCAoKSB7XG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBkZWx0YSA9IG5vdyAtIGxhc3Q7XG4gICAgaWYgKGRlbHRhID49IHdhaXQpIHtcbiAgICAgIHJ0biA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGxhc3QgPSBub3c7XG4gICAgfVxuICAgIHJldHVybiBydG47XG4gIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3R5cGUnKTtcbiIsIi8qIVxuICogdHlwZS1kZXRlY3RcbiAqIENvcHlyaWdodChjKSAyMDEzIGpha2UgbHVlciA8amFrZUBhbG9naWNhbHBhcmFkb3guY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyohXG4gKiBQcmltYXJ5IEV4cG9ydHNcbiAqL1xuXG52YXIgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZ2V0VHlwZTtcblxuLyohXG4gKiBEZXRlY3RhYmxlIGphdmFzY3JpcHQgbmF0aXZlc1xuICovXG5cbnZhciBuYXRpdmVzID0ge1xuICAgICdbb2JqZWN0IEFycmF5XSc6ICdhcnJheSdcbiAgLCAnW29iamVjdCBSZWdFeHBdJzogJ3JlZ2V4cCdcbiAgLCAnW29iamVjdCBGdW5jdGlvbl0nOiAnZnVuY3Rpb24nXG4gICwgJ1tvYmplY3QgQXJndW1lbnRzXSc6ICdhcmd1bWVudHMnXG4gICwgJ1tvYmplY3QgRGF0ZV0nOiAnZGF0ZSdcbn07XG5cbi8qKlxuICogIyMjIHR5cGVPZiAob2JqKVxuICpcbiAqIFVzZSBzZXZlcmFsIGRpZmZlcmVudCB0ZWNobmlxdWVzIHRvIGRldGVybWluZVxuICogdGhlIHR5cGUgb2Ygb2JqZWN0IGJlaW5nIHRlc3RlZC5cbiAqXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtTdHJpbmd9IG9iamVjdCB0eXBlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGdldFR5cGUob2JqKSB7XG4gIHZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKTtcbiAgaWYgKG5hdGl2ZXNbc3RyXSkgcmV0dXJuIG5hdGl2ZXNbc3RyXTtcbiAgaWYgKG9iaiA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmIChvYmogPT09IE9iamVjdChvYmopKSByZXR1cm4gJ29iamVjdCc7XG4gIHJldHVybiB0eXBlb2Ygb2JqO1xufVxuXG5leHBvcnRzLkxpYnJhcnkgPSBMaWJyYXJ5O1xuXG4vKipcbiAqICMjIyBMaWJyYXJ5XG4gKlxuICogQ3JlYXRlIGEgcmVwb3NpdG9yeSBmb3IgY3VzdG9tIHR5cGUgZGV0ZWN0aW9uLlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgbGliID0gbmV3IHR5cGUuTGlicmFyeTtcbiAqIGBgYFxuICpcbiAqL1xuXG5mdW5jdGlvbiBMaWJyYXJ5KCkge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTGlicmFyeSkpIHJldHVybiBuZXcgTGlicmFyeSgpO1xuICB0aGlzLnRlc3RzID0ge307XG59XG5cbi8qKlxuICogIyMjIyAub2YgKG9iailcbiAqXG4gKiBFeHBvc2UgcmVwbGFjZW1lbnQgYHR5cGVvZmAgZGV0ZWN0aW9uIHRvIHRoZSBsaWJyYXJ5LlxuICpcbiAqIGBgYGpzXG4gKiBpZiAoJ3N0cmluZycgPT09IGxpYi5vZignaGVsbG8gd29ybGQnKSkge1xuICogICAvLyAuLi5cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9iamVjdCB0byB0ZXN0XG4gKiBAcmV0dXJuIHtTdHJpbmd9IHR5cGVcbiAqL1xuXG5MaWJyYXJ5LnByb3RvdHlwZS5vZiA9IGdldFR5cGU7XG5cbi8qKlxuICogIyMjIyAuZGVmaW5lICh0eXBlLCB0ZXN0KVxuICpcbiAqIEFkZCBhIHRlc3QgdG8gZm9yIHRoZSBgLnRlc3QoKWAgYXNzZXJ0aW9uLlxuICpcbiAqIENhbiBiZSBkZWZpbmVkIGFzIGEgcmVndWxhciBleHByZXNzaW9uOlxuICpcbiAqIGBgYGpzXG4gKiBsaWIuZGVmaW5lKCdpbnQnLCAvXlswLTldKyQvKTtcbiAqIGBgYFxuICpcbiAqIC4uLiBvciBhcyBhIGZ1bmN0aW9uOlxuICpcbiAqIGBgYGpzXG4gKiBsaWIuZGVmaW5lKCdibG4nLCBmdW5jdGlvbiAob2JqKSB7XG4gKiAgIGlmICgnYm9vbGVhbicgPT09IGxpYi5vZihvYmopKSByZXR1cm4gdHJ1ZTtcbiAqICAgdmFyIGJsbnMgPSBbICd5ZXMnLCAnbm8nLCAndHJ1ZScsICdmYWxzZScsIDEsIDAgXTtcbiAqICAgaWYgKCdzdHJpbmcnID09PSBsaWIub2Yob2JqKSkgb2JqID0gb2JqLnRvTG93ZXJDYXNlKCk7XG4gKiAgIHJldHVybiAhISB+Ymxucy5pbmRleE9mKG9iaik7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge1JlZ0V4cHxGdW5jdGlvbn0gdGVzdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaWJyYXJ5LnByb3RvdHlwZS5kZWZpbmUgPSBmdW5jdGlvbih0eXBlLCB0ZXN0KSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSByZXR1cm4gdGhpcy50ZXN0c1t0eXBlXTtcbiAgdGhpcy50ZXN0c1t0eXBlXSA9IHRlc3Q7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiAjIyMjIC50ZXN0IChvYmosIHRlc3QpXG4gKlxuICogQXNzZXJ0IHRoYXQgYW4gb2JqZWN0IGlzIG9mIHR5cGUuIFdpbGwgZmlyc3RcbiAqIGNoZWNrIG5hdGl2ZXMsIGFuZCBpZiB0aGF0IGRvZXMgbm90IHBhc3MgaXQgd2lsbFxuICogdXNlIHRoZSB1c2VyIGRlZmluZWQgY3VzdG9tIHRlc3RzLlxuICpcbiAqIGBgYGpzXG4gKiBhc3NlcnQobGliLnRlc3QoJzEnLCAnaW50JykpO1xuICogYXNzZXJ0KGxpYi50ZXN0KCd5ZXMnLCAnYmxuJykpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7Qm9vbGVhbn0gcmVzdWx0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpYnJhcnkucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbihvYmosIHR5cGUpIHtcbiAgaWYgKHR5cGUgPT09IGdldFR5cGUob2JqKSkgcmV0dXJuIHRydWU7XG4gIHZhciB0ZXN0ID0gdGhpcy50ZXN0c1t0eXBlXTtcblxuICBpZiAodGVzdCAmJiAncmVnZXhwJyA9PT0gZ2V0VHlwZSh0ZXN0KSkge1xuICAgIHJldHVybiB0ZXN0LnRlc3Qob2JqKTtcbiAgfSBlbHNlIGlmICh0ZXN0ICYmICdmdW5jdGlvbicgPT09IGdldFR5cGUodGVzdCkpIHtcbiAgICByZXR1cm4gdGVzdChvYmopO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignVHlwZSB0ZXN0IFwiJyArIHR5cGUgKyAnXCIgbm90IGRlZmluZWQgb3IgaW52YWxpZC4nKTtcbiAgfVxufTtcbiIsInZhciBzbGljZWQgPSByZXF1aXJlKCdzbGljZWQnKSxcbiAgdHlwZSA9IHJlcXVpcmUoJ3R5cGUtZGV0ZWN0JyksXG4gIHNwbGl0ID0gcmVxdWlyZShcIi4vdXRpbC9zcGxpdC5qc1wiKTtcblxudmFyIGNvbmRpdGlvbnMgPSB7fTtcblxudmFyIGFkZENvbmRpdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGZ1bmMpIHtcbiAgaWYgKGNvbmRpdGlvbnNbbmFtZV0gPT09IHVuZGVmaW5lZCkgY29uZGl0aW9uc1tuYW1lXSA9IFtdO1xuICBjb25kaXRpb25zW25hbWVdLnB1c2goZnVuYyk7XCJcIlxufTtcblxudmFyIHJlbW92ZUNvbmRpdGlvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgZGVsZXRlIGNvbmRpdGlvbnNbbmFtZV07XG59XG5cbnZhciB0ZXN0Q29uZGl0aW9uID0gZnVuY3Rpb24obmFtZSkge1xuICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpbnZlcnQgPSBuYW1lLmluZGV4T2YoXCIhXCIpICE9PSAtMSA/IHRydWUgOiBmYWxzZTtcbiAgbmFtZSA9IGludmVydCA/IG5hbWUuc3Vic3RyKDEpIDogbmFtZTtcblxuICBpZiAoY29uZGl0aW9uc1tuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHN1YlRlc3RzID0gY29uZGl0aW9uc1tuYW1lXS5tYXAoZnVuY3Rpb24oY29uZGl0aW9uKSB7XG4gICAgICBpZiAodHlwZShjb25kaXRpb24pID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gY29uZGl0aW9uKCkgIT09IGludmVydDtcbiAgICAgIHJldHVybiBjb25kaXRpb24gIT09IGludmVydDtcbiAgICB9KTtcbiAgfVxuICBcbiAgcmV0dXJuIHN1YlRlc3RzICE9PSB1bmRlZmluZWQgJiYgc3ViVGVzdHMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufVxuXG52YXIgdGVzdEFsbCA9IGZ1bmN0aW9uKG5hbWVzKSB7XG4gIHJldHVybiBzcGxpdChuYW1lcykubWFwKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGVzdENvbmRpdGlvbihuYW1lKTtcbiAgfSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsaXN0OiBjb25kaXRpb25zLFxuXG4gIC8vIHUuY29uZGl0aW9ucy5hZGQoXCJpc01vYmlsZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIDwgNzIwOyB9KVxuICAvLyB1LmNvbmRpdGlvbnMuYWRkKHtcbiAgLy8gICAgaXNSZXRpbmE6IGZ1bmN0aW9uKCkgeyAvLyByZXRpbmEgdGVzdCB9LFxuICAvLyAgICBpc0hEOiB1LmRlYm91bmNlKGZ1bmN0aW9uKCkgeyByZXR1cm4gd2luZG93LndpZHRoKCkgPj0gMTkyMCAmJiB3aW5kb3cuaGVpZ2h0KCkgPj0gMTA4MDsgfSwgMzAwKVxuICAvLyB9KVxuICBhZGQ6IGZ1bmN0aW9uKG5hbWUsIGZ1bmMpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlZChhcmd1bWVudHMpO1xuXG4gICAgLy8gdS5jb25kaXRpb25zLmFkZChvYmopO1xuICAgIGlmICh0eXBlKGFyZ3NbMF0pID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIgbmFtZSBpbiBhcmdzWzBdKSB7XG4gICAgICAgIGFkZENvbmRpdGlvbihuYW1lLCBhcmdzWzBdW25hbWVdKVxuICAgICAgfVxuXG4gICAgLy8gdS5jb25kaXRpb25zLmFkZChzdHJpbmcsIGZ1bmMvYm9vbClcbiAgICB9IGVsc2UgaWYgKHR5cGUoYXJnc1swXSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyB1LmNvbmRpdGlvbnMuYWRkKFwiaXNNb2JpbGVcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cud2lkdGgoKSA+IDcyMDsgfSk7XG4gICAgICAvLyB1LmNvbmRpdGlvbnMuYWRkKFwiaXNMYXJnZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy53aWR0aCgpIDwgMTI4MDsgfSk7XG4gICAgICB2YXIgbmFtZXMgPSBzcGxpdChhcmdzWzBdKTtcblxuICAgICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGFkZENvbmRpdGlvbihuYW1lLCBhcmdzWzFdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuXG4gIC8vIHUuY29uZGl0aW9ucy5yZW1vdmUoXCJpc1JldGluYVwiKVxuICAvLyB1LmNvbmRpdGlvbnMucmVtb3ZlKFwiaXNNb2JpbGUgaXNMYXJnZVwiKVxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWVzKSB7XG4gICAgc3BsaXQobmFtZXMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgcmVtb3ZlQ29uZGl0aW9uKG5hbWUpXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gdS5jb25kaXRpb25zLnRlc3QoXCJpc1JldGluYVwiKSA9PT4gdHJ1ZS9mYWxzZVxuICB0ZXN0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRlc3RDb25kaXRpb24obmFtZSk7XG4gIH0sXG5cbiAgdGVzdEFsbDogdGVzdEFsbCxcblxuICB0ZXN0T3I6IGZ1bmN0aW9uKG5hbWVzKSB7XG4gICAgcmV0dXJuIHRlc3RBbGwobmFtZXMpLnNvbWUoZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gbmFtZTsgfSk7XG4gIH0sXG5cbiAgdGVzdEFuZDogZnVuY3Rpb24obmFtZXMpIHtcbiAgICByZXR1cm4gdGVzdEFsbChuYW1lcykuZXZlcnkoZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gbmFtZTsgfSk7XG4gIH1cbn1cblxuXG4vLyB0ZXN0cyAuLi4gc2hvdWxkIHdyaXRlIGdvb2Qgc3R1ZmYgaW5zdGVhZFxuXG4vLyB1LmNvbmRpdGlvbnMuYWRkKFwiaXNNb2JpbGVcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aCA8IDY0MDsgfSk7XG4vLyB1LmNvbmRpdGlvbnMuYWRkKFwiaXNMYXJnZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIDwgMTA4MDsgfSk7XG4vLyB1LmNvbmRpdGlvbnMuYWRkKHtcbi8vICBpc1JldGluYTogZnVuY3Rpb24oKSB7IC8vIHJldGluYSB0ZXN0IH0sXG4vLyAgaXNIRDogZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aCA+PSAxOTIwICYmIHdpbmRvdy5pbm5lckhlaWdodCA+PSAxMDgwOyB9XG4vLyB9KTtcblxuLy8gdS5jb25kaXRpb25zLnJlbW92ZShcImlzTW9iaWxlXCIpO1xuLy8gdS5jb25kaXRpb25zLnJlbW92ZShcImlzTW9iaWxlIGlzTGFyZ2VcIik7XG5cbi8vIHUuY29uZGl0aW9ucy50ZXN0KFwiaXNNb2JpbGVcIikgPT0+IHRydWUvZmFsc2Vcbi8vIHUuY29uZGl0aW9ucy50ZXN0QWxsKFwiaXNNb2JpbGUgaXNMYXJnZVwiKSA9PT4gW3RydWUsIGZhbHNlXVxuLy8gdS5jb25kaXRpb25zLnRlc3RPcihcImlzTW9iaWxlIGlzTGFyZ2VcIikgPT0+IHRydWVcbi8vIHUuY29uZGl0aW9ucy50ZXN0QW5kKFwiaXNNb2JpbGUgaXNMYXJnZVwiKSA9PT4gZmFsc2UiLCJ2YXIgZG9tID0gcmVxdWlyZSgnZG9tLWV2ZW50cycpLFxuICB0aW1lciA9IHJlcXVpcmUoJy4vdXRpbC90aW1lcnMuanMnKTtcblxuZXhwb3J0cy5kb20gPSBkb207XG5leHBvcnRzLnRpbWVyID0gdGltZXI7IiwidmFyIHNsaWNlZCA9IHJlcXVpcmUoJ3NsaWNlZCcpLFxuICB0eXBlID0gcmVxdWlyZSgndHlwZS1kZXRlY3QnKSxcbiAgc3BsaXQgPSByZXF1aXJlKCcuL3V0aWwvc3BsaXQuanMnKSxcbiAgY29uZGl0aW9ucyA9IHJlcXVpcmUoJy4vY29yZS5jb25kaXRpb25zLmpzJyk7XG5cblxudmFyIHJlc3BvbmRJZiA9IGZ1bmN0aW9uIHJlc3BvbmRJZiAobmFtZSwgZnVuYykgeyAgXG4gIGlmICh0eXBlKG5hbWUpID09PSAnYm9vbGVhbicgJiYgbmFtZSkge1xuICAgIHJldHVybiBmdW5jKCk7XG4gIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlc3BvbmQ6IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZnVuYywgYXJncykge1xuICAgIHZhciBhcmdzID0gc2xpY2VkKGFyZ3VtZW50cyk7XG4gICAgXG4gICAgaWYgKHR5cGUoYXJnc1swXSkgPT09ICdvYmplY3QnKSB7XG4gICAgICBcbiAgICB9IGVsc2UgaWYgKHR5cGUoYXJnc1swXSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoY29uZGl0aW9ucy50ZXN0KGNvbmRpdGlvbikpIGZ1bmMuYXBwbHkodGhpcywgYXJncy5zbGljZSgyKSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGNvbmRpdGlvbnMudGVzdChjb25kaXRpb24pKVxuXG5cbiAgfSxcbiAgcmVzcG9uZE9uY2U6IGZ1bmN0aW9uKCkge30sXG4gIHJlc3BvbmRXaGVuOiBmdW5jdGlvbigpIHt9LFxuICByZXNwb25kV2hpbGU6IGZ1bmN0aW9uKCkge31cbn1cblxuXG4vKlxuICB1bmljb3JuLnByb3RvdHlwZS5yZXNwb25kID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmdW5jKSB7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uKSAmJiAhY29uZGl0aW9uLmNhbGwodGhpcykpIHJldHVybjtcbiAgICBpZiAoaXNTdHJpbmcoY29uZGl0aW9uKSAmJiAhcmVzcG9uZElmLmNhbGwodGhpcywgY29uZGl0aW9uKSkgcmV0dXJuO1xuICAgIFxuICAgIGlmIChpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICBmdW5jKCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGZ1bmMpKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZnVuYy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmdW5jW2ldKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4qLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcuc3BsaXQoXCIgXCIpO1xufTsiLCJleHBvcnRzLmRlbGF5ID0gc2V0VGltZW91dDtcbmV4cG9ydHMucmVwZWF0ID0gc2V0SW50ZXJ2YWw7XG5cbmV4cG9ydHMuY2xlYXIgPSBmdW5jdGlvbih0aWQpIHtcbiAgY2xlYXJUaW1lb3V0KHRpZCk7XG4gIGNsZWFySW50ZXJ2YWwodGlkKTtcbn0iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnb2JqZWN0LWV4dGVuZCcpO1xuXG52YXIgY29uZGl0aW9ucyA9IHJlcXVpcmUoXCIuL2NvcmUvY29yZS5jb25kaXRpb25zLmpzXCIpLFxuXHRydW5uZXJzID0gcmVxdWlyZShcIi4vY29yZS9jb3JlLnJ1bm5lcnMuanNcIiksXG5cdGV2ZW50cyA9IHJlcXVpcmUoXCIuL2NvcmUvY29yZS5ldmVudHMuanNcIik7XG5cbnZhciB1bmljb3JuID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2V2ZW50cyA9IGV2ZW50cztcbiAgdGhpcy5fY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XG4gLy8gdGhpcy5fcnVubmVycyA9IHJ1bm5lcnM7XG5cbiAgdGhpcy5kZWJvdW5jZSA9IHJlcXVpcmUoJ2RlYm91bmNlJyk7XG4gIHRoaXMudGhyb3R0bGUgPSByZXF1aXJlKCd0aHJvdHRsZWl0Jyk7XG5cbiAgdGhpcy5hZGRDb25kaXRpb24gPSBjb25kaXRpb25zLmFkZDtcbiAgdGhpcy50ZXN0Q29uZGl0aW9uID0gY29uZGl0aW9ucy50ZXN0O1xuXG4gIGV4dGVuZCh0aGlzLCBydW5uZXJzKTtcbn07XG5cbndpbmRvdy51bmljb3JuID0gd2luZG93LnUgPSBuZXcgdW5pY29ybigpO1xubW9kdWxlLmV4cG9ydHMgPSB1bmljb3JuO1xuXG4vKlxuXG51LmNvbmRpdGlvbnMuYWRkKFwiaXNNb2JpbGVcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cud2lkdGgoKSA+IDcyMDsgfSk7XG51LmNvbmRpdGlvbnMuYWRkKFwiaXNMYXJnZVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy53aWR0aCgpIDwgMTI4MDsgfSk7XG51LmNvbmRpdGlvbnMuYWRkKHtcbiAgICBpc1JldGluYTogZnVuY3Rpb24oKSB7IC8vIHJldGluYSB0ZXN0IH0sXG4gICAgaXNIRDogZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cud2lkdGgoKSA+PSAxOTIwICYmIHdpbmRvdy5oZWlnaHQoKSA+PSAxMDgwOyB9LmRlYm91bmNlKDMwMClcbn0pO1xuXG51LmNvbmRpdGlvbnMucmVtb3ZlKFwiaXNSZXRpbmFcIik7XG51LmNvbmRpdGlvbnMucmVtb3ZlKFwiaXNNb2JpbGUgaXNMYXJnZVwiKTtcblxudS5jb25kaXRpb25zLnRlc3QoXCJpc1JldGluYVwiKSA9PT4gdHJ1ZS9mYWxzZVxuXG51LmNvbmRpdGlvbigpID0+IGZvcm1zOiB7XG4gICAgb2JqID09PiB1LmNvbmRpdGlvbnMuYWRkKG9iaikgZm9ybVxuICAgIHN0cmluZywgZnVuYyA9PT4gdS5jb25kaXRpb25zLmFkZChzdHJpbmcsIGZ1bmMpIGZvcm1cbiAgICBzdHJpbmcgPT0+IHUuY29uZGl0aW9ucy50ZXN0KFwic3RyaW5nIHN0cmluZyBzdHJpbmdcIikgZm9ybVxufVxuXG5cblxudS5ldmVudHMub24oXCIuYXBwXCIsIFwiaG92ZXJcIiwgXCJpc01vYmlsZVwiKTtcbnUuZXZlbnRzLm9uY2Uod2luZG93LCBcInJlc2l6ZVwiLCBcImlzTW9iaWxlIGlzTGFyZ2VcIik7XG5cblxuXG51LmV2ZW50cy5vZmYoXCIuYXBwXCIsIFwiaG92ZXJcIiwgXCJpc0xhcmdlXCIpO1xudS5ldmVudHMub2ZmKFwiLmFwcFwiLCBcImhvdmVyXCIpO1xuXG5cbnUud2hlbihcImlzTW9iaWxlXCIsIGZ1bmN0aW9uKCkge30pO1xudS53aGVuKFwiaXNNb2JpbGVcIiwgZnVuY3Rpb24oKSB7fSk7XG5cblxudSA9IHtcblx0X2V2ZW50cyxcblx0X2NvbmRpdGlvbnMsXG5cblx0dGhyb3R0bGUsXG5cdGRlYm91bmNlLFxuXG5cdGFkZENvbmRpdGlvbixcblx0dGVzdENvbmRpdGlvblxuXHRcblx0cmVzcG9uZFxuXHRvbmNlLFxuXHR3aGVuLFxuXHR3aGlsZVxuXG59XG5cbiovIl19
;