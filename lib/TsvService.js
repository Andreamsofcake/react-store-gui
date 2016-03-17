"use strict";
import axios from 'axios'
import { browserHistory } from 'react-router'
import { moneyformat } from '../app/utils'
import Promise from 'bluebird'

import RootscopeActions from '../app/actions/RootscopeActions'
import RootscopeStore from '../app/stores/RootscopeStore'

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

var Tsv = {
	failing: true,
	failCount: 0,
	serviceIsStarted: false,
	currencyType: 'currency'
};

function doRequest(args) {

	var callback = args.pop()
		, requestJson = JSON.stringify(args) // Kent's thought, but not valid with NetTSV: args.length > 1 ? args : args[0]
		;

	if (!callback || typeof callback !== 'function') {
		throw new Error( 'tsv service requires last argument to be a callback, standard nodejs signature (err, data)' );
	}

	axios.post('/tsv-proxy/flashapi', requestJson)
	.then(response => {
		if (response.data && response.data.data) {
			callback(null, response.data.data);
		} else {
			if (response.data && response.data.error) {
				console.error('[TsvService] failed to post foo, error:');
				console.log(response.data.error);
				callback(response.data.error);
			} else {
				console.error('[TsvService] failed to post foo, no data returned. full response:');
				console.log(response);
				callback('unknown error, check logs');
			}
		}
	})
	.catch(error => {
		//console.log("Flash call failed " + textStatus + " - " + errorThrown);
		console.log("Flash call failed - " + error);
		cb(error);
	})

}

// autogenerate handlers
for (var i = 0; i < tsvApi.length; i++) {
	Tsv[tsvApi[i]] = (function (name) {
		return function () {

			var args = Array.prototype.slice.call(arguments);
			args.unshift(name);

			return doRequest(args);
		};
	})(tsvApi[i]);

// makes all methods promises!	
	Tsv[tsvApi[i] + 'Async'] = Promise.promisify(Tsv[tsvApi[i]], {context: Tsv});
/*
	var redisGet = Promise.promisify(redisClient.get, {context: redisClient});
	redisGet('foo').then(function() {
		//...
	});	
*/
}



/**** METHODS below here still need refactoring, Kent is working on it *****/

// override emptyCart so it clears any items from cached cart first
Tsv.emptyCart = function() {
	RootscopeActions.setCache('shoppingCart.detail', []);
	doRequest(['emptyCart']);
};

// FIXME: turn into RootscopeActions:
// and: it's only called in one place: Admin_Component_Control.js
Tsv.refreshIndexPage = function() {
	window.location.reload();
};

/*** EVENTS, SUBSCRIPTIONS ***/
// FIXME: change out eventSubscriptions here with utils/PubSub when ready
// (or, just use these since they work already with this app!)
Tsv.eventSubscriptions = {};

