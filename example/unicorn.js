
(function() {
	var root = this;

	var unicorn = function() {
    	if (!(this instanceof unicorn)) 
    		return new unicorn();
		
	    init.call(this)
   	};

	unicorn.VERSION = '0.0.1';

	// Initialize the unicorn
	var init = function() {
		this.setGrid(80, 0)

		this.tracker = { 
			while: {},
			when: {},
			once: {}
		};

		this.breakpoints = {};
		this.addBreakpointGrid("mobile", 0, 6);
		this.addBreakpointGrid("tablet", 6, 9);
		this.addBreakpointGrid("screen", 9, 12);
		this.addBreakpointGrid("large",  12, undefined);

		// add resize event to window to track screen updates
		addEvent(window, "resize", setWindowSizing.bind(this));
	}

	var setWindowSizing = function () {
		var that = this;

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		for (var breakpoint in this.tracker.while) {
			this.respond(breakpoint, this.tracker.while[breakpoint]);
		}

		for (var breakpoint in this.breakpoints) {
			if(respondIf.call(this, breakpoint) && this.lastBreakpoint != breakpoint) {
				this.lastBreakpoint = breakpoint;

				if (this.tracker.when[breakpoint] !== undefined) {
					var funcs = that.tracker.when[breakpoint];
					for(var i = 0; i < funcs.length; i++) {
						funcs[i]();
					}
				}

				if (this.tracker.once[breakpoint] !== undefined) {
					var funcs = that.tracker.once[breakpoint];
					for(var i = 0; i < funcs.length; i++) {
						funcs[i]();
					}
				}
			}
		}
	}

	var addEvent = function(elem, type, eventHandle) {
		if (elem == null || elem == undefined) return;
		if (elem.addEventListener) {
			elem.addEventListener(type, eventHandle, false);
		} else if (elem.attachEvent) {
			elem.attachEvent("on" + type, eventHandle);
		} else {
			elem["on" + type] = eventHandle;
		}
	}

	// utility functions (via underscore)
	var isFunction = function(func) { return Object.prototype.toString.call(func) == '[object Function]'; }
	var isString = function(func) { return Object.prototype.toString.call(func) == '[object String]'; }
	var isArray = function(obj) { return toString.call(obj) == '[object Array]'; }

	// Grid functions
	unicorn.prototype.setGrid = function(column, gutter) {
		this.grid = {
			column: column,
			gutter: gutter
		}
	}

	unicorn.prototype.gridw = function(span, offset) {
		if (span === undefined) return undefined;
		if (offset === undefined) offset = 0;

		return (this.grid.column * span) + (this.grid.gutter * (span - 1)) + offset;
	}

	// Add a breakpoint to the system
	unicorn.prototype.addBreakpoint = function (name, func) {
		if (!isString(name) || !isFunction(func)) return;
		this.breakpoints[name] = func;
	}

	// sugar for width range functions
	unicorn.prototype.addBreakpointRange = function(name, min, max) {
		var that = this;
		this.addBreakpoint(name, function() {
			if (min !== undefined && max !== undefined && that.width >= min && that.width < max) return true;
			else if (max === undefined && min !== undefined && that.width >= min) return true;
			else if (min === undefined && max !== undefined && that.width < max) return true;
			else return false;
		})
	}

	unicorn.prototype.addBreakpointGrid = function(name, min, max) {
		this.addBreakpointRange(name, this.gridw(min), this.gridw(max))
	}

	var respondIf = function(breakpoint) {
		if (isString(breakpoint)
			&& this.breakpoints[breakpoint] !== undefined 
			&& this.breakpoints[breakpoint].call(this)) return true;

		return false;
	}

	// 
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

	// function will respond the first time a breakpoint conditional is true
	unicorn.prototype.once = function(breakpoint, func) { 
		var that = this;
		methodTemplate.call(this, "once", function() {
			delete that.tracker.once[breakpoint];
		}, breakpoint, func); 
	}

	// .when
	// function will respond once each time each time a breakpoint conditional is true
	unicorn.prototype.when = function(breakpoint, func) {
		methodTemplate.call(this, "when", undefined, breakpoint, func); 
	}

	// .while
	// function will respond for each window.resize event 
	// while breakpoint conditional is true
	unicorn.prototype.while = function(breakpoint, func) { 
		methodTemplate.call(this, "while", undefined, breakpoint, func); 
	}

	var methodTemplate = function(methodName, methodFunc, breakpoint, func) {
		var that = this,
			breaks = [];

		if (breakpoint == "all") {
			for (var breakpoint in this.breakpoints) {
				breaks.push(breakpoint)
			}
		} else if (breakpoint.indexOf(" ") == -1) {
			breaks = [breakpoint]
		} else {
			breaks = breakpoint.split(" ");
		}

		for (var i = 0; i < breaks.length; i++) {
			if (that.tracker[methodName][breaks[i]] === undefined) 
				that.tracker[methodName][breaks[i]] = []
			
			that.tracker[methodName][breaks[i]].push(function() {
				if (methodFunc !== undefined) methodFunc.call(this);
				func();
			});
		}

		setWindowSizing.call(this);
	}

  	// exposes namespace
	root.unicorn = root.u = unicorn();
}).call(this);