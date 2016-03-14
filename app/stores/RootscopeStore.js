import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import TsvService from '../lib/TsvService'
import { * } as Translate from '../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {

		session: {
			cashMsg: Translate.translate("Cash_Vending", "HintMessageInsertCash"),
			cardMsg: Translate.translate("Card_Vending", "InstructionMessage"),
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
			categories: null,
			products: null
		},

		cache: {
			shoppingCart: {},
			productList: {},
			planogram: {},
			machineSettings: {},
			custommachinesettings: {},
			machineList: {},
			prdHashTable: {}
		},

		config: {
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
		this.emit(CHANGE_EVENT);
	},

	getConfig: function(path) {
		return _storeDB.get('config.' + path);
	},

	getCache: function(path) {
		return _storeDB.get('cache.' + path);
	},

	getSession: function(path) {
		return _storeDB.get('session.' + path);
	}

});

RootscopeStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.UPDATE_ROOT_CONFIG:
			_storeDB.set('config.' + action.data.path, action.data.value);
			RootscopeStore.emitChange();
			break;
			
		case appConstants.UPDATE_ROOT_CACHE:
			_storeDB.set('cache.' + action.data.path, action.data.value);
			RootscopeStore.emitChange();
			break;
			
		case appConstants.UPDATE_ROOT_SESSION:
			_storeDB.set('session.' + action.data.path, action.data.value);
			RootscopeStore.emitChange();
			break;
			
		case appConstants.EXAMPLE_ACTION_CONSTANT:
			if (action.data) {
				setFoo(action.data);
			}
			RootscopeStore.emitChange();
			break;

		default:
			return true;
			break;
	}
});

module.exports = RootscopeStore;
