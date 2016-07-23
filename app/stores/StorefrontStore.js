import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import * as Translate from '../../lib/Translate'
import TsvSettingsStore from './TsvSettingsStore'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

import RootscopeStore from './RootscopeStore'
import Log from '../utils/BigLogger'
var Big = new Log('StorefrontStore');

import { isClient } from '../utils'

var CHANGE_EVENT = 'change'
, _store = {
	categoryIdFilter: [],
	storefrontData: {
		products: [],
		productImages: [],
		categories: [],
		planogram: {}
	}
}

// , _storeDB = new muDB()
;

function setStorefrontData(databomb) {
	_store.storefrontData.products = databomb.products || [];
	_store.storefrontData.productImages = databomb.productImages || [];
	_store.storefrontData.categories = databomb.categories || [];
	_store.storefrontData.planogram = databomb.planogram || [];
}

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
	
	getStorefrontData(which) {
		if (which && _store.storefrontData[which]) {
			return _store.storefrontData[which];
		}
		return _store.storefrontData;
	},
	
	getImagesForProduct(product) {
		if (product && _store.storefrontData.productImages.length) {
			return _store.storefrontData.productImages.filter( I => { return I.product === product._id });
		}
		return null;
	},
	
	decorateProducts(avtProducts) {
		if (!avtProducts) return avtProducts;
		var isSingle = false;
		// make sure an array, but just return the one result.
		if (!(avtProducts instanceof Array)) {
			avtProducts = [avtProducts];
			isSingle = true;
		}
		if (_store.storefrontData.products.length) {
			var stack = [];
			avtProducts.forEach( AP => {
				let thisProd = _store.storefrontData.products.filter( P => { return P._id == AP.productName; });
				if (thisProd && thisProd.length) {
					thisProd = JSON.parse( JSON.stringify( thisProd[0] ));
					/*
					thisProd.price = AP.price;
					thisProd.productID = AP.productID;
					thisProd.inventoryCount = AP.inventoryCount;
					thisProd.stockCount = AP.stockCount;
					if (AP.qtyInCart) {
						thisProd.qtyInCart = AP.qtyInCart;
					}
					*/
					Object.keys(AP).forEach( KEY => {
						if (!thisProd.hasOwnProperty(KEY) || !thisProd[KEY]) {
							thisProd[KEY] = AP[KEY]
						}
					});
					stack.push(thisProd);
				}
			});
			return isSingle ? stack.pop() : stack;
		}
		// FAIL
		return isSingle ? avtProducts.pop() : avtProducts;
	},

	getProductById: function(productID) {
		/*
			FIXME: KLOOOODGE ALERT:
			we are still straddling old and new code,
			currently all products are kept in the RootscopeStore,
			eventually they will be here.
		*/
		let products = TsvSettingsStore.getSession('products');
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
			StorefrontStore.emitChange({ type: action.actionType });
			break;

		case appConstants.CLEAR_CATEGORY_FILTER:
			clearFilter();
			StorefrontStore.emitChange({ type: action.actionType });
			break;

		case appConstants.STOREFRONT_DATA_RECEIVED:
			setStorefrontData(action.data);
			StorefrontStore.emitChange({ type: appConstants.STOREFRONT_DATA_RECEIVED });
			break;

		case appConstants.SINGLE_PRODUCTS_ONLY:
			StorefrontStore.emitChange({ type: action.actionType });
			break;

		default:
			return true;
			break;
	}
});

module.exports = StorefrontStore;
