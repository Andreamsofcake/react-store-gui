import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

import RootscopeStore from './RootscopeStore'

import { isClient } from '../utils'

var CHANGE_EVENT = 'change'
, _store = {
  categoryIdFilter: []
}

// , _storeDB = new muDB()
;

function toggleIDtoCategoryFilter(ID) {
  if(_store.categoryIdFilter.indexOf(ID)== -1){
    _store.categoryIdFilter.push(ID);
  }
  else {
    _store.categoryIdFilter.splice(_store.categoryIdFilter.indexOf(ID), 1)
  }
}

function clearFilter(){
  _store.categoryIdFilter = []
}
// _storeDB.setDB(_store);

var StorefrontStore = objectAssign({}, EventEmitter.prototype, {
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

	getCategoryFilter: function() {
		return _store.categoryIdFilter
	},

	getProductById: function(productID) {
		/*
			FIXME: KLOOOODGE ALERT:
			we are still straddling old and new code,
			currently all products are kept in the RootscopeStore,
			eventually they will be here.
		*/
		let products = RootscopeStore.getSession('products');
		if (products) {
			let found = products.filter( P => { return P.productID == productID } );
			if (found && found.length) {
				return found.pop();
			}
		}
		return null;
	}
});

StorefrontStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.TOGGLE_CATEGORY_ID_TO_FILTER:
			toggleIDtoCategoryFilter(action.data);
			StorefrontStore.emitChange();
			break;

		case appConstants.CLEAR_CATEGORY_FILTER:
			clearFilter();
			StorefrontStore.emitChange();
			break;

		default:
			return true;
			break;
	}
});

module.exports = StorefrontStore;
