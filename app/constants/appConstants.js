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

// Root section updaters: << deprecate eventually!
	UPDATE_ROOT_CONFIG: null,
	UPDATE_ROOT_CACHE: null,
	UPDATE_ROOT_SESSION: null,

// Storefront:
	TOGGLE_CATEGORY_ID_TO_FILTER: null,
	CLEAR_CATEGORY_FILTER: null,
	STOREFRONT_DATA_RECEIVED: null,
	SINGLE_PRODUCTS_ONLY: null, // flag used by our temporary restriction on number of products a person can buy
	
// Customer loads and unloads and stuff
	CUSTOMER_LOADED: null, // "load by membership id"
	CUSTOMER_VERIFIED_AND_LOADED: null, // "admin verify and load by membership id"
	CUSTOMER_LOGOUT: null,

///// >> need a lot of action name clean up here! a lot of testing crap laying around
/*
	LICENSE_SCANNED_LOGIN: null,
	PRINT_SCANNED_LOGIN: null,
	CUSTOMER_MATCHED_LOGIN: null,
	CUSTOMER_RESET_LOGIN: null,
	MEMBERSHIP_CARD_SCANNED_LOGIN: null,

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
*/
	
// REAL print scan/match actions:
	PRINT_SCANNED_1: null,
	PRINT_SCANNED_2: null,
	PRINT_SCANNED_3: null,
	PRINT_SCAN_FAILED: null,
	PRINT_SCAN_ENROLLENT_FAILED: null,
	PRINT_REGISTERED: null,
	PRINT_MATCHED: null,
	PRINT_NOT_MATCHED: null,
	CLEAR_PRINT_MODULE_API_RESPONSES: null,
	CLEAR_PRINT_MODULE_DATA: null,

// REAL card scan/match actions:
	MEMBERSHIP_CARD_SCANNED: null,
	MEMBERSHIP_CARD_MATCHED: null,
	MEMBERSHIP_CARD_NOT_MATCHED: null,
	ID_CARD_SCANNED: null,
	ID_CARD_MATCHED: null,
	ID_CARD_NOT_MATCHED: null,
	CREDIT_CARD_SCANNED: null,
	CLEAR_CARD_MODULE_BUFFER: null,
	CLEAR_CARD_MODULE_API_RESPONSES: null,

// Session
	SESSION_CREATED: null,
	SESSION_UPDATED: null,
	ADDED_USER_TO_SESSION: null,
	SESSION_CLOSED: null,
	SESSION_DROPPED: null,
	
// Transactions
	TRANSACTION_CREATED: null,
	TRANSACTION_UPDATED: null,
	CREDIT_PURCHASE_COMPLETED: null,

// Emulator / GUI testing:
	TEST_EMULATOR_RESULT: null,
	TEST_CUSTOMERS_RECEIVED: null,

// Admin panel:
	TEST_REGISTER_PRINT: null,
	TEST_MATCH_PRINT: null,
	CLEAR_TEST_PRINT_API_RESPONSES: null,
	MACHINE_INFO: null,
	REGISTER_CLIENT_USER_PRINT: null,
	CLIENT_USERS_RECEIVED: null,
	STOREFRONT_DATA_REFRESHED: null,
	INVENTORY_SLOTMAP_RECEVIED: null,
	INVENTORY_SLOTMAP_CLEAR: null,
	CLIENTUSER_BIOMETRIC_RECORD_ADDED: null,

// TSV:
	FLASH_API_MULTIEVENT: null,
	FLASH_API: null,

});

module.exports = appConstants;
