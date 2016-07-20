import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import * as Translate from '../../lib/Translate'

import TsvActions from '../actions/TsvActions'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

import Log from '../utils/BigLogger'
var Big = new Log('TsvStore');

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		reconnectProxyDelay: 10000,
		tryProxyReconnects: true,
		machineInfo: null
	}
	
	, _storeDB = new muDB()
	;

_storeDB.setDB(_store);

function getReconnectFlag() {
	return _store.tryProxyReconnects;
}

function getReconnectProxyDelay(ms) {
	return _store.reconnectProxyDelay || ms;
}

function setReconnectFlag(flag) {
	_store.tryProxyReconnects = flag;
}

function setReconnectProxyDelay(ms) {
	_store.reconnectProxyDelay = ms;
}

var TsvStore = objectAssign({}, EventEmitter.prototype, {
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

	getMachineInfo: function() {
		return _store.machineInfo;
	}

});

TsvStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.FLASH_API_MULTIEVENT:
			Big.log('FLASH_API_MULTIEVENT dispatched... action:');
			Big.log(action);
			Big.log(JSON.stringify(action));
			if (action.data && action.data.length) {
				let method = action.data.shift();
				if (method === 'linkdown') {
					if (getReconnectFlag()) {
						var ms = getReconnectProxyDelay(10000);
						Big.warn(' LINK DOWN DOWN DOWN received.... try a reconnect in '+ms+'ms');
						TsvActions.reconnectHandshake(ms);
					}
				} else {
					TsvStore.emitChange({ method, data: action.data });
				}
			} else {
				if (!action.data) {
					Big.error('FLASH_API_MULTIEVENT but no data');
					Big.log(action.data);
				} else {
					if (action.data.hasOwnProperty('tryProxyReconnects')) {
						setReconnectFlag(action.data.tryProxyReconnects);
					}
				}
			}
			break;
			
		case appConstants.MACHINE_INFO:
			_store.machineInfo = action.data.data;
			TsvStore.emitChange({ type: action.actionType });
			break;

		default:
			return true;
			break;
	}
});

module.exports = TsvStore;
