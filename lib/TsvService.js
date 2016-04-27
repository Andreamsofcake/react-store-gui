"use strict";
import axios from 'axios'
import { browserHistory } from 'react-router'
import { moneyformat } from '../app/utils'
import Promise from 'bluebird'
import * as Translate from './Translate'

import RootscopeActions from '../app/actions/RootscopeActions'
import RootscopeStore from '../app/stores/RootscopeStore'

import SocketAPI from '../app/utils/SocketAPI'

//console.log(' SocketAPI SocketAPI SocketAPI SocketAPI SocketAPI SocketAPI SocketAPI SocketAPI');
//console.log(SocketAPI);
/*
setTimeout(() => {
	console.log('RootscopeStore RootscopeStore RootscopeStore RootscopeStore RootscopeStore RootscopeStore RootscopeStore RootscopeStore');
	console.log(RootscopeStore);
	console.log( Object.keys(RootscopeStore) );
}, 2000);
*/

/**
* RPC interface to NetTSV
*/

//var avt = angular.module('avt', []);
//avt.factory('TsvService', ['$rootScope', '$timeout', 'translate', '$filter', function($rootScope, $timeout, translate, $filter) {

var tsvApi = [
	"activate",
	"addProductAndPriceByProductId",
	"addStock",
	"addToCartByCoil",
	"addToCartByProductID",
	"addToCartBySelection",
	"adminValidateProductByCoil",
	"authorizeCreditCard",
	"cashlessBeginSession",
	"cashlessEndSession",
	"changeShopperPassword",
	"checkActivation",
	"clearMachineFaults",
	"clockAdmin",
	"closeAdmin",
	"createShopper",
	"debug",
	"disableAgeVerification",
	"disableLoginDevices",
	"disablePaymentDevice",
	"emptyCart",
	"enableAgeVerification",
	"enableLoginDevices",
	"enablePaymentDevice",
	"endUserLogging",
	"enumerateComponents",
	"fetchAllCustomSettings",
	"fetchAllMachineSettings",
	"fetchCoilProductIDMap",
	"fetchConfig",
	"fetchCreditBalance",
	"fetchCustomMachineSetting",
	"fetchFlashConfig",
	"fetchMachineCoilProductIDMap",
	"fetchMachineIds",
	"fetchProduct",
	"fetchProductByCategory",
	"fetchProductCategories",
	"fetchProductCategoriesByParentCategoryID",
	"fetchProductQuick",
	"fetchShoppingCart2",
	"fetchValidCoils",
	"fetchValidTrays",
	"fillCoil",
	"fillMachine",
	"getFaultCodes",
	"getShopperInfo",
	"heartbeatNow",
	"kickLoginWatchdog",
	"lastHeartbeatTime",
	"loginShopper",
	"logoutShopper",
	"payout",
	"printReceipt",
	"refresh",
	"refundRequest",
	"registerComponent",
	"removeFromCartByCoilNo",
	"removeFromCartByProductID",
	"removeStock",
	"resetCoupon",
	"resetCreditBalance",
	"resetVendProperties",
	"restart",
	"runAutoMap",
	"saveFlashSettings",
	"searchProduct",
	"setCardSecurityBillingZip",
	"setCardSecurityCvv2",
	"setCardSecurityInfo",
	"setCustomMachineSetting",
	"setDropShipInfo",
	"setEmailReceiptInfo",
	"setLights",
	"setMachineSetting",
	"setPromoInfo",
	"setShippingAmount",
	"setVendProperty",
	"shutdown",
	"startUserLogging",
	"startVend",
	"triggerDataDownloader",
	"tsvVersionNumber",
	"updateItemPrice",
	"updateShopper",
	"validateAdminPassword",
	"validateAllCoils",
	"validateCoupon",
	"validateProductByCoil",
	"validateProductByProductId",
	"vendProduct",
	"vendSingleItem"
];

var TsvService = {
	failing: true,
	failCount: 0,
	serviceIsStarted: false,
	currencyType: 'currency'
};

