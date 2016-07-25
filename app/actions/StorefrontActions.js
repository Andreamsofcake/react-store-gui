import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import axios from 'axios'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	init,
	registerKF,
	gotoDefaultIdlePage
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('Storefront');

var StorefrontActions = {

	loadStorefrontData() {
		axios.get('/api/get-storefront-data')
		.then(response => {
			if (response.data && response.data.data) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.STOREFRONT_DATA_RECEIVED,
					data: response.data.data
				});
			}
		})
		.catch(error => {
			Big.error('failed to refresh storefront data???');
			Big.log(error);
		})
	},
  
	// this is used predominantly by admin refresh of storefront data, to pass through and update GUI
	setStorefrontData( data ) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.STOREFRONT_DATA_RECEIVED,
			data: data
		});
	},

	addToCart(product, e) {

		let cart = TsvSettingsStore.getCache('shoppingCart');

		Big.log('addToCart ///////');
		Big.log({ product, cart });

		// FIXME: temporary... TSV responsible for this.
		if (cart && cart.detail && cart.detail.length) {
			let alreadyInCart = cart.detail.filter( P => { return P.productID === product.productID } );
			if (alreadyInCart && alreadyInCart.length) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SINGLE_PRODUCTS_ONLY,
					data: null
				});
				return;
			}
		}

		if(product.stockCount > 0){
		  TsvActions.apiCall('addToCartByProductID', product.productID, (err, response) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setConfig('pvr', response);
			if (response && response.shoppingCart) {
				TsvSettingsStore.setCache('shoppingCart', response.shoppingCart);
			} else {
				TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
					if (err) Big.throw(err);
					TsvSettingsStore.setCache('shoppingCart', data);
				});
			}
			AppDispatcher.handleServerAction({
				actionType: appConstants.PRODUCT_ADDED_TO_CART,
				data: { product }
			});
		  });
		}
	},

	addQty(product) { // coil

		let coil = product.coilNumber;

		Big.log('addQty ///////');
		Big.log(product, coil);

		TsvActions.apiCall('addToCartByCoil', coil, (err, ok) => {
			if (err) Big.throw(err);
			if (ok && ok.shoppingCart) {
				TsvSettingsStore.setCache('shoppingCart', ok.shoppingCart);
			} else {
				TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
					if (err) Big.throw(err);
					TsvSettingsStore.setCache('shoppingCart', data);
				});
			}
			AppDispatcher.handleServerAction({
				actionType: appConstants.PRODUCT_QUANTITY_INCREASED,
				data: { product }
			});
		});
	},

	minusQty(product) { // coil
		let coil = product.coilNumber;

		Big.log('removeOneQty ///////');
		Big.log(product, coil);

		TsvActions.apiCall('removeFromCartByCoilNo', coil, (err, ok) => {
			if (err) Big.throw(err);
			if (ok && ok.shoppingCart) {
				TsvSettingsStore.setCache('shoppingCart', ok.shoppingCart);
			} else {
				TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
					if (err) Big.throw(err);
					TsvSettingsStore.setCache('shoppingCart', data);
				});
			}
			AppDispatcher.handleServerAction({
				actionType: appConstants.PRODUCT_QUANTITY_DECREASED,
				data: { product }
			});
		});
	},

	removeAllQty(product) { // coil, qty

		let coil = product.coilNumber
			, qty = product.qtyInCart
			;

		Big.log('removeAllQty ///////');
		Big.log(product, coil, qty);

		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setCache('shoppingCart', data);

			let removeQty = (qty) => {
				if (qty > 0) {
					qty -= 1;
					TsvActions.apiCall('removeFromCartByCoilNo', coil, (err, ok) => {
						if (err) Big.throw(err);
						if (ok && ok.shoppingCart) {
							TsvSettingsStore.setCache('shoppingCart', ok.shoppingCart);
						} else {
							TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
								if (err) Big.throw(err);
								TsvSettingsStore.setCache('shoppingCart', data);
								removeQty(qty);
							});
						}
					});
				} else {
					AppDispatcher.handleServerAction({
						actionType: appConstants.PRODUCT_REMOVED_FROM_CART,
						data: { product }
					});
				}
			}

			removeQty(qty);
		});
	},

	toggleIDtoCategoryFilter(ID) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.TOGGLE_CATEGORY_ID_TO_FILTER,
			data: ID
		});
	},

	clearCategoryFilter() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_CATEGORY_FILTER,
			data: null
		});
	},

};

module.exports = StorefrontActions;
