#Unicorn

Unicorn is a judgmental pony that runs functions conditionally.  

##Methods

There are three main modules in unicorn: conditions, listeners, and responders.  
###Conditions

All condition function create conditional state machines.

```js

var isMediaSmall = Unicorn.Condition(function(width) {
    return width < 600;
});

var isMediaLarge = Unicorn.Condition(function(width) {
    return width > 1280;
});

var isPortrait = Unicorn.Condition(function(width, height) {
    return width < height
});

var isHighDpi = Unicorn.Condition(function() {
    // high dpi test
});

var isGalleryExpanded = Unicorn.Condition(function() {
    return $('.gallery').hasClass('is-expanded');
});

var isMediaMedium = 
  Unicorn.and(Unicorn.not(isMediaSmall), Unicorn.not(isMediaLarge));

Unicorn.and(isMediaMedium, isPortait).when(function() {
   // setup single column  
   // destroy multi column
});

Unicorn.and(isMediaMedium, Unicorn.not(isPortait)).when(function() {
   // setup multi column
   // destroy single column  
});

isHighDpi.once(function() {
    // update to highrez images
});

isGalleryExpanded.while(function() {
    // center modal
});


// condition instance api
Unicorn.Condition.value;
Unicorn.Condition.prev;
Unicorn.Condition.nth(number);
Unicorn.Condition.test(args);
Unicorn.Condition.respond(func);
Unicorn.Condition.once(func);
Unicorn.Condition.when(func);
Unicorn.Condition.while(func);

// composition api
Unicorn.Compose(command, args);

// Commands:
// - not
// - and
// - or
// - equal

// composing sugar
Unicorn.not()
Unicorn.and()
Unicorn.or()
Unicorn.equal()




$(window).on('resize', function() {
    var win = $(this);
    var width = win.innerWidth();
    var height = win.innerHeight();

    isMobile.test(width);
    isPortraitMobile.test(width, height)
});


```



- respond
- once
- when
- while


###Unicorn.addCondition

####addCondition(name, function)


Unicorn.removeCondition
Unicorn.test
Unicorn.testAll
Unicorn.testAnd
Unicorn.testOr
Unicorn.addListener
Unicorn.removeListener
Unicorn.once
Unicorn.when
Unicorn.while





###Future

plugin | purpose
--- | ---
unicorn.responsive.js | run functions via window resizing and breakpoints
