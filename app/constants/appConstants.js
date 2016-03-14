/*****

		WEBPACK IS PUKING on including this in a "watch" update,
		have to stop and start it, which is fucking annoying.
		so, make my own key mirror.

********/
//var keyMirror = require('react/lib/keyMirror');

var keyMirror = function(obj) {
	Object.keys(obj).forEach(function(prop) {
		obj[prop] = prop;
	});
	return obj;
}

// simply mirrors the key to the value, so you don't have to type doubles all the time... :)
var appConstants = keyMirror({

// Root section updaters:
	UPDATE_ROOT_CONFIG: null,
	UPDATE_ROOT_CACHE: null,
	UPDATE_ROOT_SESSION: null,

// Foo Section Describer (optional)
	EXAMPLE_ACTION_CONSTANT: null,

});

module.exports = appConstants;
