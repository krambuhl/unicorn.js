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


unicorn.addCondition
unicorn.removeCondition
unicorn.test
unicorn.testAll
unicorn.testAnd
unicorn.testOr
unicorn.addListener
unicorn.removeListener
unicorn.once
unicorn.when
unicorn.while


u.addCondition("name", test_function)
u.addCondition("name name", test_function)
u.addCondition({
  name: test_function,
  name: test_function
})

u.removeCondition("name", test_function)
u.removeCondition("name name", test_function)
u.removeCondition({
  name: test_function,
  name: test_function
})

u.test(condition_name) ==> true/false
u.testAll("name", "prew") ==> { name: true/false, prew: true/false }
u.testAnd("name prew") ==> true/false
u.testAnd("name", "prew") ==> true/false
u.testAnd(["name", "prew"]) ==> true/false
u.testOr("name prew") ==> true/false
u.testOr("name", "prew") ==> true/false
u.testOr(["name", "prew"]) ==> true/false

u.addListener(dom, event, condition_to_update)
u.addListener(dom, event, function)
u.addListener(dom, obj)

u.removeListener(dom, event, condition)
u.removeListener(dom, event, function)
u.removeListener(dom, event)
u.removeListener(dom)
u.removeListener(dom, obj)

// once `condition` is met, run `function`
u.once(condition, function, context)
u.when(condition, function, context)
u.while(condition, function, context)





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
