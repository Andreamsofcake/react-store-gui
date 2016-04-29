import RootscopeStore from '../stores/RootscopeStore'
import RootscopeActions from '../actions/RootscopeActions'
import TsvActions from '../actions/TsvActions'
import { forceBoolean, moneyformat } from './index'
import * as Translate from '../../lib/Translate'
import { browserHistory } from 'react-router'

var serviceIsStarted = false

	// currentPageView: replacement for rootscope.currentLocation or whatever....
	// still need to track it somehow, and this script will never get access to router.location.path
	, currentPageView
	;

export function init() {
	if (!serviceIsStarted) {
		console.warn(' --------- ...............       TsvService . init       ..................... --------------- ');
		setVendingInProcessFlag(false);
		TsvActions.serverHandshake();
		serviceIsStarted = true;
	}
}

export function currencyFilter(amt, type) {
	if (!amt || isNaN(amt)) {
		return 'error';
	}
	type = type || RootscopeStore.getConfig('currencyType'); //'currency';
	
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
		default:
			return 'unknown currency' + type;
			break;
	}
}

export function registerKF() {
	var app_config = RootscopeStore.getAppConfig();
	//TsvActions.apiCall('registerComponent',"KioskFramework", "1.0.0.3", "2015-12-10");
	TsvActions.apiCall('registerComponent', app_config.name, app_config.version, app_config.releaseDate);
}

export function setVendingInProcessFlag(bool) {
	console.log("setVendingInProcessFlag()");
	bool = typeof bool === 'undefined' ? true : bool;
	bool = forceBoolean(bool);
	RootscopeActions.setSession('bVendingInProcess', bool);
}

export function clearVendingInProcessFlag() {
	setVendingInProcessFlag(false);
}

export function emptyCart() {
	RootscopeActions.setCache('shoppingCart.detail', []);
	TsvActions.apiCall('emptyCart');
}

export function vendResponse(processStatus) { //, $location, $rootScope) {
	//console.log("Hi Ping Debug vendResponse!!!!!!!!!!!!!");
	resetSelectedItem();

	TsvActions.apiCall('fetchShoppingCart2', (err, cart) => {
		RootscopeActions.setCache('shoppingCart', cart);

		switch(processStatus){
			case "VEND_SUCCESS":
				console.log("Got event vendResponse(): "+processStatus);
				//tsv.cache.productList = tsv.fetchProduct(); //Not In Use Right Now

				if (isFullSuccessVendResult()){
					console.log("Full Vend Success!");
					browserHistory.push("/ThankYouMsg");

				} else {
					console.log("Partial Vend Error");
					//pay out
					/*
					// Kent is not sure about this? if we are "done" and vend error happens, why turn the payment device back on?
					if (RootscopeStore.getCache('currentLocation') == "/CashVending"){
					if (currentPageView == 'CashVending') {
						TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");
					}
					*/
					RootscopeActions.setSession({
						vendErrorMsg1: Translate.translate("Vending", "PartialVendFailure"),
						vendErrorMsg2: Translate.translate("Vending", "YouHaveBeenCharged") + currencyFilter( RootscopeStore.getSession('vendSettleTotal') )
					});
					browserHistory.push("/VendError");
				}
				break;

			case "VEND_FAILURE":
				console.log("Got event vendResponse(): "+processStatus);
				RootscopeActions.setSession({
					vendErrorMsg1: Translate.translate("Vending", "TotalVendFailure"),
					vendErrorMsg2: Translate.translate("Vending", "YouWereNotCharged")
				});
				browserHistory.push("/VendError");
				break;

			case "EXCEPTION":
				console.log("Got event vendResponse(): "+processStatus);
				RootscopeActions.setSession({
					vendErrorMsg1: Translate.translate("Vending", "TotalVendFailure"),
					vendErrorMsg2: Translate.translate("Vending", "YouWereNotCharged")
				});
				browserHistory.push("/VendError");
				break;

			default:
				console.log("Got event vendResponse, no idea what to do with it: "+processStatus);
				break;
		}

		// not sure about this, is this "single product vending" mode here?
		emptyCart();
	});
}

