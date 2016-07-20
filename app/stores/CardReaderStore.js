import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		apiResponses: [],
		clientUsers: [],
		testCustomers: [],
		inventorySlotMap: [],
	}
	
//	, _storeDB = new muDB()
	;

//_storeDB.setDB(_store);

var CardReaderStore = objectAssign({}, EventEmitter.prototype, {
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

	lastApiResponse: function() {
		if (_store.apiResponses.length) {
			return _store.apiResponses[ _store.apiResponses.length - 1 ];
		}
		return null;
	},

	lastMatchedMembershipUser: function() {
		return _store.lastMatchedUser;
	},

	lastMembershipCardScan: function(type) {
		return _store.lastMembershipCardScanned;
	},

	lastIdCardScan: function(type) {
		return _store.lastIdScanned;
	},

	lastCreditCardScan: function(type) {
		return _store.lastCreditCardScanned;
	},

	
});

CardReaderStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.MEMBERSHIP_CARD_SCANNED:
			if (action.data && action.data.apiResponses) {
				_store.apiResponses.push(action.data.apiResponse);
			}
			_store.lastMembershipCardScanned = action.data.membership_id;
			CardReaderStore.emitChange({ type: action.actionType, token: action.data.token, membership_id: action.data.membership_id });
			break;

		case appConstants.MEMBERSHIP_CARD_MATCHED:
			if (action.data && action.data.apiResponses) {
				_store.apiResponses.push(action.data.apiResponse);
			}
			_store.lastMatchedUser = action.data.data;
			CardReaderStore.emitChange({ type: action.actionType, token: action.data.token, matchedUser: action.data.data });
			break;

		case appConstants.MEMBERSHIP_CARD_NOT_MATCHED:
			CardReaderStore.emitChange({ type: action.actionType, token: action.data.token });
			break;

		case appConstants.CLEAR_CARD_MODULE_BUFFER:
			_store.lastMembershipCardScanned = null;
			_store.lastIdScanned = null;
			_store.lastCreditCardScanned = null;
			_store.lastMatchedUser = null;
			break;

		case appConstants.CLEAR_CARD_MODULE_API_RESPONSES:
			_store.apiResponses = [];
			// not sure we want to emit on "clear" as that is generally called at componentWillUnmount() or processDone()
			// and shouldn't trigger an Invariant race condition on Dispatching
			//CardReaderStore.emitChange({ type: action.actionType });
			break;

		default:
			return true;
			break;
	}
});

module.exports = CardReaderStore;
