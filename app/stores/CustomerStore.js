import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

import { isClient } from '../utils'

var CHANGE_EVENT = 'change'
	, _store = {
		loginStepsComplete: [],
		signupStepsComplete: [],
		customer: null
	}
;

function pushStep(kind, step){
	if (_store[kind + 'StepsComplete']) {
		if (_store[kind + 'StepsComplete'].indexOf(step) === -1) {
			_store[kind + 'StepsComplete'].push(step);
		}
	}
}

function clearSteps(kind){
	if (_store[kind + 'StepsComplete']) {
		_store[kind + 'StepsComplete'] = []
	}
}

function setCustomer(obj) {
	_store.customer = obj;
}

function clearCustomer() {
	_store.customer = null;
}

var CustomerStore = objectAssign({}, EventEmitter.prototype, {
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

	getStepsCompleted: function(kind) {
		if (_store[kind + 'StepsComplete']) {
			return _store[kind + 'StepsComplete'];
		}
		return [];
	},

	getCustomer: function() {
		return _store.customer;
	}
});

CustomerStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

/// signup
		case appConstants.LICENSE_SCANNED_SIGNUP:
			if (action.data.status === 'ok') {
				pushStep('signup', appConstants.LICENSE_SCANNED_SIGNUP);
			}
			CustomerStore.emitChange({ type: appConstants.LICENSE_SCANNED_SIGNUP, status: action.data.status });
			break;

		case appConstants.PRINT_SCANNED_SIGNUP:
			if (action.data.status === 'ok') {
				pushStep('signup', appConstants.PRINT_SCANNED_SIGNUP);
			}
			CustomerStore.emitChange({ type: appConstants.PRINT_SCANNED_SIGNUP, status: action.data.status });
			break;
		
		case appConstants.EMAIL_CAPTURED_SIGNUP:
			if (action.data.status === 'ok') {
				pushStep('signup', appConstants.EMAIL_CAPTURED_SIGNUP);
			}
			CustomerStore.emitChange({ type: appConstants.EMAIL_CAPTURED_SIGNUP, status: action.data.status });
			break;
		
		case appConstants.MOBILE_NUMBER_CAPTURED_SIGNUP:
			if (action.data.status === 'ok') {
				pushStep('signup', appConstants.MOBILE_NUMBER_CAPTURED_SIGNUP);
			}
			CustomerStore.emitChange({ type: appConstants.MOBILE_NUMBER_CAPTURED_SIGNUP, status: action.data.status });
			break;
		
		case appConstants.ADMIN_VERIFIED_SIGNUP:
			if (action.data.status === 'ok') {
				pushStep('signup', appConstants.ADMIN_VERIFIED_SIGNUP);
			}
			CustomerStore.emitChange({ type: appConstants.ADMIN_VERIFIED_SIGNUP, status: action.data.status });
			break;

		case appConstants.CUSTOMER_REGISTERED_SIGNUP:
			// CustomerStore will decide if the event is ok or err
			if (action.data.status === 'ok' && action.data.customer) {
				clearSteps('signup');
				setCustomer(action.data.customer);
			} else {
				clearCustomer();
			}
			CustomerStore.emitChange({ type: appConstants.CUSTOMER_REGISTERED_SIGNUP, status: action.data.status });
			break;

		case appConstants.CUSTOMER_RESET_SIGNUP:
			clearSteps('signup');
			CustomerStore.emitChange({ type: appConstants.CUSTOMER_RESET_SIGNUP });
			break;

/// login
		case appConstants.LICENSE_SCANNED_LOGIN:
			if (action.data.status === 'ok') {
				pushStep('login', appConstants.LICENSE_SCANNED_LOGIN);
			}
			CustomerStore.emitChange({ type: appConstants.LICENSE_SCANNED_LOGIN, status: action.data.status });
			break;

		case appConstants.PRINT_SCANNED_LOGIN:
			if (action.data.status === 'ok') {
				pushStep('login', appConstants.PRINT_SCANNED_LOGIN);
			}
			CustomerStore.emitChange({ type: appConstants.PRINT_SCANNED_LOGIN, status: action.data.status });
			break;
		
		case appConstants.CUSTOMER_MATCHED_LOGIN:
			// CustomerStore will decide if the event is ok or err
			if (action.data.status === 'ok' && action.data.customer) {
				clearSteps('login');
				setCustomer(action.data.customer);
			} else {
				clearCustomer();
			}
			CustomerStore.emitChange({ type: appConstants.CUSTOMER_MATCHED_LOGIN, status: action.data.status });
			break;

		case appConstants.CUSTOMER_RESET_LOGIN:
			clearSteps('login');
			CustomerStore.emitChange({ type: appConstants.CUSTOMER_RESET_LOGIN });
			break;
		
		case appConstants.CUSTOMER_REFRESH:
			clearSteps('login');
			clearSteps('signup');
			if (action.data) {
				setCustomer(action.data.customer);
			}
			CustomerStore.emitChange({ type: appConstants.CUSTOMER_REFRESH, status: action.data.status });
			break;

		case appConstants.CUSTOMER_LOGOUT:
			clearSteps('login');
			clearSteps('signup');
			clearCustomer();
			CustomerStore.emitChange({ type: appConstants.CUSTOMER_LOGOUT });
			break;
		
		default:
			return true;
			break;
	}
});

module.exports = CustomerStore;