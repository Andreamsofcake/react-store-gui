import Log from './BigLogger'
var Big = new Log('UtilsIndex');

export function getPropsFromRoute({ routes }, componentProps) {
	let props = {};
	const lastRoute = routes[routes.length - 1];

	routes.reduceRight((prevRoute, currRoute) => {
	   
		componentProps.forEach(componentProp => {
			if (!props[componentProp] && currRoute.component[componentProp]) {
				props[componentProp] = currRoute.component[componentProp];
			}
		});
		
	}, lastRoute);

	return props;
}

export function _encodeURIComponent(str) {
	str = encodeURIComponent(str);
	str = str.replace('(', '%28');
	str = str.replace(')', '%29');
	str = str.replace('|', '%7C');
	return str;
}

export const isClient = (typeof document !== 'undefined');

/**
 * Returns a "clean" string for use in web-url-friendly tokens
 * <br />(essentially just a limited alphachar filter)
 * @function cleanString
 * @param {string} - (or ARRAY_OF_STRINGS)
 * @returns {string} - "clean" string
 */
export function cleanString(str, nodash) {
	
	nodash = nodash || false;
	
	if (str instanceof Array) {
		str.forEach(function(T, idx) {
			str[idx] = this.cleanString(T, nodash);
		}.bind(this));
		
		return str;

	} else {
	
		// Remove spaces
			var clean = str.trim().replace(/\s/g, '_');

		if (nodash) {
			// Restrict to alphanumeric, underscore
			clean = clean.replace(/[^A-Za-z0-9_]/g, '');
		} else {
			// Restrict to alphanumeric, underscore, dash
			clean = clean.replace(/[^A-Za-z0-9_\-]/g, '');
		}
	
		return clean;
	}
}

/**
 * moneyformat(amount, n, x, s, c)
 * 
 * @param number  amount to format
 * @param integer n: length of decimal
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 * @param integer x: length of whole part
 *
 * borrowed from: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
 */
export function moneyformat(amount, n, s, c, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = amount.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

/**
 * Generate unique guid ID
 * @function uniq
 * @returns {string} uniq gui-ish ID
 */
export function uniq() {
	var uniq = Math.random() + '',
		ts = new Date().getTime();
	uniq = uniq.split('.');
	uniq = uniq[ uniq.length-1 ];
	uniq = uniq.substr(0, 5);
	return uniq;
}

/**
 * takes inbound string or whatever and returns a boolean. true/TRUE is true, everything else is false
 * @function forceBoolean
 * @returns {boolean}
 */
export function forceBoolean(bool) {
	if (typeof bool === 'string') {
		switch (bool) {
			case 'true':
			case 'TRUE':
			case 1:
			case '1':
				bool = true;
				break;
			default:
				bool = false;
				break;
		}
	}
	return bool;
}

/**
 * wrapper for setTimeout to have a way to see how much time is left
 * call: var myTimer = new Timer(cb, 1000);
 * @function callback - callback function to run at end of timer
 * @number delay - ms of delay
 * @returns {boolean}
 */
export function timer(callback, delay) {
    var id, started, remaining = delay, running, selfReference, done = false;
    
    if (typeof callback !== 'function') {
    	Big.throw('timer needs a callback!');
    }
    
    //Big.log('someone made a new timer.... delay='+delay+', remaining='+remaining);

    // wrap the callback and attempt to destroy self (memory leak worry):
    function _callback() {
    	// only callback once
    	if (!done) {
			running = false;
			done = true;
			clearTimeout(id);
			id = null;
			if (selfReference) {
				selfReference = null;
			}
			//Big.error("\n\ncalling back from new timer func... remaining: "+remaining+"\n\n");
			callback();
		}
    }
    
    this.start = function() {
        if (remaining > 0) {
			//Big.log('start timer.... delay='+delay+', remaining='+remaining + ', ('+!!(remaining)+'), '+(typeof remaining));
			running = true;
			started = new Date();
			//id = setTimeout(callback, remaining);
	        id = setTimeout(_callback, remaining);
	    } else {
	    	_callback();
	    }
    }
    
    // function to try and allow passing in of created reference for destruction (see _callback() above)
    this.self = function( self ) {
    	if (self) { selfReference = self; }
    }

    this.pause = function() {
        running = false;
        clearTimeout(id);
        remaining -= new Date() - started;
    }
    
    this.getDelay = function() {
    	return delay;
    }

    this.getTimeLeft = function() {
    	//Big.warn("\n\ncalling back from new timer func > getTimeLeft...\n\n");
        if (running) {
            this.pause();
            this.start();
        }
        return remaining;
    }

    this.getStateRunning = function() {
        return running;
    }

    // semantic aliases:
    this.stop = this.pause;
    this.play = this.start;

    this.start();

}

/*
function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
	return a
		.filter(function(e) { return (b.indexOf(e) !== -1) }) // same as before
		.filter(function (e, i, c) { // extra step to remove duplicates
			return c.indexOf(e) === i;
		});
}
*/
/**
 * computes intersect of two arrays
 * @array a - array to intersect
 * @array b - array to intersect
 * @returns {array} - intersect of a and b
 */
export function intersect(a, b) { var t; if (b.length > a.length) t = b, b = a, a = t; return a .filter(function(e) { return (b.indexOf(e) !== -1) }) .filter(function (e, i, c) { return c.indexOf(e) === i; }); }
