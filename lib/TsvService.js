"use strict";
import axios from 'axios'
import { browserHistory } from 'react-router'
import { moneyformat } from '../app/utils'

/**
* RPC interface to NetTSV
*/

//var avt = angular.module('avt', []);
//avt.factory('TSVService', ['$rootScope', '$timeout', 'translate', '$filter', function($rootScope, $timeout, translate, $filter) {

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

var TSV = {
	failing: true,
	failCount: 0,
	serviceIsStarted: false,
	currencyType: 'currency'
};

function doRequest(args) {

	var , callback = args.pop()
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
	TSV[tsvApi[i]] = (function (name) {
		return function () {

			var args = Array.prototype.slice.call(arguments);
			args.unshift(name);

			return doRequest(args);
		};
	})(tsvApi[i]);
}



/**** METHODS below here still need refactoring, Kent is working on it *****/

// override emptyCart so it clears any items from cached cart first
TSV.emptyCart = function() {
	RootscopeActions.setCache('shoppingCart.detail', []);
	doRequest(['emptyCart']);
};

// FIXME: turn into RootscopeActions:
// and: it's only called in one place: Admin_Component_Control.js
/*
TSV.refreshIndexPage = function() {
	window.location.reload();
};
*/

/*** EVENTS, SUBSCRIPTIONS ***/
// FIXME: change out eventSubscriptions here with utils/PubSub when ready
// (or, just use these since they work already with this app!)
TSV.eventSubscriptions = {};

