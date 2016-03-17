import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeStore from '../stores/RootscopeStore'

var RootscopeActions = {
	
	exampleAjaxGetAction( params ) {
		axios.get('/foo/bar/baz', {
			params: {
				params // .get() turns this into a ?query=string
			}
		})
		.then(response => {
			if (response.data && response.data.data) {
				if (response.data.data.contexts) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
						data: response.data.data
					});
				}
				if (response.data.data.contextSet) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
						data: response.data.data
					});
				}
			} else {
				if (response.data && response.data.error) {
					console.error('[RootscopeActions] failed to get foo, error:');
					console.log(response.data.error);
				} else {
					console.error('[RootscopeActions] failed to get foo, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[RootscopeActions] failed to get foo, call chain error probably check component tree');
			console.log(error);
		})
	},

	exampleAjaxPostAction( params ) {
		axios.post('/foo/bar/baz', 
			params // .post() expects and passes this as a json object
		)
		.then(response => {
			if (response.data && response.data.data) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
					data: response.data.data
				});
			} else {
				if (response.data && response.data.error) {
					console.error('[RootscopeActions] failed to post foo, error:');
					console.log(response.data.error);
				} else {
					console.error('[RootscopeActions] failed to post foo, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[RootscopeActions] failed to post foo, call chain error probably check component tree');
			console.log(error);
		})
	},

	exampleWebsocketAction(data) {
		SocketAPI.send('fooSocketAction', data, this.exampleWebsocketResponseHandler.bind(this));
	},

	exampleWebsocketResponseHandler(data) {
		if (data && data.status == 'ok') {
			AppDispatcher.handleServerAction({
				actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
				data: data
			});
		} else {
			alert('Sorry, failed to handle the fooSocketAction.');
			console.log('foo item fail:');
			console.log(data);
		}
	},
	
	// think: emptyCart()
	exampleBasicAction() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
			data: null
		});
	},

// helper functions, these may move!

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
		//TsvService.debug("gotoPayment() called");
		
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
		TSVService.debug("Updated credit to include discount "
			+ TSVService.session.discount + " + " + TSVService.session.creditBalance
			+ " = "
			+ $rootScope.credit);
		*/
	},

	coupon() {
		RootscopeStore.setConfig('keyboardView', "Enter_Coupon");
		browserHistory.push("/Keyboard");
	},

// setters for RootscopeStore:

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

};

module.exports = RootscopeActions;
