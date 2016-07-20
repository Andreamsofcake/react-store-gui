import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

import Log from '../utils/BigLogger'
var Big = new Log('PrintReaderStore');

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

var PrintReaderStore = objectAssign({}, EventEmitter.prototype, {
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
	
	lastMatchedUser: function() {
		return _store.lastMatchedUser;
	},
	
});

PrintReaderStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.PRINT_SCANNED_1:
		case appConstants.PRINT_SCANNED_2:
		case appConstants.PRINT_SCANNED_3:
		case appConstants.PRINT_REGISTERED:
		case appConstants.PRINT_MATCHED:
		case appConstants.PRINT_NOT_MATCHED:
			if (action.data && action.data.apiResponse) {
				_store.apiResponses.push(action.data.apiResponse);
			}
			PrintReaderStore.emitChange({ type: action.actionType, token: action.data.token });
			break;

		case appConstants.PRINT_MATCHED:
		case appConstants.PRINT_NOT_MATCHED:
			Big.log('match or not match? ' + action.actionType);
			if (action.data && action.data.apiResponse) {
				_store.apiResponses.push(action.data.apiResponse);
			}
			if (action.data.matchedUser) {
				Big.log('last matched user: ' + action.data.matchedUser);
				_store.lastMatchedUser = action.data.matchedUser;
			}
			PrintReaderStore.emitChange({ type: action.actionType, token: action.data.token, matchedUser: action.data.matchedUser || null });
			break;

		case appConstants.CLEAR_PRINT_MODULE_DATA:
			_store.lastMatchedUser = null;
			break;

		case appConstants.CLEAR_PRINT_MODULE_API_RESPONSES:
			_store.apiResponses = [];
			// not sure we want to emit on "clear" as that is generally called at componentWillUnmount() or processDone()
			// and shouldn't trigger an Invariant race condition on Dispatching
			//PrintReaderStore.emitChange({ type: action.actionType });
			break;

		default:
			return true;
			break;
	}
});

module.exports = PrintReaderStore;
