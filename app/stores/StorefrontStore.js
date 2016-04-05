import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

import { isClient } from '../utils'

var CHANGE_EVENT = 'change'
, _store = {

  appConfig: {
    name: 'SDK-Vending-Gui',
    version: '0.0.1',
    date: '2016-03-22'
  },

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
    // pre-setting this from the actual settings for testing:
    custommachinesettings: {
      paymentPageTimeout: 65000
    },
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

var StorefrontStore = objectAssign({}, EventEmitter.prototype, {
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
		if (typeof result !== 'undefined') {
			return result;
		}
		return dflt;
	},

	getCache: function(path, dflt) {
		path = path ? 'cache.' + path : 'cache';
		var result = _storeDB.get(path);
		if (typeof result !== 'undefined') {
			return result;
		}
		return dflt;
	},

	getSession: function(path, dflt) {
		path = path ? 'session.' + path : 'session';
		var result = _storeDB.get(path);
		if (typeof result !== 'undefined') {
			return result;
		}
		return dflt;
	},

  getCreditMessage: function() {
		if (_storeDB.get('config.bCashless')) {
			return Translate.translate("BalanceLabel") + ":" + '\n' + TsvService.currencyFilter( _storeDB.get('config.fundsAvailable') );
		}else {
			return Translate.translate("CreditLabel") + ":"  + '\n'+  TsvService.currencyFilter( _storeDB.get('config.credit') );
		}
	},

	getShowCredit: function() {
		if (_storeDB.get('config.bCashless')) {
			var fundsA = _storeDB.get('config.fundsAvailable');
			return typeof fundsA !== 'undefined' && fundsA !== 0 && _storeDB.get('config.bShowCredit');
		} else {
			var credit = _storeDB.get('config.credit');
			return typeof credit !== 'undefined' && credit !== 0 && _storeDB.get('config.bShowCredit');
		}
	},

  getAppConfig: function() {
		return _storeDB.get('appConfig');
	}
});

StorefrontStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.UPDATE_ROOT_CONFIG:
			_storeDB.set('config.' + action.data.path, action.data.value);
			StorefrontStore.emitChange({ type: 'config', path: action.data.path });
			break;

		case appConstants.UPDATE_ROOT_CACHE:
			_storeDB.set('cache.' + action.data.path, action.data.value);
			StorefrontStore.emitChange({ type: 'cache', path: action.data.path });
			//console.warn(' someone updated CACHE, args:');
			//console.log(action.data);
			break;

		case appConstants.UPDATE_ROOT_SESSION:
			_storeDB.set('session.' + action.data.path, action.data.value);
			StorefrontStore.emitChange({ type: 'session', path: action.data.path });
			break;

		case appConstants.EXAMPLE_ACTION_CONSTANT:
			if (action.data) {
				setFoo(action.data);
			}
			StorefrontStore.emitChange();
			break;

		default:
			return true;
			break;
	}
});

if (isClient) {
	window.RSS = StorefrontStore;
}

module.exports = StorefrontStore;
