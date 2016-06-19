import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		session: null
	}
	
//	, _storeDB = new muDB()
	;

//_storeDB.setDB(_store);

var SessionStore = objectAssign({}, EventEmitter.prototype, {
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

});

SessionStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

/*
	SESSION_CREATED: null,
	SESSION_UPDATED: null,
	ADDED_USER_TO_SESSION: null,
	SESSION_CLOSED: null,
	SESSION_DROPPED: null,
	TRANSACTION_CREATED: null,
	TRANSACTION_UPDATED: null,
*/

		case appConstants.TEST_REGISTER_PRINT:
		case appConstants.TEST_MATCH_PRINT:
			if (action.data && action.data.apiResponses) {
				_store.apiResponses = action.data.apiResponses;
			}
			SessionStore.emitChange({ type: action.actionType });
			break;
			
		case appConstants.CLEAR_API_RESPONSES:
			_store.apiResponses = [];
			break;
		
		default:
			return true;
			break;
	}
});

module.exports = SessionStore;
