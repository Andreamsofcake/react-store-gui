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
	
	getCurrentSession: function() {
		//console.log('getCurrentSession()')
		//console.log(_store.session);
		return _store.session;
	}

});

SessionStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.SESSION_CREATED:
		case appConstants.SESSION_UPDATED:
		case appConstants.ADDED_USER_TO_SESSION:
			if (action.data) {
				_store.session = action.data.data;
				//console.log('set session data:');
				//console.log(_store.session);
			//} else {
				//console.warn(action);
				//throw new Error(action.actionType + ': no session found?');
			}
			SessionStore.emitChange({ type: action.actionType });
			break;

		case appConstants.SESSION_CLOSED:
		case appConstants.SESSION_DROPPED:
		case appConstants.TRANSACTION_AND_SESSION_CLOSED:
		case appConstants.TRANSACTION_AND_SESSION_DROPPED:
			console.warn(action);
			SessionStore.emitChange({ type: action.actionType, session: _store.session, transaction: action.data.trasaction });
			_store.session = null;
			break;

		case appConstants.KILL_SESSION:
			// no event bubble here!
			console.warn('session killed');
			_store.session = null;
			break;

		default:
			return true;
			break;
	}
});

module.exports = SessionStore;