export function isFullSuccessVendResult() {
	RootscopeActions.setSession('vendSettleTotal', RootscopeStore.getCache('shoppingCart.summary.netTotalPrice') );
	var itemsVendFail = RootscopeStore.getCache('shoppingCart.summary.vendFailCount')
		, itemsVendSuccess = RootscopeStore.getCache('shoppingCart.summary.vendItemCount') - itemsVendFail
		;

	if (itemsVendFail > 0) {
		console.log("is it a fullVendSuccess?(false)!success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
		return false;
	}
	console.log("is it a fullVendSuccess?(true)success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
	return true;
}

export function checkBalance() {
	//console.log("checkBalance()!!!!!");
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, sc_detail = RootscopeStore.getCache('shoppingCart.detail') || []
		;

	if ( creditBalance * 100 >= total * 100 && sc_detail.length > 0 ) {
		TsvActions.apiCall('disablePaymentDevice');
		var v_i_p = RootscopeStore.getSession('bVendingInProcess');
		if (!v_i_p) {
			//console.log("Inserted Enough Cash should vend...!!!!!");
			//RootscopeActions.setSession('cashMsg', "Vending...");
			setVendingInProcessFlag(true);
			//console.log("tsv.session.bVendingInProcess: " + v_i_p);
			TsvActions.apiCall('disablePaymentDevice');
			TsvActions.apiCall('startVend');
		}
	}
}

export function autoCheckout() {
	var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = RootscopeStore.getSession('creditBalance')
		, cartItems = RootscopeStore.getCache('shoppingCart.detail') || []
		, itemsInCart = cartItems.length;

	console.log("autoCheckout() totalPrice = " + total + " credit = " + creditBalance + " items = " + itemsInCart);

	if (creditBalance >= total && itemsInCart > 0) {
		//console.log("disabling payment device");
		TsvActions.apiCall('disablePaymentDevice');

		console.log("check vend in process?");
		if (!RootscopeStore.getSession('bVendingInProcess')) {
			//console.log("Calling gotoPayment on rootScope");
			//RootscopeActions.gotoPayment();
			// it's in here now....
			gotoPayment();
		}

	} else {
		console.log("Insufficient funds to autoCheckout");
	}
}

export function cardTransaction(level) {
	var msg = '';
	switch(level){
		case "CARD_INSERTED":
			msg = Translate.translate("CardVending", "ProcessingMessage");
			break;
		case "CARD_PROCESSING":
			msg = Translate.translate("CardVending", "ProcessingMessage");
			break;
		case "CARD_APPROVED":
			TsvActions.apiCall('disablePaymentDevice');
			break;
		case "CARD_INVALID_READ":
			msg = Translate.translate("CardVending", "CardInvalidMessage");
			break;
		case "CARD_DECLINED":
			msg = Translate.translate("CardVending", "CardDeclinedMessage");
			break;
		case "CARD_CONNECTION_FAILURE":
			msg = Translate.translate("CardVending", "CardConnectionErrorMessage");
			break;
		case "CARD_UNKNOWN_ERROR":
			msg = Translate.translate("CardVending", "CardUnknownErrorMessage");
			break;
		default:
			msg = Translate.translate("CardVending", "CardUnknownErrorMessage");
			break;
	}
	RootscopeActions.setSession('cardMsg', msg);
	return msg;
}

export function onGeneralTimeout() {
	console.log("onGeneralTimeout()");

	if (RootscopeStore.getConfig('bDualLanguage')) {
		var dfltLang = RootscopeStore.getCache('custommachinesettings.languageDefaulted', "En");

		//console.warn('old code calling for DOM manipulation, no good.... who called this?');
		//$('.showflag').removeClass('showflag').addClass('hideflag');
		//document.getElementById(dfltLang).className = "showflag";
		RootscopeActions.setConfig('selectedLanguage', dfltLang);
		Translate.selectLanguage(dfltLang);
	}

	//console.log("RootscopeStore.getCache('currentLocation'): "+RootscopeStore.getCache('currentLocation'));
	console.log('currentPageView: '+currentPageView);

	//switch (RootscopeStore.getCache('currentLocation')) {
	switch (currentPageView) {

		case "/PageIdle": // this is the "idle" page... should be here instead of storefront eventually, but for now we have no idle graphics
		case "/View0": // this is the "reset" page... should be here instead of storefront eventually, but for now we have no idle graphics
// these two have their own timers:
		case "/ThankYouMsg":
		case "/VendError":
			break;

		case "/View1":
		case "/CategorySearch":
		case "/ProductSearch":
			emptyCart();
			gotoDefaultIdlePage(); //$location, $rootScope);
			return;
/*
		case "/MakeDonation":
			//tsv.emptyCart();
			break;
*/
		case "/CashVending":
		case "/CardVending":
			console.log("On "+currentPageView+" idle timeout disabled...Running the paymentTimer...");
			// but why are we emptying the cart here without going to DefaultIdlePage???
			// probably should check to see if any card action has run yet but no resolution (no success and no fail)
			// if none, then empty + idle, if some, "Payment is still processing, one moment please", resets main payment idle timer
			// will need to track this somehow through TsvStore?
			emptyCart();
			break;

		case "/Admin/CheckFaults":
			if(!RootscopeStore.getSession('bRunningClearFaults')){
				gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from /Admin/CheckFaults not running ClearFaults");
				return;
			}
			break;

		case "/Admin/AutoMap":
			if(!RootscopeStore.getSession('bRunningAutoMap')){
				gotoDefaultIdlePage(); //$location, $rootScope);
				console.log("Idle Timeout from /Admin/AutoMap not running AutoMap");
				return;
			}
			break;

		default:
			//console.log("Idle Timeout from "+RootscopeStore.getCache('currentLocation'));
			console.log("Idle Timeout from " + currentPageView);
			emptyCart();
			gotoDefaultIdlePage(); //$location, $rootScope);
			return;
	}

	startGeneralIdleTimer(); //$location, $rootScope);//Ping added on 1016/2015
}

export function thankYouTimer() {
    var timer = setTimeout( gotoDefaultIdlePage, RootscopeActions.getCache('custommachinesettings.thankyouPageTimeout' ) );
    RootscopeActions.setSession('thankyouTimer', timer);
}

export function vendErrorTimer() {
    var timer = setTimeout( gotoDefaultIdlePage, RootscopeActions.getCache('custommachinesettings.VendErrorTimeout', 10000) );
    RootscopeActions.setSession('vendErrorTimer', timer);
}

export function startGeneralIdleTimer(fromPage) {
	if (fromPage) {
		currentPageView = fromPage;
	}
	killGeneralIdleTimer();
	var timer = setTimeout(() => {
		//console.log("Hi Ping generalIdleTimer timeout...");
		console.log("onGeneralIdleTimeout() @" + RootscopeStore.getCache('custommachinesettings.generalPageTimeout', 120000));
		onGeneralTimeout();
	}, RootscopeStore.getCache('custommachinesettings.generalPageTimeout', 120000) );
	
	RootscopeActions.setSession('generalIdleTimer', timer);
}

export function killGeneralIdleTimer() {
	killTimers(['generalIdleTimer']);
	/*
	var timer = RootscopeStore.getSession('generalIdleTimer');
	if (timer === null || timer === undefined || !timer) return;
	RootscopeActions.setSession('generalIdleTimer', null);
	clearTimeout(timer);
	*/
}

export function isCartEmpty(cb) {
	var cart = RootscopeStore.getCache('shoppingCart');
	if (!cart) {

		console.warn('this may be out of sync, as we have to check with the TsvActions.apiCall(fetchShoppingCart2) thing for data');
		TsvActions.apiCall('fetchShoppingCart2', function(err, data) {
			if (err) {
				console.warn('error trying to fetchShoppingCart2!');
				console.warn(err);
				cb(null, false);
			}
			RootscopeActions.setCache('shoppingCart', data);
			cb(null, !(data.detail && data.detail.length));
		})

	} else if (!cart.detail) {
		cb(null, true );
	} else {
		cb(null,  cart.detail.length == 0  );
	}
}

export function gotoDefaultIdlePage() { //$location, $rootScope){

	// can't go to idle page until we get settings!
	if (RootscopeStore.getCache('custommachinesettings', undefined) === undefined) {
		window.location.reload();
		return;
	}
	
	TsvActions.apiCall('checkActivation', (err, result) => {
		
		console.warn('[checkActivation]');
		console.log(result);
		
		if (!result || result.resultCode !== "SUCCESS") {
			//throw new Error('WHY U NO ACTIVATE');
			return browserHistory.push("/Activate");
		}

		resetSelectedItem();

		if (RootscopeStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle"){
			browserHistory.push("/PageIdle");
			return;

		} else {
			
			return browserHistory.push("/Storefront");
			// there used to be more options here, look in old TsvService to see them
		}
	});
}

export function idleClicked() {
	return browserHistory.push("/Storefront");	
	// there used to be more options here, look in old TsvService to see them
}

export function resetSelectedItem() {
	//console.log("resetSelectedItem()!");
	RootscopeActions.setSession({
		bRunningClearFaults: false,
		bRunningAutoMap: false,
		cashMsg: Translate.translate("CashVending", "HintMessageInsertCash"),
		vendErrorMsg1: '',
		vendErrorMsg2: '',
		vendSettleTotal: 0,
		bVendedOldCredit: false
	});
}

export function resetPaymentTimer() {
	//console.log("Hi Ping Debug reset the paymentTimer");
	killTimers('paymentTimer'); //TsvActions.stopPaymentTimer();
	startPaymentTimer();
}

export function killTimers(timerList) {

	if (timerList && typeof timerList === 'string') { timerList = [timerList]; }

	if (timerList && timerList.length) {
		var timerSet = {};
		timerList.forEach( TIMER => {
			var ref = RootscopeStore.getSession(TIMER);
			if (ref) {
				clearTimeout(ref);
			}
			timerSet[TIMER] = null;
		});
		RootscopeActions.setSession(timerSet);
	}

}

export function startPaymentTimer( idlePage ){
	var timeoutLength = RootscopeStore.getCache('custommachinesettings.paymentPageTimeout');
/*
	// allow override to /View1
	idlePage = idlePage || 'idle';

	// for now though, force all to go to Idle page,
	// because /View1 is the keypad input interface for single product choose + purchase (no shopping cart)
	idlePage = 'idle';
*/
	if (!timeoutLength) {
		console.log( RootscopeStore.getCache('custommachinesettings') );
		throw new Error('[TsvUtils.startPaymentTimer] I need a timeoutLength to start a timeout! none found.');
	}
	
	var timeout = setTimeout( () => {
		emptyCart();
		//stopPaymentTimer();
		killTimers('paymentTimer');

		switch (idlePage) {
			// "View1" is the keypad input interface for single product choose + purchase (no cart)
			case 'View1':
				browserHistory.push('/View1');
				break;

			default:
				gotoDefaultIdlePage();
				break;
		}

	}, timeoutLength );
	
	RootscopeActions.setSession('paymentTimer', timeout);
}




/******

stuff below here are old "rootscope" actions mostly.

*******/

// this is never called anywhere:
export function getCreditMessage() {
	if (RootscopeStore.getConfig('bCashless')) {
		return Translate.translate("BalanceLabel") + ":" + '\n' + currencyFilter( RootscopeStore.getConfig('fundsAvailable') );
	} else {
		return Translate.translate("CreditLabel") + ":"  + '\n'+  currencyFilter( RootscopeStore.getConfig('credit') );
	}
}

// this is never called anywhere:
export function getShowCredit() {
	if (RootscopeStore.getConfig('bCashless')) {
		var fundsA = RootscopeStore.getConfig('fundsAvailable');
		return typeof fundsA !== 'undefined' && fundsA !== 0 && RootscopeStore.getConfig('bShowCredit');
	} else {
		var credit = RootscopeStore.getConfig('credit');
		return typeof credit !== 'undefined' && credit !== 0 && RootscopeStore.getConfig('bShowCredit');
	}
}



/*
// this function was never called in the old code.... looks suspect as well.
// if you try to use, test heavily and study the logic
export function checkout() {
	var bHasShoppingCart = RootscopeStore.getCache('custommachinesettings.bHasShoppingCart', true)
		, fundsAvailable = RootscopeStore.getConfig('fundsAvailable')
		, summary = RootscopeStore.getConfig('summary')
		;

	if (fundsAvailable >= summary.TotalPrice) {
		browserHistory.push("/Cashless_Vending");

	} else {
		//console.log("bHasShoppingCart:" + TsvService .bCustomSetting('bHasShoppingCart', "true"));
		if (bHasShoppingCart && RootscopeStore.getCache('currentLocation') != "/ShoppingCart"){
			browserHistory.push("/ShoppingCart");

		} else {

			if (bHasShoppingCart) {
				return browserHistory.push("/ShoppingCart");
			}

			if (RootscopeStore.getCache('custommachinesettings.bAskForReceipt', false)) {
				this.setConfig('keyboardView', "Enter_Email");
				browserHistory.push("/Keyboard");
			} else {
				this.gotoPayment();
			}
		}
	}
}
*/

export function gotoPayment(){
	//TsvActions.apiCall("gotoPayment() called");
	
	var TotalPrice = RootscopeStore.getCache('shoppingCart.summary.TotalPrice', 0);

	if (TotalPrice != 0
		&& RootscopeStore.getCache('custommachinesettings.HasCreditCard', true)
		&& RootscopeStore.getCache('custommachinesettings.HasBillCoin', false)) {
		browserHistory.push("/ChooseCashCard");

	} else {

		if (RootscopeStore.getCache('custommachinesettings.HasBillCoin', false)){
			browserHistory.push("/CashVending");

		} else if (RootscopeStore.getCache('custommachinesettings.HasCreditCard', true)) {
			browserHistory.push("/CardVending");

		} else if (TotalPrice == 0) {
			browserHistory.push("/CardVending");
		}
	}
}

export function updateCredit() {
	var discount = RootscopeStore.getSession('discount', 0)
		, creditBalance = RootscopeStore.getSession('creditBalance', 0)
		;
	RootscopeActions.setConfig('credit', discount + creditBalance);
}

export function coupon() {
	RootscopeStore.setConfig('keyboardView', "Enter_Coupon");
	browserHistory.push("/Keyboard");
}
