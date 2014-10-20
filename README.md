#Unicorn

Unicorn is a judgmental pony that runs functions conditionally.  

##Methods

There are three main modules in unicorn: conditions, listeners, and responders.  
###Conditions

All condition function create conditional state machines.  `addCondition` and `removeCondition`

```js

var isMediaSmall = Unicorn.Condition(function(width) {
    return width < 600;
});

var isMediaLarge = Unicorn.Condition(function(width) {
    return width > 1280;
});

var isMediaMedium = Unicorn.not(isMediaSmall, isMediaLarge);


var isPortrait = Unicorn.Condition(function(width, height) {
    return width < height
});

var isLandscape = Unicorn.not(isPortait);

var isPortraitSmall = Unicorn.and(isMediaSmall, isPortait);
var isLandscapeSmall = Unicorn.and(isMediaSmall, isLandscape);


Unicorn.not(isMediaSmall).when(function() {
   // setup multi column
   // destroy single column  
});

isMediaSmall.when(function() {
    this ==> {
        history: [true, false, false, true],
        hasBeenTrue: true,
        
    }
   // setup single column  
   // destroy multi column
});


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
