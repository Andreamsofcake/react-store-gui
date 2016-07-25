import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		session: null,
		apiResponses: null
	}
	
//	, _storeDB = new muDB()
	;

//_storeDB.setDB(_store);

var TransactionStore = objectAssign({}, EventEmitter.prototype, {
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
	
	getApiResponses: function() {
		return _store.apiResponses;
	},
	
	getCurrentTransaction: function() {
		return _store.transaction;
	}

});

TransactionStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

/*
	TRANSACTION_CREATED: null,
	TRANSACTION_UPDATED: null,
	TRANSACTION_COMPLETED: null,
	TRANSACTION_CANCELLED: null,
	CREDIT_PURCHASE_COMPLETED: null,

// not in use yet:
	TRANSACTION_FAILED: null,
	CASH_PURCHASE_COMPLETED: null,
	CREDITCARD_PURCHASE_COMPLETED: null,
	BITCOIN_PURCHASE_COMPLETED: null,
*/

		case appConstants.TRANSACTION_CREATED:
		case appConstants.TRANSACTION_UPDATED:
			if (action.data.data) {
				_store.transaction = action.data.data;
			}
			TransactionStore.emitChange({ type: action.actionType });
			break;

		case appConstants.CREDIT_PURCHASE_COMPLETED:
			TransactionStore.emitChange({ type: action.actionType, customerCredit: action.data.credit });
			break;
		
		case appConstants.TRANSACTION_COMPLETED:
		case appConstants.TRANSACTION_DROPPED:
		//case appConstants.TRANSACTION_FAILED: // this is not in use yet
			TransactionStore.emitChange({ type: action.actionType, transaction: _store.transaction });
			_store.transaction = null;
			break;
		
		case appConstants.TRANSACTION_AND_SESSION_CLOSED:
		case appConstants.TRANSACTION_AND_SESSION_DROPPED:
			// NO EVENT BUBBLE! SessionStore bubbles this one....
			//TransactionStore.emitChange({ type: action.actionType, transaction: _store.transaction });
			_store.transaction = null;
			break;

		case appConstants.KILL_TRANSACTION:
			// no event bubble here!
			_store.transaction = null;
			break;

		default:
			return true;
			break;
	}
});

module.exports = TransactionStore;
