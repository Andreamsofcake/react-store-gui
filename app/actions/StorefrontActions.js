import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
import RootscopeActions from '../actions/RootscopeActions'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	init,
	registerKF,
	gotoDefaultIdlePage
} from '../utils/TsvUtils'


var StorefrontActions = {

  minusQty(product) { // coil
  	let coil = product.coilNumber;

  	console.log('removeAllQty ///////');
  	console.log(product, coil);

  	TsvActions.apiCall('removeFromCartByCoilNo', coil, (err, ok) => {
  		if (err) throw err;
  		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
  			if (err) throw err;
  			RootscopeActions.setCache('shoppingCart', data);
  		});
  	});
  },

  removeAllQty(product) { // coil, qty

  	let coil = product.coilNumber
  		, qty = product.qtyInCart
  		;

  	console.log('removeAllQty ///////');
  	console.log(product, coil, qty);

    TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
      if (err) throw err;
      RootscopeActions.setCache('shoppingCart', data);

      let removeQty = (qty) => {
        if (qty > 0) {
          qty -= 1;
          TsvActions.apiCall('removeFromCartByCoilNo', coil, (err, ok) => {
            if (err) throw err;
            TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
              if (err) throw err;
              RootscopeActions.setCache('shoppingCart', data);
              removeQty(qty);
            });
          });
        } else {
          TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
            if (err) throw err;
            RootscopeActions.setCache('shoppingCart', data);
          });
        }
      }

      removeQty(qty);
    });
  },

  addQty(product) { // coil

  	let coil = product.coilNumber;

  	console.log('removeAllQty ///////');
  	console.log(product, coil);

  	TsvActions.apiCall('addToCartByCoil', coil, (err, ok) => {
  		if (err) throw err;
  		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
  			if (err) throw err;
  			RootscopeActions.setCache('shoppingCart', data);
  		});
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

  addToCart(product, e) {
    if(product.stockCount > 0){
      TsvActions.apiCall('addToCartByProductID', product.productID, (err, response) => {
        if (err) throw err;
        RootscopeActions.setConfig('pvr', response);
        TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
          if (err) throw err;
          RootscopeActions.setCache('shoppingCart', data);
        });
      });
    }
  }


};

module.exports = StorefrontActions;
