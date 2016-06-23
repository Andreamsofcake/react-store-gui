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
	STOREFRONT_DATA_RECEIVED: null,
	
// Customer:
	CUSTOMER_LOGOUT: null,

	LICENSE_SCANNED_LOGIN: null,
	PRINT_SCANNED_LOGIN: null,
	CUSTOMER_MATCHED_LOGIN: null,
	CUSTOMER_RESET_LOGIN: null,

	LICENSE_SCANNED_SIGNUP: null,
//	PRINT_SCANNED_SIGNUP: null,
	PRINT_1SCANNED_SIGNUP: null,
	PRINT_2SCANNED_SIGNUP: null,
	PRINT_3SCANNED_SIGNUP: null,
	MOBILE_NUMBER_CAPTURED_SIGNUP: null,
	EMAIL_CAPTURED_SIGNUP: null,
	PHOTO_TAKEN_SIGNUP: null,
	CUSTOMER_REGISTERED_SIGNUP: null,
	CUSTOMER_RESET_SIGNUP: null,
	CUSTOMER_REFRESH: null,
	ADMIN_VERIFIED_SIGNUP: null,
	
	CUSTOMER_LOADED: null, // "load by membership id"
	CREDIT_PURCHASE_COMPLETED: null,
	MEMBERSHIP_CARD_SCANNED_LOGIN: null,

// Emulator:
	TEST_EMULATOR_RESULT: null,

// Admin panel:
	TEST_REGISTER_PRINT: null,
	TEST_MATCH_PRINT: null,
	CLEAR_API_RESPONSES: null,
	MACHINE_INFO: null,
	REGISTER_CLIENT_USER_PRINT: null,
	CLIENT_USERS_RECEIVED: null,
	STOREFRONT_DATA_REFRESHED: null,
	TEST_CUSTOMERS_RECEIVED: null,

// Session
	SESSION_CREATED: null,
	SESSION_UPDATED: null,
	ADDED_USER_TO_SESSION: null,
	SESSION_CLOSED: null,
	SESSION_DROPPED: null,
	TRANSACTION_CREATED: null,
	TRANSACTION_UPDATED: null,
	
	CREDIT_PURCHASE_COMPLETED: null,

// TSV:
	FLASH_API_MULTIEVENT: null,
	FLASH_API: null,

// Foo Section Describer (optional)
	EXAMPLE_ACTION_CONSTANT: null,

});

module.exports = appConstants;
