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