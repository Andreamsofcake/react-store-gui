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

// Storefront:
	TOGGLE_CATEGORY_ID_TO_FILTER: null,
	CLEAR_CATEGORY_FILTER: null,
	
// Customer:
	CUSTOMER_LOGOUT: null,

	LICENSE_SCANNED_LOGIN: null,
	PRINT_SCANNED_LOGIN: null,
	CUSTOMER_MATCHED_LOGIN: null,

	LICENSE_SCANNED_SIGNUP: null,
	PRINT1_SCANNED_SIGNUP: null,
	PRINT2_SCANNED_SIGNUP: null,
	PRINT3_SCANNED_SIGNUP: null,

// Emulator:
	TEST_EMULATOR_RESULT: null,

// Foo Section Describer (optional)
	EXAMPLE_ACTION_CONSTANT: null,

});

module.exports = appConstants;
