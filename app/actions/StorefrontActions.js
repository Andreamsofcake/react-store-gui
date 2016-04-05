import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

var StorefrontActions = {
  setConfig(path, value) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_ROOT_CONFIG,
			data: { path, value }
		});
	},
  setCache(path, value) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_ROOT_CACHE,
			data: { path, value }
		});
	},

	setSession(path, value) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_ROOT_SESSION,
			data: { path, value }
		});
	},
  
  checkout() {
		var bHasShoppingCart = TsvService.bCustomSetting('bHasShoppingCart', true)
			, fundsAvailable = RootscopeStore.getConfig('fundsAvailable')
			, summary = RootscopeStore.getConfig('summary')
			;

		if (fundsAvailable >= summary.TotalPrice) {
			browserHistory.push("/Cashless_Vending");

		} else {
			//console.log("bHasShoppingCart:" + TsvService.bCustomSetting('bHasShoppingCart', "true"));
			if (bHasShoppingCart && RootscopeStore.getCache('currentLocation') != "/Shopping_Cart"){
				browserHistory.push("/Shopping_Cart");

			} else {

				if (bHasShoppingCart) {
					return browserHistory.push("/Shopping_Cart");
				}

				if (TsvService.bCustomSetting('bAskForReceipt', false)) {
					this.setConfig('keyboardView', "Enter_Email");
					browserHistory.push("/Keyboard");
				} else {
					this.gotoPayment();
				}
			}
		}
	},

	gotoPayment(){

		var TotalPrice = RootscopeStore.getCache('shoppingCart.summary.TotalPrice', 0);

		if (TotalPrice != 0
			&& TsvService.bCustomSetting('HasCreditCard', true)
			&& TsvService.bCustomSetting('HasBillCoin', false)) {
			browserHistory.push("/Cash_Card");

		} else {

			if (TsvService.bCustomSetting('HasBillCoin', false)){
				browserHistory.push("/Cash_Vending");

			} else if (TsvService.bCustomSetting('HasCreditCard', true)) {
				browserHistory.push("/Card_Vending");

			} else if (TotalPrice == 0) {
				browserHistory.push("/Card_Vending");
			}
		}
	},

	updateCredit() {
		var session = RootscopeStore.getSession(null, {});
		this.setConfig('credit', session.discount + session.creditBalance);
		/*
		TsvService.debug("Updated credit to include discount "
			+ TsvService.session.discount + " + " + TsvService.session.creditBalance
			+ " = "
			+ $rootScope.credit);
		*/
	},

	coupon() {
		RootscopeStore.setConfig('keyboardView', "Enter_Coupon");
		browserHistory.push("/Keyboard");
	}
};

module.exports = StorefrontActions;