Tsv.isSubscribed = function(eventName, namespace) {
	var chain = Tsv.eventSubscriptions[eventName];
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
//Tsv.subscribe = function(eventName, self, handler, namespace) {
Tsv.subscribe = function(eventName, handler, namespace) {
	
	if (Tsv.isSubscribed(eventName, namespace)) {
		console.log("Already subscribed " + eventName + ", " + namespace, " replacing...");
		Tsv.unsubscribe(eventName, namespace);
	}

	var chain = Tsv.eventSubscriptions[eventName] || [];

	// see above DEVNOTE
	//chain.push([self, handler, namespace]);
	chain.push([handler, namespace]);

	Tsv.eventSubscriptions[eventName] = chain;
};

Tsv.unsubscribe =  function(eventName, namespace) {
	var chain = Tsv.eventSubscriptions[eventName];
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

Tsv.setVendingInProcessFlag = function (bool) {
	bool = typeof bool === 'undefined' ? true : bool;
	console.log("setVendingInProcessFlag()");
	//tsv.session.bVendingInProcess = true;
	RootscopeActions.setSession('bVendingInProcess', bool);
};

Tsv.clearVendingInProcessFlag = function () {
	return Tsv.setVendingInProcessFlag(false);
	console.log("clearVendingInProcessFlag()");
	//tsv.session.bVendingInProcess = false;
};

Tsv.setVendingInProcessFlag(false);

Tsv.vendResponse = function(processStatus) { //, $location, $rootScope) {
	console.log("Hi Ping Debug vendResponse!!!!!!!!!!!!!");
	Tsv.resetSelectedItem();
	//Tsv.cache.shoppingCart = tsv.fetchShoppingCart2();
	RootscopeActions.setCache('shoppingCart', Tsv.fetchShoppingCart2());

	switch(processStatus){
		case "VEND_SUCCESS":
			console.log("Got event vendResponse(): "+processStatus);
			//tsv.cache.productList = tsv.fetchProduct(); //Not In Use Right Now

			if (Tsv.isFullSuccessVendResult()){
				console.log("Full Vend Success!");
				browserHistory.push("/THANKYOU_MSG");
			} else {
				console.log("Partial Vend Error");
				//pay out
				if (RootscopeStore.getCache('currentLocation') == "/Cash_Vending"){
					Tsv.enablePaymentDevice("PAYMENT_TYPE_CASH");
				}
				RootscopeActions.setSession('vendErrorMsg1', Translate.translate("Vending", "PartialVendFailure"));
				RootscopeActions.setSession('vendErrorMsg2',
					Translate.translate("Vending", "YouHaveBeenCharged") + Tsv.currencyFilter( RootscopeStore.getSession('vendSettleTotal') ) );

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
	Tsv.emptyCart();
};

Tsv.isFullSuccessVendResult = function (){
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

Tsv.checkBalance = function (){
	console.log("checkBalance()!!!!!");
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, sc_detail = RootscopeStore.getCache('shoppingCart.detail') || []
		;

	if((creditBalance * 100) >= (total * 100) && sc_detail.length > 0){
		Tsv.disablePaymentDevice();
		var v_i_p = RootscopeStore.getSession('bVendingInProcess');
		if(!v_i_p){
			console.log("Inserted Enough Cash should vend...!!!!!");
			RootscopeActions.setSession('cashMsg', "Vending...");
			Tsv.setVendingInProcessFlag(true);
			//console.log("tsv.session.bVendingInProcess: " + v_i_p);
			Tsv.startVend();
		}
	}
};

Tsv.autoCheckout = function() {
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, cartItems = RootscopeStore.getCache('shoppingCart.detail') || []
		, itemsInCart = cartItems.length;

	console.log("autoCheckout() totalPrice = " + total + " credit = " + creditBalance + " items = " + itemsInCart);

	if (creditBalance >= total && itemsInCart > 0) {
		console.log("disabling payment device");
		Tsv.disablePaymentDevice();

		console.log("check vend in process?");
		if (!RootscopeStore.getSession('bVendingInProcess')) {
			console.log("Calling gotoPayment on rootScope");
			RootscopeActions.gotoPayment();
		}

	} else {
		console.log("Insufficient funds to autoCheckout");
	}
}

Tsv.cardTransaction = function(level) {
	var msg = '';
	switch(level){
		case "CARD_INSERTED":
			msg = Translate.translate("Card_Vending", "ProcessingMessage");
			break;
		case "CARD_PROCESSING":
			msg = Translate.translate("Card_Vending", "ProcessingMessage");
			break;
		case "CARD_APPROVED":
			Tsv.disablePaymentDevice();
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

Tsv.removeKeyboard = function() {
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

Tsv.loadingSpinner = function (){
	console.log("loadingSpinner()");
	throw new Error('I need to be a React component!');

	var spinnerColor = RootscopeStore.getCache('custommachinesettings.spinnerColor', '255,255,255');

	var canvas = document.getElementById('spinner');
	var context = canvas.getContext('2d');
	canvas.width = 200;
	canvas.height = 200;
	canvas.style.width  = '200px';
	canvas.style.height = '200px';

	var start = new Date();
	var lines = 16,
		cW = canvas.width,
		cH = canvas.height;

	var draw = function() {
		var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
		context.save();
		context.clearRect(0, 0, cW, cH);
		context.translate(cW / 2, cH / 2);
		context.rotate(Math.PI * 2 * rotation);

		for (var i = 0; i < lines; i++) {
			context.beginPath();
			context.rotate(Math.PI * 2 / lines);
			context.moveTo(cW/10, 0);
			context.lineTo(cW/4, 0);
			context.lineWidth = cW/30;
			context.strokeStyle = "rgba(" + spinnerColor + "," + i/lines + ")";
			context.stroke();
		}
		context.restore();
	};
	window.setInterval(draw, 1000 / 30);
};

Tsv.configCategories = function(){
	console.log("Hi Ping configCategories!");
	Tsv.fetchProductCategoriesByParentCategoryID(0, function(err, data) {
		if (err) {
			return err;
		}
		RootscopeActions.setCategories(data);
	});
};

Tsv.onGeneralTimeout = function () {
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
		case "/view0":
			break;
		case "/view1":
			Tsv.emptyCart();
			Tsv.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Category_Search":
			Tsv.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Product_Search":
			Tsv.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Make_Donation":
			//tsv.emptyCart();
			break;
		case "/THANKYOU_MSG":
			break;
		case "/Vend_Error":
			break;
		case "/Cash_Vending":
			console.log("On cash page idle timeout disabled...Running the paymentTimer...");
			Tsv.emptyCart();
			break;
		case "/Card_Vending":
			console.log("On card page idle timeout disabled...Running the paymentTimer...");
			Tsv.emptyCart();
			break;
		case "/Admin_Check_Faults":
			if(!RootscopeStore.getSession('bRunningClearFaults')){
				Tsv.gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from Admin_Check_Faults not running ClearFaults");
				return;
			}
			break;
		case "/Admin_Auto_Map":
			if(!RootscopeStore.getSession('bRunningAutoMap')){
				Tsv.gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from Admin_Auto_Map not running AutoMap");
				return;
			}
			break;
		case "/Page_Idle":
			return;
		default:
			console.log("Idle Timeout from "+RootscopeStore.getCache('currentLocation'));
			Tsv.emptyCart();
			Tsv.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
	}

	Tsv.startGeneralIdleTimer(); //$location, $rootScope);//Ping added on 1016/2015
};

Tsv.startGeneralIdleTimer = function($location, $rootScope) {
	Tsv.killGeneralIdleTimer();
	
	var timer = setTimeout(function(){
		//console.log("Hi Ping generalIdleTimer timeout...");
		console.log("onGeneralIdleTimeout() @" + RootscopeStore.getCache('custommachinesettings.generalPageTimeout', "default"));
		Tsv.onGeneralTimeout($location, $rootScope);
	}, RootscopeStore.getCache('custommachinesettings.generalPageTimeout', '120000') );
	
	RootscopeActions.setSession('generalIdleTimer', timer);
};

// deprecate this:
Tsv.customSetting = function (name, dflt) {
	console.warn('[Tsv.customSetting] HAY I should be deprecated, use direct RootscopeStore.getCache(\'custommachinesettings\') ')
	return RootscopeStore.getCache('custommachinesettings.'+name, dflt);
};

var stringToBoolean = function (string){
	switch(string.toLowerCase().trim()){
		case "true": case "yes": case "1": return true;
		case "false": case "no": case "0": case null: return false;
		default: return Boolean(string);
	}
}

Tsv.bCustomSetting = function(name, dflt) {
	return stringToBoolean(RootscopeStore.getCache('custommachinesettings.'+name, dflt));
};

Tsv.machineSetting = function (name, dflt) {
	console.warn('[Tsv.machineSetting] HAY I should be deprecated, use direct RootscopeStore.getCache(\'machineSettings\') ')
	return RootscopeStore.getCache('machineSettings.'+name, dflt);
};

Tsv.bMachineSetting = function (name, dflt) {
	return stringToBoolean(RootscopeStore.getCache('machineSettings.'+name, dflt));
};

Tsv.resetGeneralIdleTimer = Tsv.startGeneralIdleTimer;

Tsv.isCartEmpty = function () {
	var cart = RootscopeStore.getCache('shoppingCart');
	if (!cart) {

		console.warn('this may be out of sync, as we have to check with the Tsv.fetchShoppingCart2 thing for data');
		Tsv.fetchShoppingCart2(null, function(err, data) {
			if (err) {
				console.warn('error trying to fetchShoppingCart2!');
				console.warn(err);
				return false;
			}
			RootscopeActions.setCache('shoppingCart', data);
		})
		return true;

	} else if (!cart.detail) {
		return true;
	}
	return cart.detail.length == 0;
};

Tsv.killGeneralIdleTimer = function() {
	var timer = RootscopeStore.getSession('generalIdleTimer');
	if (timer === null || timer === undefined) return;
	RootscopeActions.setSession('generalIdleTimer', null);
	clearTimeout(timer);
};

Tsv.gotoDefaultIdlePage = function () { //$location, $rootScope){

	// can't go to idle page until we get settings!
	if (RootscopeStore.getCache('custommachinesettings', undefined) === undefined) {
		Tsv.reloadPage();
		return;
	}

	if (Tsv.checkActivation().resultCode !== "SUCCESS") {
		browserHistory.push("/Activate");
		return;
	}

	Tsv.resetSelectedItem();
	/*
	if (typeof $.fancybox !== "undefined"){
		$.fancybox.close();
	}
	*/
	
	/*
	// old way, I think $rootscope.gotoDefaultIdlePage version (see below) is better for this part:
	Tsv.checkActivation(null, function(err, resultCode) {
		if (resultCode !== "SUCCESS") {
			browserHistory.push("/Activate");
			return;
		}

		// appears that both conditions below do the same thing?
		if (RootscopeStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle") {
			browserHistory.push("/Page_Idle");
			return;
		} else {
			Tsv.idleClicked($location, $rootScope);
		}
	});
	*/

	if (RootscopeStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle"){
		browserHistory.push("/Page_Idle");
		return;

	} else {
		// no donation loop in this app please!:
		/*
		if (Tsv.customSetting('singleProductDonation')) {
			//console.log("Hi Ping notifyTSVReady from view0 to Make_Donation");
			$location.path("/Make_Donation");
			return;
		} else {
		*/

			if (RootscopeStore.getCache('custommachinesettings.txtSearchScene', 'coil_keypad').toLowerCase() === "coil_keypad") {
				browserHistory.push("/view1");
				return;

			} else if (Tsv.customSetting('txtSearchScene', 'coil_keypad').toLowerCase() === "category_search") {

				if (RootscopeStore.getCache('custommachinesettings.bCategoryView', false)) {
					browserHistory.push("/Category_Search");
					return;

				} else {
					browserHistory.push("/Product_Search");
					return;
				}
			}

		//}

	}

};

/*
different version of gotoDefaultIdlePage(), merging into Tsv.gotoDefaultIdlePage()
$rootScope.gotoDefaultIdlePage = function() {
	// can't go to idle page until we get settings!
	if (Tsv.cache.custommachinesettings === undefined) {
		$rootScope.reloadPage();
		return;
	}

	if (Tsv.checkActivation().resultCode !== "SUCCESS") {
		$location.path("/Activate");
		return;
	}

	if(Tsv.customSetting('txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle"){
		$location.path("/Page_Idle");
		return;
	}else{
		if (Tsv.customSetting('singleProductDonation')) {
			//console.log("Hi Ping notifyTSVReady from view0 to Make_Donation");
			$location.path("/Make_Donation");
			return;
		}else{
			if(Tsv.customSetting('txtSearchScene', 'coil_keypad').toLowerCase() === "coil_keypad"){
				$location.path("/view1");
				return;
			} else if (Tsv.customSetting('txtSearchScene', 'coil_keypad').toLowerCase() === "category_search") {
				if (Tsv.bCustomSetting('bCategoryView', 'false')){
					$location.path("/Category_Search");
					return;
				}else{
					$location.path("/Product_Search");
					return;
				}
			}
		}
	}
}

*/

Tsv.idleClicked = function() { //$location, $rootScope){
	switch(RootscopeStore.getCache('custommachinesettings.txtSearchScene', '').toLowerCase()){

		case "make_donation":
			browserHistory.push("/Make_Donation");
			break;

		case "coil_keypad":
			browserHistory.push("/view1");
			break;

		case "category_search":
			Tsv.configCategories(); //$rootScope);
			browserHistory.push("/Category_Search");
			break;

		case "product_search":
			browserHistory.push("/Product_Search");
			break;

		default:
			browserHistory.push("/view1");
			break;
	}
};

Tsv.resetSelectedItem = function (){
	//console.log("resetSelectedItem");
	console.log("resetSelectedItem()!");
	RootscopeActions.setSession('bRunningClearFaults', false);
	RootscopeActions.setSession('bRunningAutoMap', false);

	//var msg = Translate.translate("Card_Vending", "InstructionMessage");

	RootscopeActions.setSession('cashMsg', Translate.translate("Cash_Vending", "HintMessageInsertCash"));
	RootscopeActions.setSession('vendErrorMsg1', "");
	RootscopeActions.setSession('vendErrorMsg2', "");
	RootscopeActions.setSession('vendSettleTotal', 0);
	RootscopeActions.setSession('bVendedOldCredit', false);

	if (RootscopeStore.getSession('currentView') == "Admin_Settings") {
		Tsv.removeKeyboard();
	}
};

/****

	methods below here,
	Kent imported from OLD app.js,
	and they used to be all
	$rootscope.methods()

	also, "payment timer" functions that were duped in 4+ places,
	are set into here now as well.

	*/

TsvService.registerKF = function() {
	TsvService.registerComponent("KioskFramework", "1.0.0.3", "2015-12-10");
}

Tsv.reloadPage = function(){ window.location.reload(); }

Tsv.setCurrencyFilterType = function(type) {
	Tsv.currencyType = type;
}

Tsv.currencyFilter = function(amt, type) {
	type = type || Tsv.currencyType; //'currency';
	
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

Tsv.stopPaymentTimer = function(){
	//console.log("Hi Ping Debug stop the paymentTimer");
	//$timeout.cancel(TsvService.session.paymentTimer);
	Tsv.killTimers( 'paymentTimer' );
	/*
	var paymentTimer = RootscopeStore.getSession('paymentTimer');
	if (paymentTimer) {
		clearTimeout(paymentTimer);
		RootscopeActions.setSession('paymentTimer', null);
	}
	*/
}

Tsv.resetPaymentTimer = function(){
	//console.log("Hi Ping Debug reset the paymentTimer");
	Tsv.stopPaymentTimer();
	Tsv.startPaymentTimer();
}

Tsv.killTimers = function(timerList){

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

Tsv.startPaymentTimer = function( idlePage ){
	var timeoutLength = RootscopeStore.getCache('custommachinesettings.paymentPageTimeout');

	// allow override to /view1
	idlePage = idlePage || 'idle';
	
	// for now though, force all to go to Idle page,
	// because /view1 is the keypad input interface for single product choose + purchase (no shopping cart)
	idlePage = 'idle';

	if (!timeoutLength) {
		throw new Error('[Tsv.startPaymentTimer] I need a timeoutLength to start a timeout! none found.');
	}
	var timeout = setTimeout( () => {
		TsvService.emptyCart();
		TsvService.stopPaymentTimer();

		switch (idlePage) {
			// "view1" is the keypad input interface for single product choose + purchase (no cart)
			case 'view1':
				browserHistory.push('/view1');
				break;
			default:
				TsvService.gotoDefaultIdlePage();
				break;
		}

	}, timeoutLength );
	RootscopeActions.setSession('paymentTimer', timeout);
}

/*
// differing startPaymentTimer() functions....
// normalize?
// only real diff is where to go on idle,
// some is "view1" which is just the keypad interface for single product choose + purchase,
// and the other is the true idle page.

// Cash_Vending.js:
function startPaymentTimer(){
	TsvService.session.paymentTimer = $timeout(function(){
		TsvService.emptyCart();
		TsvService.gotoDefaultIdlePage($location, $rootScope);
		stopPaymentTimer();
	}, TsvService.cache.custommachinesettings.paymentPageTimeout)
}

// CC_Vending.js:
function startPaymentTimer(){
	TsvService.session.paymentTimer = $timeout(function(){
		TsvService.emptyCart();
		$location.path("/view1");
	}, TsvService.cache.custommachinesettings.paymentPageTimeout)
}

//cash.js
function startPaymentTimer(){
	TsvService.session.paymentTimer = $timeout(function(){
		TsvService.emptyCart();
		TsvService.session.inserted = 0;
		$location.path("/view1");
	}, TsvService.cache.custommachinesettings.paymentPageTimeout)
}

//Card_VENDING.js
function startPaymentTimer(){
	TsvService.session.paymentTimer = $timeout(function(){
		TsvService.emptyCart();
		TsvService.gotoDefaultIdlePage($location, $rootScope);
	}, TsvService.cache.custommachinesettings.paymentPageTimeout)
}

//*/

/*
// differing killTimers() functions....
// combining to one, and now pass in list of timers to kill instead
function killTimers(){
	console.log("Hi Ping Debug killTimers()");
	$timeout.cancel(TsvService.session.paymentTimer);
	$timeout.cancel(TsvService.session.adminTimer);
	$timeout.cancel(TsvService.session.thankyouTimer);
	$timeout.cancel(TsvService.session.vendErrorTimer);
}
function killTimers(){
	console.log("killTimers()");
	$timeout.cancel(TsvService.session.paymentTimer);
	$timeout.cancel(TsvService.session.cardErrorTimer);
}
function killCardErrorTimer(){
	console.log("CardErrorTimer()");
	$timeout.cancel(TsvService.session.cardErrorTimer);
}
//*/


/***

finish Tsv setup below here:

*/


var dispatch = function (e) {

	//curious what the structure of "e" is....
	console.log('[dispatch] check inbound "e"');
	console.log(e);

	var eventName = e.shift();
	console.log("[dispatch] EventName: " + eventName);
	var chain = Tsv.eventSubscriptions[eventName];
	
	//console.error('no "dirty scope" handling in React!!!');
	//console.log('note: "dirty scopes" are Angular components that are out of sync or whatever, and need to be manually tickled. should not be a problem in React.');
	//return [];

	var ds = [];

	// invoke all event subscribers
	if (!(chain === undefined)) {
		for (var i = 0; i < chain.length; i++) {
			var pair = chain[i];

			try {
				//pair[1].apply(pair[0], e);
				pair[0].apply(null, e);
				ds.push(pair[0]);

			} catch (err) {
				console.log("Failed invoking " + eventName + " handler: " + err);
			}
		}
	}

	return ds;
};

var refreshNgViews = function (dirtyScopes) {
	console.warn('[refreshNgViews()] deprecated, who called me???');
	console.log(dirtyScopes);
	return;
/*
	for (var i = 0; i < dirtyScopes.length; i++) {
		var $scope = dirtyScopes[i];
		try {
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		} catch (err) {
			console.log("Failed to refresh ng view " + err.message);
			console.log("Failed to refresh ng view " + err.message);

		}
	}
*/
};

var dispatchAll = function(eventList) {
	if (undefined != eventList) {

		if (eventList[0] == 'noEvent') {
			if (Tsv.failing) {
				eventList = [['noEvent']];
				Tsv.failing = false;
			} else {
				eventList = [];
			}
		}

		// dispatch all events received
		for (var ijk = 0; ijk < eventList.length; ijk++) {
			console.log("Debug eventList ijk0: "+ijk);
			try{
				var tsvEvent = eventList[ijk];

				console.log("TsvEvent: [" + tsvEvent.join(",") + "]");
				console.log("TsvEvent: [" + tsvEvent.join(",") + "]");

				var dirtyScopes = dispatch(tsvEvent);
				if (dirtyScopes.length != 0) {
					//refreshNgViews(dirtyScopes);
				}
			}
			catch (err) {
				console.log("Failed " + err.message);
			}
		}

	}
};

if (!Tsv.serviceIsStarted) {

	// set up event poller every 300 msec
	setInterval(function () {
	
		axios.post('/tsv-proxy/flashapi/multievent', {
			responseType: 'json'
		})
		.then(response => {
			dispatchAll(response.data);
			Tsv.failCount = 0;
		})
		.error(error => {
			Tsv.failing = true;
			if (Tsv.failCount > 3) {
				dispatchAll([['linkDown']]);
			} else {
				Tsv.failCount += 1;
			}
		});
	
		/*
	
		$.ajax({
			url: 'tsv/flashapi/multievent',
			data: '',
			method: 'POST',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			async: true,
			success: function (event) {
				dispatchAll(event);
				tsv.failCount = 0;
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log("event poll error: " + textStatus + " - " + errorThrown);
				tsv.failing = true;
				if (tsv.failCount > 3) {
					dispatchAll([['linkDown']]);
				} else {
					tsv.failCount++;
				}
			}
		});
	
		*/

	}, 150);
	
	Tsv.serviceIsStarted = true;
}

console.log("Completed initialization of TsvService.")

export default Tsv;