function doRequest(args, callback, name) {

	var /*args = Array.prototype.slice.call(arguments)
		, callback = args.pop()
		, */requestJson = JSON.stringify(args) // Kent's thought, but not valid with NetTSV: args.length > 1 ? args : args[0]
		;
	
	console.warn('[doRequest] ' + name + ', args:');
	console.log(args);
//	console.log(requestJson);
//	console.log(typeof requestJson);

	/*
	// SKIPPING websocket for regular calls, due to getting wires crossed from single endpoint handling multiple calls
	// FIXME: is to change the server-side handling for these calls to have /more/unique/paths dynamically mapped to a Hapiio call
	if (SocketAPI) {
		SocketAPI.send('flash-api', { _ws_args: args }, name, (response) => {
			console.warn('SOCKET response for call: ' + name + ', args: ' + requestJson);
			console.log(response);
			if (response) {
				callback(null, response);
			} else {
				if (response && response.error) {
					console.error('[TsvService] failed to WEBSOCKET post to flashapi, error:');
					console.log(response.error);
					callback(response.error);
				} else {
					console.error('[TsvService] failed to WEBSOCKET post to flashapi, no data returned. full response:');
					console.log(response);
					callback('unknown error, check logs');
				}
			}
		});
	} else {
	*/

		var flash_api_url = 'http://localhost:8087/tsv-proxy/flashapi';
		if (typeof window !== 'undefined') {
			if (window.location.port !== 8087) {
				flash_api_url = location.protocol + '//' + location.host + '/tsv-proxy/flashapi';
			}
		}
		//axios.post('http://localhost:8087/tsv-proxy/flashapi', requestJson, {
		axios.post(flash_api_url, requestJson, {
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => {

			//console.warn("Flash call returned - response:");
			//console.log(response);
			//console.log(args);

			if (response.data || response.statusText === 'OK') {
				callback(null, response.data);
			} else {
				if (response.data && response.data.error) {
					console.error('[TsvService] failed to post to flashapi, error:');
					console.log(response.data.error);
					callback(response.data.error);
				} else {
					console.error('[TsvService] failed to post to flashapi, no data returned. full response:');
					console.log(response);
					callback('unknown error, check logs');
				}
			}
		})
		.catch(error => {
			//console.log("Flash call failed " + textStatus + " - " + errorThrown);
			console.warn("Flash call failed - error:");
			console.log(error);
			console.log(args);
			throw error;
			callback(error);
		})

	//}
}

// autogenerate handlers
for (var i = 0; i < tsvApi.length; i++) {
	TsvService[tsvApi[i]] = (function (name) {
		return function () {

			var args = Array.prototype.slice.call(arguments)
				, callback = args.pop()
				;
			args.unshift(name);

			if (!callback || typeof callback !== 'function') {
				throw new Error( 'tsv service [calling: '+name+'] requires last argument to be a callback, standard nodejs signature (err, data)' );
			}

			//console.warn('[doRequest WRAPPER] args:');
			//console.log(args);
			//console.log(arguments);

			//return doRequest.apply(null, args);
			return doRequest(args, callback, name);
		};
	})(tsvApi[i]);

// makes all methods promises!	
	TsvService[tsvApi[i] + 'Async'] = Promise.promisify(TsvService[tsvApi[i]], {context: TsvService});
/*
	var redisGet = Promise.promisify(redisClient.get, {context: redisClient});
	redisGet('foo').then(function() {
		//...
	});	
*/
}



/**** METHODS below here still need refactoring, Kent is working on it *****/

// override emptyCart so it clears any items from cached cart first
TsvService.emptyCart = function() {
	RootscopeActions.setCache('shoppingCart.detail', []);
	doRequest(['emptyCart'], () => {});
};

// FIXME: turn into RootscopeActions:
// and: it's only called in one place: Admin_Component_Control.js
TsvService.refreshIndexPage = function() {
	window.location.reload();
};

/*** EVENTS, SUBSCRIPTIONS ***/
// FIXME: change out eventSubscriptions here with utils/PubSub when ready
// (or, just use these since they work already with this app!)
TsvService.eventSubscriptions = {};

TsvService.isSubscribed = function(eventName, namespace) {
	var chain = TsvService.eventSubscriptions[eventName];
	if (chain === undefined) return false;
	var len = chain.length;
	for (var i = 0; i < len; i++) {
		if (chain[i][2] === namespace) {
			return true;
		}
	}
	return false;
};

// DEVNOTE: removing "self" here, that will be bound to the handler function.
//TsvService.subscribe = function(eventName, self, handler, namespace) {
TsvService.subscribe = function(eventName, handler, namespace) {
	
	if (TsvService.isSubscribed(eventName, namespace)) {
		console.log("Already subscribed " + eventName + ", " + namespace, " replacing...");
		TsvService.unsubscribe(eventName, namespace);
	}

	var chain = TsvService.eventSubscriptions[eventName] || [];

	// see above DEVNOTE
	//chain.push([self, handler, namespace]);
	chain.push([handler, namespace]);

	TsvService.eventSubscriptions[eventName] = chain;
};

TsvService.unsubscribe =  function(eventName, namespace) {
	var chain = TsvService.eventSubscriptions[eventName];
	if (chain === undefined || chain.length == 0) {
		return;
	}

	for (var i = 0; i < chain.length; i++) {
		if (chain[i][2] === namespace) {
			break;
		}
	}

	if (i < chain.length) {
		chain.splice(i, 1);
	}
};

/*** END EVENTS, SUBSCRIPTIONS ***/

TsvService.setVendingInProcessFlag = function (bool) {
	bool = typeof bool === 'undefined' ? true : bool;
	console.log("setVendingInProcessFlag()");
	//tsv.session.bVendingInProcess = true;
	RootscopeActions.setSession('bVendingInProcess', bool);
};

TsvService.clearVendingInProcessFlag = function () {
	return TsvService.setVendingInProcessFlag(false);
	console.log("clearVendingInProcessFlag()");
	//tsv.session.bVendingInProcess = false;
};

// moved into init function:
//TsvService.setVendingInProcessFlag(false);

TsvService.vendResponse = function(processStatus) { //, $location, $rootScope) {
	console.log("Hi Ping Debug vendResponse!!!!!!!!!!!!!");
	TsvService.resetSelectedItem();
	//TsvService.cache.shoppingCart = tsv.fetchShoppingCart2();
	TsvService.fetchShoppingCart2(null, (err, cart) => {
		RootscopeActions.setCache('shoppingCart', cart);

		switch(processStatus){
			case "VEND_SUCCESS":
				console.log("Got event vendResponse(): "+processStatus);
				//tsv.cache.productList = tsv.fetchProduct(); //Not In Use Right Now

				if (TsvService.isFullSuccessVendResult()){
					console.log("Full Vend Success!");
					browserHistory.push("/ThankYou_Msg");
				} else {
					console.log("Partial Vend Error");
					//pay out
					if (RootscopeStore.getCache('currentLocation') == "/Cash_Vending"){
						TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");
					}
					RootscopeActions.setSession('vendErrorMsg1', Translate.translate("Vending", "PartialVendFailure"));
					RootscopeActions.setSession('vendErrorMsg2',
						Translate.translate("Vending", "YouHaveBeenCharged") + TsvService.currencyFilter( RootscopeStore.getSession('vendSettleTotal') ) );

					browserHistory.push("/Vend_Error");
				}
				break;

			case "VEND_FAILURE":
				console.log("Got event vendResponse(): "+processStatus);
				RootscopeActions.setSession('vendErrorMsg1', Translate.translate("Vending", "TotalVendFailure"));
				RootscopeActions.setSession('vendErrorMsg2', Translate.translate("Vending", "YouWereNotCharged"));
				browserHistory.push("/Vend_Error");
				break;

			case "EXCEPTION":
				console.log("Got event vendResponse(): "+processStatus);
				RootscopeActions.setSession('vendErrorMsg1', Translate.translate("Vending", "TotalVendFailure"));
				RootscopeActions.setSession('vendErrorMsg2', Translate.translate("Vending", "YouWereNotCharged"));
				browserHistory.push("/Vend_Error");
				break;

			default:
				console.log("Got event vendResponse, no idea what to do with it: "+processStatus);
				break;
		}

		// not sure about this, is this "single product vending" mode here?
		TsvService.emptyCart();
	});
}

TsvService.isFullSuccessVendResult = function (){
	RootscopeActions.setSession('vendSettleTotal', RootscopeStore.getCache('shoppingCart.summary.netTotalPrice') );
	var itemsVendFail = RootscopeStore.getCache('shoppingCart.summary.vendFailCount');
	var itemsVendSuccess = RootscopeStore.getCache('shoppingCart.summary.vendItemCount-itemsVendFail');

	if (itemsVendFail > 0) {
		console.log("is it a fullVendSuccess?(false)!success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
		return false;
	}
	console.log("is it a fullVendSuccess?(true)success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
	return true;
};

TsvService.checkBalance = function (){
	console.log("checkBalance()!!!!!");
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, sc_detail = RootscopeStore.getCache('shoppingCart.detail') || []
		;

	if((creditBalance * 100) >= (total * 100) && sc_detail.length > 0){
		TsvService.disablePaymentDevice();
		var v_i_p = RootscopeStore.getSession('bVendingInProcess');
		if(!v_i_p){
			console.log("Inserted Enough Cash should vend...!!!!!");
			RootscopeActions.setSession('cashMsg', "Vending...");
			TsvService.setVendingInProcessFlag(true);
			//console.log("tsv.session.bVendingInProcess: " + v_i_p);
			TsvService.startVend(null, () => {});
		}
	}
};

TsvService.autoCheckout = function() {
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, cartItems = RootscopeStore.getCache('shoppingCart.detail') || []
		, itemsInCart = cartItems.length;

	console.log("autoCheckout() totalPrice = " + total + " credit = " + creditBalance + " items = " + itemsInCart);

	if (creditBalance >= total && itemsInCart > 0) {
		console.log("disabling payment device");
		TsvService.disablePaymentDevice();

		console.log("check vend in process?");
		if (!RootscopeStore.getSession('bVendingInProcess')) {
			console.log("Calling gotoPayment on rootScope");
			RootscopeActions.gotoPayment();
		}

	} else {
		console.log("Insufficient funds to autoCheckout");
	}
}

TsvService.cardTransaction = function(level) {
	var msg = '';
	switch(level){
		case "CARD_INSERTED":
			msg = Translate.translate("Card_Vending", "ProcessingMessage");
			break;
		case "CARD_PROCESSING":
			msg = Translate.translate("Card_Vending", "ProcessingMessage");
			break;
		case "CARD_APPROVED":
			TsvService.disablePaymentDevice();
			break;
		case "CARD_INVALID_READ":
			msg = Translate.translate("Card_Vending", "CardInvalidMessage");
			break;
		case "CARD_DECLINED":
			msg = Translate.translate("Card_Vending", "CardDeclinedMessage");
			break;
		case "CARD_CONNECTION_FAILURE":
			msg = Translate.translate("Card_Vending", "CardConnectionErrorMessage");
			break;
		case "CARD_UNKNOWN_ERROR":
			msg = Translate.translate("Card_Vending", "CardUnknownErrorMessage");
			break;
		default:
			msg = Translate.translate("Card_Vending", "CardUnknownErrorMessage");
			break;
	}
	RootscopeActions.setSession('cardMsg', msg);
};

TsvService.removeKeyboard = function() {
	console.warn("removeKeyboard() called! ... but nothing to do in new regime as we don't directly affect the DOM .... args:");
	console.log(arguments);
	/*
	angular.forEach(angular.element(document).find('input'), function(value) {
		var inputChild = angular.element(value);
		if(angular.equals('true', inputChild.attr('VKI_attached'))) {
			inputChild.triggerHandler('close');
		}
	});
	*/
};

TsvService.onGeneralTimeout = function () {
	console.log("onGeneralTimeout()");

	if (RootscopeStore.getConfig('bDualLanguage')) {
		var dfltLang = RootscopeStore.getCache('custommachinesettings.languageDefaulted', "En");

		console.warn('old code calling for DOM manipulation, no good.... who called this?');
		//$('.showflag').removeClass('showflag').addClass('hideflag');
		//document.getElementById(dfltLang).className = "showflag";

		RootscopeActions.setConfig('selectedLanguage', dfltLang);
		Translate.selectLanguage(dfltLang);
	}

	console.log("RootscopeStore.getCache('currentLocation'): "+RootscopeStore.getCache('currentLocation'));

	switch(RootscopeStore.getCache('currentLocation')){
		case "/View0":
			break;
		case "/View1":
			TsvService.emptyCart();
			TsvService.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Category_Search":
			TsvService.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Product_Search":
			TsvService.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Make_Donation":
			//tsv.emptyCart();
			break;
		case "/ThankYou_Msg":
			break;
		case "/Vend_Error":
			break;
		case "/Cash_Vending":
			console.log("On cash page idle timeout disabled...Running the paymentTimer...");
			TsvService.emptyCart();
			break;
		case "/Card_Vending":
			console.log("On card page idle timeout disabled...Running the paymentTimer...");
			TsvService.emptyCart();
			break;
		case "/Admin_Check_Faults":
			if(!RootscopeStore.getSession('bRunningClearFaults')){
				TsvService.gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from Admin_Check_Faults not running ClearFaults");
				return;
			}
			break;
		case "/Admin_Auto_Map":
			if(!RootscopeStore.getSession('bRunningAutoMap')){
				TsvService.gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from Admin_Auto_Map not running AutoMap");
				return;
			}
			break;
		case "/Page_Idle":
			return;

		default:
			console.log("Idle Timeout from "+RootscopeStore.getCache('currentLocation'));
			TsvService.emptyCart();
			TsvService.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
	}

	TsvService.startGeneralIdleTimer(); //$location, $rootScope);//Ping added on 1016/2015
};

TsvService.startGeneralIdleTimer = function() {
	TsvService.killGeneralIdleTimer();
	
	var timer = setTimeout(function(){
		//console.log("Hi Ping generalIdleTimer timeout...");
		console.log("onGeneralIdleTimeout() @" + RootscopeStore.getCache('custommachinesettings.generalPageTimeout', "default"));
		TsvService.onGeneralTimeout();
	}, RootscopeStore.getCache('custommachinesettings.generalPageTimeout', '120000') );
	
	RootscopeActions.setSession('generalIdleTimer', timer);
};

// deprecate this:
TsvService.customSetting = function (name, dflt) {
	console.warn('[TsvService.customSetting] HAY I should be deprecated, use direct RootscopeStore.getCache(\'custommachinesettings\') ')
	return RootscopeStore.getCache('custommachinesettings.'+name, dflt);
};

var stringToBoolean = function (string){
	switch(string.toLowerCase().trim()){
		case "true": case "yes": case "1": return true;
		case "false": case "no": case "0": case null: return false;
		default: return Boolean(string);
	}
}

TsvService.bCustomSetting = function(name, dflt) {
	return stringToBoolean(RootscopeStore.getCache('custommachinesettings.'+name, dflt));
};

TsvService.machineSetting = function (name, dflt) {
	console.warn('[TsvService.machineSetting] HAY I should be deprecated, use direct RootscopeStore.getCache(\'machineSettings\') ')
	return RootscopeStore.getCache('machineSettings.'+name, dflt);
};

TsvService.bMachineSetting = function (name, dflt) {
	return stringToBoolean(RootscopeStore.getCache('machineSettings.'+name, dflt));
};

TsvService.resetGeneralIdleTimer = TsvService.startGeneralIdleTimer;

TsvService.isCartEmpty = function (cb) {
	var cart = RootscopeStore.getCache('shoppingCart');
	if (!cart) {

		console.warn('this may be out of sync, as we have to check with the TsvService.fetchShoppingCart2 thing for data');
		TsvService.fetchShoppingCart2(null, function(err, data) {
			if (err) {
				console.warn('error trying to fetchShoppingCart2!');
				console.warn(err);
				/*return*/cb( false );
			}
			RootscopeActions.setCache('shoppingCart', data);
			/*return*/cb( !(data.detail && data.detail.length) );
		})

	} else if (!cart.detail) {
		/*return*/cb( true );
	} else {
		/*return*/cb(  cart.detail.length == 0  );
	}
};

TsvService.killGeneralIdleTimer = function() {
	var timer = RootscopeStore.getSession('generalIdleTimer');
	if (timer === null || timer === undefined) return;
	RootscopeActions.setSession('generalIdleTimer', null);
	clearTimeout(timer);
};

TsvService.gotoDefaultIdlePage = function () { //$location, $rootScope){

	// can't go to idle page until we get settings!
	if (RootscopeStore.getCache('custommachinesettings', undefined) === undefined) {
		TsvService.reloadPage();
		return;
	}
	
	TsvService.checkActivation( function(err, result) {
		
		console.warn('[checkActivation]');
		console.log(result);
		
		if (!result || result.resultCode !== "SUCCESS") {
			//throw new Error('WHY U NO ACTIVATE');
			return browserHistory.push("/Activate");
		}

		TsvService.resetSelectedItem();
		/*
		// old way, I think $rootscope.gotoDefaultIdlePage version (see below) is better for this part:
		TsvService.checkActivation(null, function(err, resultCode) {
			if (resultCode !== "SUCCESS") {
				browserHistory.push("/Activate");
				return;
			}

			// appears that both conditions below do the same thing?
			if (RootscopeStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle") {
				browserHistory.push("/Page_Idle");
				return;
			} else {
				TsvService.idleClicked($location, $rootScope);
			}
		});
		*/

		if (RootscopeStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle"){
			browserHistory.push("/Page_Idle");
			return;

		} else {
			// no donation loop in this app please!:
			/*
			if (TsvService.customSetting('singleProductDonation')) {
				//console.log("Hi Ping notifyTSVReady from View0 to Make_Donation");
				$location.path("/Make_Donation");
				return;
			} else {
			*/

				if (RootscopeStore.getCache('custommachinesettings.txtSearchScene', 'coil_keypad').toLowerCase() === "coil_keypad") {
					return browserHistory.push("/View1");

				} else if (RootscopeStore.getCache('custommachinesettings.'+txtSearchScene, 'coil_keypad').toLowerCase() === "storefront") {
					
					return browserHistory.push("/Storefront");

				} else if (RootscopeStore.getCache('custommachinesettings.'+txtSearchScene, 'coil_keypad').toLowerCase() === "category_search") {
					
					return browserHistory.push("/Storefront");

					if (RootscopeStore.getCache('custommachinesettings.bCategoryView', false)) {
						return browserHistory.push("/Category_Search");

					} else {
						return browserHistory.push("/Product_Search");
					}
				}

			//}

		}

	});

};

TsvService.idleClicked = function() { //$location, $rootScope){
	return browserHistory.push("/Storefront");
	switch(RootscopeStore.getCache('custommachinesettings.txtSearchScene', '').toLowerCase()){

		case "make_donation":
			browserHistory.push("/Make_Donation");
			break;

		case "coil_keypad":
			browserHistory.push("/View1");
			break;

		case "category_search":
			TsvService.configCategories(); //$rootScope);
			browserHistory.push("/Category_Search");
			break;

		case "product_search":
			browserHistory.push("/Product_Search");
			break;

		default:
			browserHistory.push("/View1");
			break;
	}
};

TsvService.resetSelectedItem = function (){
	//console.log("resetSelectedItem");
	console.log("resetSelectedItem()!");
	RootscopeActions.setSession({
		bRunningClearFaults: false,
		bRunningAutoMap: false,
		cashMsg: Translate.translate("Cash_Vending", "HintMessageInsertCash"),
		vendErrorMsg1: '',
		vendErrorMsg2: '',
		vendSettleTotal: 0,
		bVendedOldCredit: false
	});
	/*
	RootscopeActions.setSession('bRunningClearFaults', false);
	RootscopeActions.setSession('bRunningAutoMap', false);

	//var msg = Translate.translate("Card_Vending", "InstructionMessage");

	RootscopeActions.setSession('cashMsg', Translate.translate("Cash_Vending", "HintMessageInsertCash"));
	RootscopeActions.setSession('vendErrorMsg1', "");
	RootscopeActions.setSession('vendErrorMsg2', "");
	RootscopeActions.setSession('vendSettleTotal', 0);
	RootscopeActions.setSession('bVendedOldCredit', false);

	if (RootscopeStore.getSession('currentView') == "Admin_Settings") {
		TsvService.removeKeyboard();
	}
	*/
};

/****

	methods below here,
	Kent imported from OLD app.js,
	and they used to be all
	$rootscope.methods()

	also, "payment timer" functions that were duped in 4+ places,
	are set into here now as well.

	*/

TsvService.registerKF = function(RS) {
	//console.log('TsvService.registerKF');
	//console.log( Object.keys(RS) );
	//console.log( RS.getShowCredit() );
	if (!RootscopeStore.getAppConfig) {
		console.log('no getAppConfig, TIMEOUT LOOP');
		setTimeout( ()=>{ TsvService.registerKF(RS) }, 500 );
	} else {
		var app_config = RootscopeStore.getAppConfig();
		//TsvService.registerComponent("KioskFramework", "1.0.0.3", "2015-12-10");
		TsvService.registerComponent(app_config.name, app_config.version, app_config.releaseDate, () => {});
	}
}

TsvService.reloadPage = function(){ window.location.reload(); }

TsvService.setCurrencyFilterType = function(type) {
	TsvService.currencyType = type;
}

TsvService.currencyFilter = function(amt, type) {
	if (!amt || isNaN(amt)) {
		return 'error';
	}
	type = type || TsvService.currencyType; //'currency';
	
	switch (type) {
		case 'currency':
			
			// hard-coded to two decimal places:
			return moneyformat(amt, 2);
			
			break;

		case 'points':	
			
			// from OldCode/app.js app.filter('points', function() { .... })

			// Ensure that the passed in data is a number
			if (isNaN(amt) || amt < 0) {

				// If the data is not a amt or is less than one (thus not having a cardinal value) return it unmodified.
				return amt;

			} else {

				// If the data we are applying the filter to is a amt, perform the actions to check it's ordinal suffix and apply it.
				amt = amt * 100;
				var lastDigit = amt % 10;

				if (lastDigit === 1) {
					return amt + ' point'
				} else {
					return amt + ' points'
				}
			}

			break;
	}
}


/** payment "timers" management **/

TsvService.stopPaymentTimer = function(){
	//console.log("Hi Ping Debug stop the paymentTimer");
	//$timeout.cancel(TsvService.session.paymentTimer);
	TsvService.killTimers( 'paymentTimer' );
	/*
	var paymentTimer = RootscopeStore.getSession('paymentTimer');
	if (paymentTimer) {
		clearTimeout(paymentTimer);
		RootscopeActions.setSession('paymentTimer', null);
	}
	*/
}

TsvService.resetPaymentTimer = function(){
	//console.log("Hi Ping Debug reset the paymentTimer");
	TsvService.stopPaymentTimer();
	TsvService.startPaymentTimer();
}

TsvService.killTimers = function(timerList){

	if (timerList && typeof timerList === 'string') { timerList = [timerList]; }

	if (timerList && timerList.length) {
		timerList.forEach( TIMER => {
			var ref = RootscopeStore.getSession(TIMER);
			if (ref) {
				clearTimeout(ref);
				RootscopeActions.setSession(TIMER, null);
			}
		});
	}

}

TsvService.startPaymentTimer = function( idlePage ){
	var timeoutLength = RootscopeStore.getCache('custommachinesettings.paymentPageTimeout');

	// allow override to /View1
	idlePage = idlePage || 'idle';
	
	// for now though, force all to go to Idle page,
	// because /View1 is the keypad input interface for single product choose + purchase (no shopping cart)
	idlePage = 'idle';

	if (!timeoutLength) {
		console.log( RootscopeStore.getCache('custommachinesettings') );
		throw new Error('[TsvService.startPaymentTimer] I need a timeoutLength to start a timeout! none found.');
	}
	var timeout = setTimeout( () => {
		TsvService.emptyCart();
		TsvService.stopPaymentTimer();

		switch (idlePage) {
			// "View1" is the keypad input interface for single product choose + purchase (no cart)
			case 'View1':
				browserHistory.push('/View1');
				break;
			default:
				TsvService.gotoDefaultIdlePage();
				break;
		}

	}, timeoutLength );
	RootscopeActions.setSession('paymentTimer', timeout);
}
















/***

finish Tsv setup below here:

*/


var dispatch = function (e) {

	//curious what the structure of "e" is....
	console.log('[dispatch] check inbound "e"');
	console.log(e);

	var eventName = e.shift();
	//console.log("[dispatch] EventName: " + eventName);
	var chain = TsvService.eventSubscriptions[eventName];
	
	var ds = [];

	// invoke all event subscribers
	if (!(chain === undefined)) {
		for (var i = 0; i < chain.length; i++) {
			var pair = chain[i];

			try {
				//pair[1].apply(pair[0], e);
				pair[0].apply(null, e, () => {});
				// don't push unless it fails to run, otherwise it's not dirty! :-)
				//ds.push(pair[0]);

			} catch (err) {
				console.log("Failed invoking " + eventName + " handler: " + err);
				ds.push(pair[0]);
			}
		}
	}

	return ds;
};

var dispatchAll = function(eventList) {
	if (undefined != eventList) {

		if (eventList[0] == 'noEvent') {
			if (TsvService.failing) {
				eventList = [['noEvent']];
				TsvService.failing = false;
			} else {
				eventList = [];
			}
		}

		// dispatch all events received
		for (var ijk = 0; ijk < eventList.length; ijk++) {
			//console.log("Debug eventList ijk0: "+ijk);
			try{
				var tsvEvent = eventList[ijk];

				//console.log("TsvEvent: [" + tsvEvent.join(",") + "]");
				//console.log("TsvEvent: [" + tsvEvent.join(",") + "]");

				var dirtyScopes = dispatch(tsvEvent);
				if (dirtyScopes.length != 0) {
					//refreshNgViews(dirtyScopes);
					console.warn('dirtyScopes');
					console.log(dirtyScopes);
				}
			}
			catch (err) {
				console.log("Failed " + err.message);
			}
		}

	}
};

TsvService.init = function() {

	if (!TsvService.serviceIsStarted) {

		console.warn(' --------- ...............       TsvService.init       ..................... --------------- ');

		TsvService.setVendingInProcessFlag(false);
		
		var myTimer;
		
		// FIXME: make this a websocket and have the node server do the polling.
		
		if (SocketAPI) {
			if (myTimer) { clearTimeout(myTimer); myTimer = null; }
			
			// essentially, registers a handler for this event by sending to it once:
			SocketAPI.send('flash-api-multi-event', { _ws_args: { subscribe_to_externals: true } }, (response) => {
				console.warn('SOCKET multi-event response');
				console.log(response);
				if (response) {
					dispatchAll(response);
					TsvService.failCount = 0;
				} else {
					console.error('[flash-api-multi-event] pinged, but nothing there?');
					console.log(response);
				}
			});

		} else {
			console.warn('skipping the multievent polling from server side...');
			/*
			var flash_api_url = 'http://localhost:8087/tsv-proxy/flashapi/multievent';
			if (typeof window !== 'undefined') {
				if (window.location.port !== 8087) {
					flash_api_url = location.protocol + '//' + location.host + '/tsv-proxy/flashapi/multievent';
				}
			}
		
			// set up event poller every 300 msec
			myTimer = setInterval(function () {

				//axios.post('http://localhost:8087/tsv-proxy/flashapi/multievent', {}, {
				axios.post(flash_api_url, {}, {
					headers: {
						'Content-Type': 'application/json'
					}, 
					responseType: 'json'
				})
				.then(response => {
					dispatchAll(response.data);
					TsvService.failCount = 0;
				})
				.catch(error => {
					TsvService.failing = true;
					if (TsvService.failCount > 3) {
						dispatchAll([['linkDown']]);
					} else {
						TsvService.failCount += 1;
					}
				});

			}, 1000000); //150);
			*/
		}
	
		TsvService.serviceIsStarted = true;
	} else {
		console.error(' --------- ...............       TsvService.init ALREADY DONE, BUT CALLED       ..................... --------------- ');
	}

	console.log("Completed initialization of TsvService.")
}

export default TsvService;