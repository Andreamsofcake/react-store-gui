/**************************



		ATTENTION: this is not the usual Flux Store!
		
		this is a hybrid action-store solely set up to support the phase 1 refactor
		of the existing AVT angular app.
		
		that original app has two very different logical flows:
		- synchronous ajax calls to the server
		- a sprawling management of settings across a multitude of what I'll call "mini-stores"
		
		these two things are problematic in React flow, because:
		- flux is designed to have a dispatching loop that handles events,
			and the dispatch loop does not allow dispatching while a dispatch is being handled
		- the design of the original app's settings management allows for synchronous on-demand get/set access,
			but converting ALL of them to the flux loop is not feasible as many are done in succession,
			which ultimately results in flux loop dispatcher being called out of sequence
			(and resulting in an "Invariant" error which throws a big error)
			>> and many hacks already in the code of using ms timeouts simply to stagger settings, not good
		
		current solution that this script provides:
		- allows the on-demand get/set of the original app flow
		- does not use the flux loop, so is not bound by the dispatcher problems
		- still uses the basic event emitter pattern to bubble up settings changes to components that need to know about them
		
		

***************************/

//import AppDispatcher from '../dispatcher/AppDispatcher'
//import appConstants from '../constants/appConstants'
import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

//import { currencyFilter } from '../utils/TsvUtils'
// only need this for testing, whether or not to attach this to window (at bottom of script):
import { isClient } from '../utils'

import Log from '../utils/BigLogger'
var Big = new Log('TsvSettingsStore');

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

var TsvSettingsStore = objectAssign({}, EventEmitter.prototype, {
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
		Big.warn('using getDB, should only be used for testing purposes!');
		return _storeDB.getDB();
	},

	setConfig(path, value) {
		if (value === undefined && path && typeof path === 'object') {
			Object.keys(path).forEach( KEY => {
				_storeDB.set('config.' + KEY, path[KEY]);
			});
			path = '__multiple__';
		} else {
			_storeDB.set('config.' + path, value);
		}
		TsvSettingsStore.emitChange({ type: 'config', path: path });
	},
	
	setCache(path, value) {
		if (value === undefined && path && typeof path === 'object') {
			Object.keys(path).forEach( KEY => {
				_storeDB.set('cache.' + KEY, path[KEY]);
			});
			path = '__multiple__';
		} else {
			_storeDB.set('cache.' + path, value);
		}
		TsvSettingsStore.emitChange({ type: 'cache', path: path });
	},

	setSession(path, value) {
		if (value === undefined && path && typeof path === 'object') {
			Object.keys(path).forEach( KEY => {
				_storeDB.set('session.' + KEY, path[KEY]);
			});
			path = '__multiple__';
		} else {
			_storeDB.set('session.' + path, value);
		}
		TsvSettingsStore.emitChange({ type: 'session', path: path });
	},

});

//*
//Big.warn("\n\n -------------------------------------------------------\n\n TsvSettingsStore loaded!\n\n -------------------------------------------------------\n\n");
if (isClient) {
	window.RSS = TsvSettingsStore;
}
//*/

export default TsvSettingsStore;