TSV.isSubscribed = function(eventName, namespace) {
	var chain = TSV.eventSubscriptions[eventName];
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
//TSV.subscribe = function(eventName, self, handler, namespace) {
TSV.subscribe = function(eventName, handler, namespace) {
	
	if (TSV.isSubscribed(eventName, namespace)) {
		console.log("Already subscribed " + eventName + ", " + namespace, " replacing...");
		TSV.unsubscribe(eventName, namespace);
	}

	var chain = TSV.eventSubscriptions[eventName] || [];

	// see above DEVNOTE
	//chain.push([self, handler, namespace]);
	chain.push([handler, namespace]);

	TSV.eventSubscriptions[eventName] = chain;
};

TSV.unsubscribe =  function(eventName, namespace) {
	var chain = TSV.eventSubscriptions[eventName];
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

TSV.setVendingInProcessFlag = function (bool) {
	bool = typeof bool === 'undefined' ? true : bool;
	console.log("setVendingInProcessFlag()");
	//tsv.session.bVendingInProcess = true;
	RootscopeActions.setSession('bVendingInProcess', bool);
};

TSV.clearVendingInProcessFlag = function () {
	return TSV.setVendingInProcessFlag(false);
	console.log("clearVendingInProcessFlag()");
	//tsv.session.bVendingInProcess = false;
};

TSV.setVendingInProcessFlag(false);

TSV.vendResponse = function(processStatus) { //, $location, $rootScope) {
	console.log("Hi Ping Debug vendResponse!!!!!!!!!!!!!");
	TSV.resetSelectedItem();
	//TSV.cache.shoppingCart = tsv.fetchShoppingCart2();
	RootscopeActions.setCache('shoppingCart', TSV.fetchShoppingCart2());

	switch(processStatus){
		case "VEND_SUCCESS":
			console.log("Got event vendResponse(): "+processStatus);
			//tsv.cache.productList = tsv.fetchProduct(); //Not In Use Right Now

			if (TSV.isFullSuccessVendResult()){
				console.log("Full Vend Success!");
				browserHistory.push("/THANKYOU_MSG");
			} else {
				console.log("Partial Vend Error");
				//pay out
				if (RootscopeStore.getCache('currentLocation') == "/Cash_Vending"){
					TSV.enablePaymentDevice("PAYMENT_TYPE_CASH");
				}
				RootscopeActions.setSession('vendErrorMsg1', Translate.translate("Vending", "PartialVendFailure"));
				RootscopeActions.setSession('vendErrorMsg2',
					Translate.translate("Vending", "YouHaveBeenCharged") + TSV.currencyFilter( RootscopeStore.getSession('vendSettleTotal') );
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
	TSV.emptyCart();
};

TSV.isFullSuccessVendResult = function (){
	RootscopeActions.setSession('vendSettleTotal', RootscopeStore.getCache('shoppingCart.summary.netTotalPrice');
	var itemsVendFail = RootscopeStore.getCache('shoppingCart.summary.vendFailCount');
	var itemsVendSuccess = RootscopeStore.getCache('shoppingCart.summary.vendItemCount-itemsVendFail');

	if (itemsVendFail > 0) {
		console.log("is it a fullVendSuccess?(false)!success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
		return false;
	}
	console.log("is it a fullVendSuccess?(true)success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
	return true;
};

TSV.checkBalance = function (){
	console.log("checkBalance()!!!!!");
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, sc_detail = RootscopeStore.getCache('shoppingCart.detail') || []
		;

	if((creditBalance * 100) >= (total * 100) && sc_detail.length > 0){
		TSV.disablePaymentDevice();
		var v_i_p = RootscopeStore.getSession('bVendingInProcess');
		if(!v_i_p){
			console.log("Inserted Enough Cash should vend...!!!!!");
			RootscopeActions.setSession('cashMsg', "Vending...");
			TSV.setVendingInProcessFlag(true);
			//console.log("tsv.session.bVendingInProcess: " + v_i_p);
			TSV.startVend();
		}
	}
};

TSV.autoCheckout = function() {
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, cartItems = RootscopeStore.getCache('shoppingCart.detail') || []
		, itemsInCart = cartItems.length;

	console.log("autoCheckout() totalPrice = " + total + " credit = " + creditBalance + " items = " + itemsInCart);

	if (creditBalance >= total && itemsInCart > 0) {
		console.log("disabling payment device");
		TSV.disablePaymentDevice();

		console.log("check vend in process?");
		if (!RootscopeStore.getSession('bVendingInProcess')) {
			console.log("Calling gotoPayment on rootScope");
			RootscopeActions.gotoPayment();
		}

	} else {
		console.log("Insufficient funds to autoCheckout");
	}
}

TSV.cardTransaction = function(level) {
	var msg = '';
	switch(level){
		case "CARD_INSERTED":
			msg = Translate.translate("Card_Vending", "ProcessingMessage");
			break;
		case "CARD_PROCESSING":
			msg = Translate.translate("Card_Vending", "ProcessingMessage");
			break;
		case "CARD_APPROVED":
			TSV.disablePaymentDevice();
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

TSV.removeKeyboard = function() {
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

TSV.loadingSpinner = function (){
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

TSV.configCategories = function(){
	console.log("Hi Ping configCategories!");
	TSV.fetchProductCategoriesByParentCategoryID(0, function(err, data) {
		if (err) {
			return err;
		}
		RootscopeActions.setCategories(data);
	});
};

TSV.onGeneralTimeout = function () {
	console.log("gotoDefaultIdlePage()");

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
			TSV.emptyCart();
			TSV.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Category_Search":
			TSV.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
		case "/Product_Search":
			TSV.gotoDefaultIdlePage(); //$location, $rootScope);
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
			TSV.emptyCart();
			break;
		case "/Card_Vending":
			console.log("On card page idle timeout disabled...Running the paymentTimer...");
			TSV.emptyCart();
			break;
		case "/Admin_Check_Faults":
			if(!RootscopeStore.getSession('bRunningClearFaults')){
				TSV.gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from Admin_Check_Faults not running ClearFaults");
				return;
			}
			break;
		case "/Admin_Auto_Map":
			if(!RootscopeStore.getSession('bRunningAutoMap')){
				TSV.gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from Admin_Auto_Map not running AutoMap");
				return;
			}
			break;
		case "/Page_Idle":
			return;
		default:
			console.log("Idle Timeout from "+RootscopeStore.getCache('currentLocation'));
			TSV.emptyCart();
			TSV.gotoDefaultIdlePage(); //$location, $rootScope);
			return;
	}

	TSV.startGeneralIdleTimer(); //$location, $rootScope);//Ping added on 1016/2015
};

TSV.startGeneralIdleTimer = function($location, $rootScope) {
	TSV.killGeneralIdleTimer();
	
	var timer = setTimeout(function(){
		//console.log("Hi Ping generalIdleTimer timeout...");
		console.log("onGeneralIdleTimeout() @" + RootscopeStore.getCache('custommachinesettings.generalPageTimeout', "default"));
		TSV.onGeneralTimeout($location, $rootScope);
	}, RootscopeStore.getCache('custommachinesettings.generalPageTimeout', '120000') );
	
	RootscopeActions.setSession('generalIdleTimer', timer);
};

// deprecate this:
TSV.customSetting = function (name, dflt) {
	console.warn('[TSV.customSetting] HAY I should be deprecated, use direct RootscopeStore.getCache(\'custommachinesettings\') ')
	return RootscopeStore.getCache('custommachinesettings.'+name, dflt);
};

var stringToBoolean = function (string){
	switch(string.toLowerCase().trim()){
		case "true": case "yes": case "1": return true;
		case "false": case "no": case "0": case null: return false;
		default: return Boolean(string);
	}
}

TSV.bCustomSetting = function(name, dflt) {
	return stringToBoolean(RootscopeStore.getCache('custommachinesettings.'+name, dflt));
};

TSV.machineSetting = function (name, dflt) {
	console.warn('[TSV.machineSetting] HAY I should be deprecated, use direct RootscopeStore.getCache(\'machineSettings\') ')
	return RootscopeStore.getCache('machineSettings.'+name, dflt);
};

TSV.bMachineSetting = function (name, dflt) {
	return stringToBoolean(RootscopeStore.getCache('machineSettings.'+name, dflt));
};

TSV.resetGeneralIdleTimer = TSV.startGeneralIdleTimer;

TSV.isCartEmpty = function () {
	var cart = RootscopeStore.getCache('shoppingCart');
	if (!cart) {

		console.warn('this may be out of sync, as we have to check with the TSV.fetchShoppingCart2 thing for data');
		TSV.fetchShoppingCart2(null, function(err, data) {
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

TSV.killGeneralIdleTimer = function() {
	var timer = RootscopeStore.getSession('generalIdleTimer');
	if (timer === null || timer === undefined) return;
	RootscopeActions.setSession('generalIdleTimer', null);
	clearTimeout(timer);
};

TSV.gotoDefaultIdlePage = function () { //$location, $rootScope){
	TSV.resetSelectedItem();
	/*
	if (typeof $.fancybox !== "undefined"){
		$.fancybox.close();
	}
	*/
	
	TSV.checkActivation(null, function(err, resultCode) {
		if (resultCode !== "SUCCESS") {
			browserHistory.push("/Activate");
			return;
		}

		// appears that both conditions below do the same thing?
		if (RootscopeStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle") {
			browserHistory.push("/Page_Idle");
			return;
		} else {
			TSV.idleClicked($location, $rootScope);
		}
	});

};

TSV.idleClicked = function() { //$location, $rootScope){
	switch(RootscopeStore.getCache('custommachinesettings.txtSearchScene', '').toLowerCase()){

		case "make_donation":
			browserHistory.push("/Make_Donation");
			break;

		case "coil_keypad":
			browserHistory.push("/view1");
			break;

		case "category_search":
			TSV.configCategories(); //$rootScope);
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

TSV.resetSelectedItem = function (){
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
		TSV.removeKeyboard();
	}
};

/****

	methods below here,
	Kent imported from OLD app.js,
	and they used to be all
	$rootscope.methods()

	*/

TsvService.registerKF = function() {
	TsvService.registerComponent("KioskFramework", "1.0.0.3", "2015-12-10");
}

TSV.reloadPage = function(){ window.location.reload(); }

TSV.setCurrencyFilterType(type) {
	TSV.currencyType = type;
}
TSV.currencyFilter = function(amt, type) {
	type = type || TSV.currencyType; //'currency';
	
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


/***

finish TSV setup below here:

*/


var dispatch = function (e) {

	//curious what the structure of "e" is....
	console.log('[dispatch] check inbound "e"');
	console.log(e);

	var eventName = e.shift();
	console.log("[dispatch] EventName: " + eventName);
	var chain = TSV.eventSubscriptions[eventName];
	
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
			if (TSV.failing) {
				eventList = [['noEvent']];
				TSV.failing = false;
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

if (!TSV.serviceIsStarted) {

	// set up event poller every 300 msec
	setInterval(function () {
	
		axios.post('/tsv-proxy/flashapi/multievent', {
			responseType: 'json'
		})
		.then(response => {
			dispatchAll(response.data);
			TSV.failCount = 0;
		})
		.error(error => {
			TSV.failing = true;
			if (TSV.failCount > 3) {
				dispatchAll([['linkDown']]);
			} else {
				TSV.failCount += 1;
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
	
	TSV.serviceIsStarted = true;
}

console.log("Completed initialization of TSV service.")

export default TSV;