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