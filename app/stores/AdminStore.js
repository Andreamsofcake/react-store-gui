import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

import Log from '../utils/BigLogger'
var Big = new Log('AdminStore');

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
	},

	getClientUsers: function() {
		return _store.clientUsers;
	},

	getTestCustomers: function() {
		return _store.testCustomers;
	},
	
	getInventorySlotmap: function() {
		return _store.inventorySlotMap;
	},
	
});

AdminStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.TEST_REGISTER_PRINT:
		case appConstants.TEST_MATCH_PRINT:
		case appConstants.REGISTER_CLIENT_USER_PRINT:
			if (action.data && action.data.apiResponses) {
				_store.apiResponses = action.data.apiResponses;
			}
			AdminStore.emitChange({ type: action.actionType });
			break;
			
		case appConstants.CLIENT_USERS_RECEIVED:
			Big.log('CLIENT_USERS_RECEIVED');
			Big.log(action);
			_store.clientUsers = action.data.data;
			AdminStore.emitChange({ type: action.actionType });
			break;
			
		case appConstants.TEST_CUSTOMERS_RECEIVED:
			_store.testCustomers = action.data.data;
			AdminStore.emitChange({ type: action.actionType });
			break;
			
		case appConstants.STOREFRONT_DATA_REFRESHED:
			//_store.clientUsers = action.data.clientUsers;
			AdminStore.emitChange({ type: action.actionType, data: action.data });
			break;

		case appConstants.CLEAR_TEST_PRINT_API_RESPONSES:
			_store.apiResponses = [];
			break;
		
		case appConstants.INVENTORY_SLOTMAP_RECEVIED:
			_store.inventorySlotMap = action.data.data;
			AdminStore.emitChange({ type: action.actionType });
			break;
		
		case appConstants.CLIENTUSER_BIOMETRIC_RECORD_ADDED:
			AdminStore.emitChange({ type: action.actionType });
			break;

		case appConstants.MACHINE_CLOUD_CONFIG_REFRESHED:
			//Big.log('MACHINE_CLOUD_CONFIG_REFRESHED');
			//Big.log(action);
			AdminStore.emitChange({ type: action.actionType, data: action.data });
			break;

		case appConstants.INVENTORY_SLOTMAP_CLEAR:
			_store.inventorySlotMap = [];
			AdminStore.emitChange({ type: action.actionType });
			break;
		
		default:
			return true;
			break;
	}
});

module.exports = AdminStore;
