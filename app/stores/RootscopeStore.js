import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

import { currencyFilter } from '../utils/TsvUtils'

import { isClient } from '../utils'

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		
		appConfig: {
			name: 'SDK-Vending-Gui',
			version: '0.0.1',
			date: '2016-03-22'
		},

		session: {
			cashMsg: Translate.translate("CashVending", "HintMessageInsertCash"),
			cardMsg: Translate.translate("CardVending", "InstructionMessage"),
			bVendedOldCredit: false,
			bVendingInProcess: false,
			vendErrorMsg1: "vendErrorMsg1",
			vendErrorMsg2: "vendErrorMsg2",
			vendSettleTotal: 0,
			creditBalance: 0,
			discount: 0,
			bRunningAutoMap: false,
			machineID: 0,
			bVendedOldCredit: false,
			//categories: null, // legacy, not used (config.categories instead)
			products: null
		},

		cache: {
			shoppingCart: {},
			productList: {},
			planogram: {},
			machineSettings: {},
			// pre-setting this from the actual settings for testing:
			custommachinesettings: {
				paymentPageTimeout: 65000
			},
			machineList: {},
			prdHashTable: {}
		},

		config: {
			currencyType: 'currency',
			failing:true,
			failCount:0,
			eventSubscriptions:{},
			bShowLanguageFlag: false,
			bShowLanguage: false,
			bShowCredit: false,
			bCashless: false,
			bDualMachine: false,
			itemsInCart: 0,
			bInsufficientFunds: false,
			bDisplayCgryNavigation: false,
			bDisplayCgryNavigation2: false,
			categories: []
		}
	}
	
	, _storeDB = new muDB()
	;

_storeDB.setDB(_store);

// example updater functions (triggered by Dispatch + appConstant listeners)
function setFoo(data) {
	_store.foo = data;
}

function addToFoo(data) {
	_store.foo.push( data );
}

function setBar(data) {
	_store.bar = data;
}

function updateBar(path, data) {
	_store.bar[path] = data;
}

// example getter functions (no direct setting in stores!)
var RootscopeStore = objectAssign({}, EventEmitter.prototype, {
	addChangeListener: function(cb) {
		this.on(CHANGE_EVENT, cb);
	},

	removeChangeListener: function(cb) {
		this.removeListener(CHANGE_EVENT, cb);
	},

	emitChange: function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(CHANGE_EVENT);
		this.emit.apply(this, args );
	},

	getConfig: function(path, dflt) {
		path = path ? 'config.' + path : 'config';
		var result = _storeDB.get(path);
		if (typeof result !== 'undefined' && result !== null) {
			return result;
		}
		return dflt;
	},

	getCache: function(path, dflt) {
		path = path ? 'cache.' + path : 'cache';
		var result = _storeDB.get(path);
		if (typeof result !== 'undefined' && result !== null) {
			return result;
		}
		return dflt;
	},

	getSession: function(path, dflt) {
		path = path ? 'session.' + path : 'session';
		var result = _storeDB.get(path);
		if (typeof result !== 'undefined' && result !== null) {
			return result;
		}
		return dflt;
	},
	
	getAppConfig: function() {
		return _storeDB.get('appConfig');
	},

	getDB: function() {
		return _storeDB.getDB();
	}

});

RootscopeStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.UPDATE_ROOT_CONFIG:
			if (!action.data.value && action.data.path && typeof action.data.path === 'object') {
				Object.keys(action.data.path).forEach( KEY => {
					_storeDB.set('config.' + KEY, action.data.path[KEY]);
				});
				action.data.path = '__multiple__';
			} else {
				_storeDB.set('config.' + action.data.path, action.data.value);
			}
			RootscopeStore.emitChange({ type: 'config', path: action.data.path });
			break;
			
		case appConstants.UPDATE_ROOT_CACHE:
			if (!action.data.value && action.data.path && typeof action.data.path === 'object') {
				Object.keys(action.data.path).forEach( KEY => {
					_storeDB.set('cache.' + KEY, action.data.path[KEY]);
				});
				action.data.path = '__multiple__';
			} else {
				_storeDB.set('cache.' + action.data.path, action.data.value);
			}
			RootscopeStore.emitChange({ type: 'cache', path: action.data.path });
			//console.warn(' someone updated CACHE, args:');
			//console.log(action.data);
			break;
			
		case appConstants.UPDATE_ROOT_SESSION:
			if (!action.data.value && action.data.path && typeof action.data.path === 'object') {
				Object.keys(action.data.path).forEach( KEY => {
					_storeDB.set('session.' + KEY, action.data.path[KEY]);
				});
				action.data.path = '__multiple__';
			} else {
				_storeDB.set('session.' + action.data.path, action.data.value);
			}
			RootscopeStore.emitChange({ type: 'session', path: action.data.path });
			break;
			
		default:
			return true;
			break;
	}
});

//*
//console.warn("\n\n -------------------------------------------------------\n\n RootscopeStore loaded!\n\n -------------------------------------------------------\n\n");
if (isClient) {
	window.RSS = RootscopeStore;
}
//*/

module.exports = RootscopeStore;

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
function intersect(a, b) { var t; if (b.length > a.length) t = b, b = a, a = t; return a .filter(function(e) { return (b.indexOf(e) !== -1) }) .filter(function (e, i, c) { return c.indexOf(e) === i; }); }
