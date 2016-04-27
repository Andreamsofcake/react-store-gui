import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

import TsvActions from '../actions/TsvActions'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

var CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		reconnectProxyDelay: 10000,
		tryProxyReconnects: true
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
	}

});

TsvStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.FLASH_API_MULTIEVENT:
			console.log('FLASH_API_MULTIEVENT dispatched... action:');
			console.log(action);
			console.log(JSON.stringify(action));
			if (action.data && action.data.length) {
				let method = action.data.shift();
				if (method === 'linkdown') {
					if (getReconnectFlag()) {
						var ms = getReconnectProxyDelay(10000);
						console.warn(' LINK DOWN DOWN DOWN received.... try a reconnect in '+ms+'ms');
						TsvActions.reconnectHandshake(ms);
					}
				} else {
					TsvStore.emitChange({ method, data: action.data });
				}
			} else {
				if (!action.data) {
					console.error('FLASH_API_MULTIEVENT but no data');
					console.log(action.data);
				} else {
					if (action.data.hasOwnProperty('tryProxyReconnects')) {
						setReconnectFlag(action.data.tryProxyReconnects);
					}
				}
			}
			break;
			
		default:
			return true;
			break;
	}
});

module.exports = TsvStore;
