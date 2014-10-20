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
