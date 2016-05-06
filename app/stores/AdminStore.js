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
		apiResponses: []
	}
	
//	, _storeDB = new muDB()
	;

//_storeDB.setDB(_store);

var AdminStore = objectAssign({}, EventEmitter.prototype, {
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
	}

});

AdminStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.TEST_REGISTER_PRINT:
		case appConstants.TEST_MATCH_PRINT:
			if (action.data && action.data.apiResponses) {
				_store.apiResponses = action.data.apiResponses;
			}
			AdminStore.emitChange({ type: action.actionType });
			break;
			
		case appConstants.CLEAR_API_RESPONSES:
			_store.apiResponses = [];
			break;

		default:
			return true;
			break;
	}
});

module.exports = AdminStore;
