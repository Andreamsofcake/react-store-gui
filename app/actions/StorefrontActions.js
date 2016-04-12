import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import TsvService from '../../lib/TsvService'
import RootscopeActions from '../actions/RootscopeActions'

// import SocketAPI from '../utils/SocketAPI'
// import axios from 'axios'
// import { browserHistory } from 'react-router'

var StorefrontActions = {

  minusQty(product) { // coil
  	let coil = product.coilNumber;

  	console.log('removeAllQty ///////');
  	console.log(product, coil);

  	TsvService.removeFromCartByCoilNo(coil, (err, ok) => {
  		if (err) throw err;
  		TsvService.fetchShoppingCart2(null, (err, data) => {

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

    TsvService.fetchShoppingCart2(null, (err, data) => {

      if (err) throw err;
      RootscopeActions.setCache('shoppingCart', data);

      let removeQty = (qty) => {
        if (qty > 0) {
          qty -= 1;
          TsvService.removeFromCartByCoilNo(coil, (err, ok) => {
            if (err) throw err;
            TsvService.fetchShoppingCart2(null, (err, data) => {
              if (err) throw err;
              RootscopeActions.setCache('shoppingCart', data);
              removeQty(qty);
            });
          });
        } else {
          TsvService.fetchShoppingCart2(null, (err, data) => {
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

  	TsvService.addToCartByCoil(coil, (err, ok) => {
  		if (err) throw err;
  		TsvService.fetchShoppingCart2(null, (err, data) => {

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
      TsvService.addToCartByProductID(product.productID, (err, response) => {
        if (err) throw err;
        RootscopeActions.setConfig('pvr', response);

        TsvService.fetchShoppingCart2(null, (err, data) => {
          if (err) throw err;
          RootscopeActions.setCache('shoppingCart', data);
          console.log('shopping cart')
          console.log(data);
        });
      });
    }
  }


};

module.exports = StorefrontActions;
