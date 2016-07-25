//import RootscopeStore from '../stores/RootscopeStore'
//import RootscopeActions from '../actions/RootscopeActions'
import TsvSettingsStore from '../stores/TsvSettingsStore'
import TsvActions from '../actions/TsvActions'
import { forceBoolean, moneyformat, timer } from './index'
import * as Translate from '../../lib/Translate'
import { browserHistory } from 'react-router'

import SessionActions from '../actions/SessionActions'
import TransactionActions from '../actions/TransactionActions'

import Log from './BigLogger'
var Big = new Log('TsvUtils');

var serviceIsStarted = false

	// currentPageView: replacement for rootscope.currentLocation or whatever....
	// still need to track it somehow, and this script will never get access to router.location.path
	, currentPageView = 'no-page-view'
	, lastTimerSetBy
	, globalTimers = {}
	, generalTimeoutMs = 60000 // config me!!!
	;

export function init() {
	if (!serviceIsStarted) {
		Big.warn(' --------- ...............       TsvService . init       ..................... --------------- ');
		setVendingInProcessFlag(false);
		TsvActions.serverHandshake();
		serviceIsStarted = true;
	}
}

export function currencyFilter(amt, type) {
	if (!amt || isNaN(amt)) {
		return 'error';
	}
	type = type || TsvSettingsStore.getConfig('currencyType'); //'currency';
	
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
	var app_config = TsvSettingsStore.getAppConfig();
	//TsvActions.apiCall('registerComponent',"KioskFramework", "1.0.0.3", "2015-12-10");
	TsvActions.apiCall('registerComponent', app_config.name, app_config.version, app_config.releaseDate);
}

export function setVendingInProcessFlag(bool) {
	Big.log("setVendingInProcessFlag()");
	bool = typeof bool === 'undefined' ? true : bool;
	bool = forceBoolean(bool);
	TsvSettingsStore.setSession('bVendingInProcess', bool);
}

export function clearVendingInProcessFlag() {
	setVendingInProcessFlag(false);
}

export function emptyCart() {
	TsvSettingsStore.setCache('shoppingCart.detail', []);
	TsvActions.apiCall('emptyCart');
}

export function vendResponse(processStatus) { //, $location, $rootScope) {
	Big.log("Hi Ping Debug vendResponse!!!!!!!!!!!!!");
	Big.log('processStatus: '+processStatus);
	resetSelectedItem();

	TsvActions.apiCall('fetchShoppingCart2', (err, cart) => {
		TsvSettingsStore.setCache('shoppingCart', cart);

		switch(processStatus){
			case "VEND_SUCCESS":
				
				TsvActions.postVendInventoryCleanup( cart );
				
				Big.log("Got event vendResponse(): "+processStatus);
				//tsv.cache.productList = tsv.fetchProduct(); //Not In Use Right Now

				if (isFullSuccessVendResult()){
					Big.log("Full Vend Success!");
					browserHistory.push("/ThankYouMsg");
					// moved here from below, but this is questionable
					SessionActions.closeSessionTransaction({ event: 'SHOPPING_AND_TRANSACTION_COMPLETE' });
					emptyCart();

				} else {
					Big.log("Partial Vend Error");
					//pay out
					/*
					// Kent is not sure about this? if we are "done" and vend error happens, why turn the payment device back on?
					if (TsvSettingsStore.getCache('currentLocation') == "/CashVending"){
					if (currentPageView == 'CashVending') {
						TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");
					}
					*/
					TsvSettingsStore.setSession({
						vendErrorMsg1: Translate.translate("Vending", "PartialVendFailure"),
						vendErrorMsg2: Translate.translate("Vending", "YouHaveBeenCharged") + currencyFilter( TsvSettingsStore.getSession('vendSettleTotal') )
					});
					browserHistory.push("/VendError");
					SessionActions.closeSessionTransaction({ event: 'SHOPPING_AND_TRANSACTION_COMPLETE', error: 'partial vend error' });
				}
				break;

			case "VEND_FAILURE":
				Big.log("Got event vendResponse(): "+processStatus);
				TsvSettingsStore.setSession({
					vendErrorMsg1: Translate.translate("Vending", "TotalVendFailure"),
					vendErrorMsg2: Translate.translate("Vending", "YouWereNotCharged")
				});
				browserHistory.push("/VendError");
				break;

			case "EXCEPTION":
				Big.log("Got event vendResponse(): "+processStatus);
				TsvSettingsStore.setSession({
					vendErrorMsg1: Translate.translate("Vending", "TotalVendFailure"),
					vendErrorMsg2: Translate.translate("Vending", "YouWereNotCharged")
				});
				browserHistory.push("/VendError");
				break;

			default:
				Big.log("Got event vendResponse, no idea what to do with it: "+processStatus);
				break;
		}

		// not sure about this, is this "single product vending" mode here?
		// moved to success areas
		//emptyCart();
	});
}

export function isFullSuccessVendResult() {
	TsvSettingsStore.setSession('vendSettleTotal', TsvSettingsStore.getCache('shoppingCart.summary.netTotalPrice') );
	var itemsVendFail = TsvSettingsStore.getCache('shoppingCart.summary.vendFailCount')
		, itemsVendSuccess = TsvSettingsStore.getCache('shoppingCart.summary.vendItemCount') - itemsVendFail
		;

	if (itemsVendFail > 0) {
		Big.log("is it a fullVendSuccess? (false) totalPaid: "+TsvSettingsStore.getCache('shoppingCart.summary.netTotalPrice')+", counts: success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
		return false;
	}
	Big.log("is it a fullVendSuccess? (true) totalPaid: "+TsvSettingsStore.getCache('shoppingCart.summary.netTotalPrice')+", counts: success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
	return true;
}

export function checkBalance() {
	//Big.log("checkBalance()!!!!!");
	var total = TsvSettingsStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = TsvSettingsStore.getSession('creditBalance')
		, sc_detail = TsvSettingsStore.getCache('shoppingCart.detail') || []
		;

	if ( creditBalance * 100 >= total * 100 && sc_detail.length > 0 ) {
		TsvActions.apiCall('disablePaymentDevice');
		var v_i_p = TsvSettingsStore.getSession('bVendingInProcess');
		if (!v_i_p) {
			//Big.log("Inserted Enough Cash should vend...!!!!!");
			//TsvSettingsStore.setSession('cashMsg', "Vending...");
			setVendingInProcessFlag(true);
			//Big.log("tsv.session.bVendingInProcess: " + v_i_p);
			TsvActions.apiCall('disablePaymentDevice');
			TsvActions.apiCall('startVend');
		}
	}
}

export function autoCheckout() {
	var total = TsvSettingsStore.getCache('shoppingCart.summary.TotalPrice')
		, creditBalance = TsvSettingsStore.getSession('creditBalance')
		, cartItems = TsvSettingsStore.getCache('shoppingCart.detail') || []
		, itemsInCart = cartItems.length;

	Big.log("autoCheckout() totalPrice = " + total + " credit = " + creditBalance + " items = " + itemsInCart);

	if (creditBalance >= total && itemsInCart > 0) {
		//Big.log("disabling payment device");
		TsvActions.apiCall('disablePaymentDevice');

		Big.log("check vend in process?");
		if (!TsvSettingsStore.getSession('bVendingInProcess')) {
			//Big.log("Calling gotoPayment on rootScope");
			//TsvSettingsStore.gotoPayment();
			// it's in here now....
			gotoPayment();
		}

	} else {
		Big.log("Insufficient funds to autoCheckout");
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
	TsvSettingsStore.setSession('cardMsg', msg);
	return msg;
}

export function onGeneralTimeout() {
	Big.log("onGeneralTimeout() called");
	
	KillGuiTimer();
	
	let gotoDef = false;

	if (TsvSettingsStore.getConfig('bDualLanguage')) {
		var dfltLang = TsvSettingsStore.getCache('custommachinesettings.languageDefaulted', "En");

		//Big.warn('old code calling for DOM manipulation, no good.... who called this?');
		//$('.showflag').removeClass('showflag').addClass('hideflag');
		//document.getElementById(dfltLang).className = "showflag";
		TsvSettingsStore.setConfig('selectedLanguage', dfltLang);
		Translate.selectLanguage(dfltLang);
	}

	//Big.log("TsvSettingsStore.getCache('currentLocation'): "+TsvSettingsStore.getCache('currentLocation'));
	Big.log('currentPageView: '+currentPageView);

	//switch (TsvSettingsStore.getCache('currentLocation')) {
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
			//gotoDefaultIdlePage(); //$location, $rootScope);
			gotoDef = true;
			break;
/*
		case "/MakeDonation":
			//tsv.emptyCart();
			break;
*/
		case "/CashVending":
		case "/CardVending":
			// FIXME: this still needs addressed, have not looked at this since LO went to credits only purchase!
			var T = getTimer('paymentTimer')
			if (!T || (T && T.getTimeLeft() <= 0)) {
				// but why are we emptying the cart here without going to DefaultIdlePage???
				// probably should check to see if any card action has run yet but no resolution (no success and no fail)
				// if none, then empty + idle, if some, "Payment is still processing, one moment please", resets main payment idle timer
				// will need to track this somehow through TsvStore?
				emptyCart();
				gotoDef = true;
			} else {
				Big.log("On "+currentPageView+" idle timeout disabled...Running the paymentTimer...");
				if (T.getTimeLeft()) {
					Big.log('time left in payment timer: '+T.getTimeLeft());
				}
			}
			break;

		case "/Admin/CheckFaults":
			if(!TsvSettingsStore.getSession('bRunningClearFaults')){
				//gotoDefaultIdlePage(); //$location, $rootScope);
				gotoDef = true;
				Big.log("Idle Timeout from /Admin/CheckFaults not running ClearFaults");
			}
			break;

		case "/Admin/AutoMap":
			if(!TsvSettingsStore.getSession('bRunningAutoMap')){
				//gotoDefaultIdlePage(); //$location, $rootScope);
				gotoDef = true;
				Big.log("Idle Timeout from /Admin/AutoMap not running AutoMap");
			}
			break;

		default:
			Big.log("default ... Idle Timeout from " + currentPageView);
			emptyCart();
			//gotoDefaultIdlePage(); //$location, $rootScope);
			gotoDef = true;
			break;
	}

	if (gotoDef) {
		SessionActions.dropSessionTransaction({ event: 'IDLE_TIMEOUT' });
		gotoDefaultIdlePage();
	} else {
		//startGeneralIdleTimer(currentPageView); //$location, $rootScope);//Ping added on 1016/2015
		GuiTimer();
	}
}

export function GuiTimer(ms, from, callback) {

	KillGuiTimer();

	ms = ms || generalTimeoutMs;
	if (!callback && from && typeof from === 'function') {
		callback = from;
		from = null;
	}
	callback = callback || onGeneralTimeout;

    var T = new timer( callback, ms )
    	, lastBy = lastTimerSetBy
    	;
    T.self(T);
    setTimer('GuiTimer', T);
    
    if (from) {
    	lastTimerSetBy = from;
    }
    
    return lastBy || true;
}

export function KillGuiTimer() {
	killTimers('GuiTimer');
}

export function thankYouTimer() {
	return GuiTimer(TsvSettingsStore.getCache('custommachinesettings.thankyouPageTimeout', 10000));
/*
    //var timer = setTimeout( gotoDefaultIdlePage, TsvSettingsStore.getCache('custommachinesettings.thankyouPageTimeout' ) );
    var T = new timer( gotoDefaultIdlePage, TsvSettingsStore.getCache('custommachinesettings.thankyouPageTimeout', 10000) );
    T.self(T);
    setTimer('thankyouTimer', T);
*/
}

export function vendErrorTimer() {
	return GuiTimer(TsvSettingsStore.getCache('custommachinesettings.VendErrorTimeout', 10000));
/*
    //var timer = setTimeout( gotoDefaultIdlePage, TsvSettingsStore.getCache('custommachinesettings.VendErrorTimeout', 10000) );
    var T = new timer( gotoDefaultIdlePage, TsvSettingsStore.getCache('custommachinesettings.VendErrorTimeout', 10000) );
    T.self(T);
    setTimer('vendErrorTimer', T);
*/
}

export function startGeneralIdleTimer(fromPage) {

	return GuiTimer(TsvSettingsStore.getCache('custommachinesettings.generalPageTimeout', 120000), fromPage);
/*
	var T = getTimer('generalIdleTimer')
	if (!T && /Admin/.test(fromPage)) {
		//Big.warn('skipping startGeneralIdleTimer() because it looks like we are in admin land, and timer was cancelled');
		return;
	}
	if (fromPage) {
		currentPageView = fromPage;
	}
	killGeneralIdleTimer();
	var ts = TsvSettingsStore.getCache('custommachinesettings.generalPageTimeout', 120000)
    	, T = new timer( onGeneralTimeout, ts );
    T.self(T);
	setTimer('generalIdleTimer', T);
*/
}

export function killGeneralIdleTimer() {
	return KillGuiTimer();
	//killTimers(['generalIdleTimer']);
}

function setTimer(label, timer) {
	if (label !== 'GuiTimer') {
		throw new Error('who did dat? (setTimer called with non-GuiTimer label: '+label+')');
	}
	globalTimers[label] = timer;
}

export function getTimer(label) {
	return globalTimers.GuiTimer;
	//return globalTimers[label];
}

function getTimers() {
	return globalTimers;
}

function dropTimer(label) {
	if (globalTimers[label]) {
		if (globalTimers[label].stop) {
			globalTimers[label].stop();
		}
		delete globalTimers[label];
	}
}

export function resetPaymentTimer() {
	//Big.log("Hi Ping Debug reset the paymentTimer");
	//killTimers('paymentTimer'); //TsvActions.stopPaymentTimer();
	//startPaymentTimer();
	return GuiTimer(TsvSettingsStore.getCache('custommachinesettings.paymentPageTimeout', 120000));
}

export function killAllTimers() {
	var timerSet = getTimers();
	if (timerSet) {
		Object.keys(timerSet).forEach( K => {
			var ref = timerSet[K];
			if (ref) {
				if (ref.stop) {
					ref.stop();
				} else {
					clearTimeout(ref);
				}
			}
			dropTimer(K);
		});
	}
}

export function killTimers(timerList) {

	if (timerList && typeof timerList === 'string') { timerList = [timerList]; }

	if (timerList && timerList.length) {
		var timerSet = getTimers();
		if (timerSet) {
			timerList.forEach( TIMER => {
				if (timerSet[TIMER]) {
					var ref = timerSet[TIMER];
					if (ref) {
						if (ref.stop) {
							ref.stop();
						} else {
							clearTimeout(ref);
						}
					}
					dropTimer(TIMER);
				}
			});
		}
	}

}

export function startPaymentTimer( idlePage ){
	return GuiTimer(TsvSettingsStore.getCache('custommachinesettings.paymentPageTimeout', 120000));

	var timeoutLength = TsvSettingsStore.getCache('custommachinesettings.paymentPageTimeout');
/*
	// allow override to /View1
	idlePage = idlePage || 'idle';

	// for now though, force all to go to Idle page,
	// because /View1 is the keypad input interface for single product choose + purchase (no shopping cart)
	idlePage = 'idle';
*/
	if (!timeoutLength) {
		Big.log( TsvSettingsStore.getCache('custommachinesettings') );
		Big.throw('startPaymentTimer: I need a timeoutLength to start a timeout! none found.');
	}
	
    var T = new timer( () => {
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
    T.self(T);
	setTimer('paymentTimer', T);
}

export function isCartEmpty(cb) {
	var cart = TsvSettingsStore.getCache('shoppingCart');
	if (!cart) {

		Big.warn('this may be out of sync, as we have to check with the TsvActions.apiCall(fetchShoppingCart2) thing for data');
		TsvActions.apiCall('fetchShoppingCart2', function(err, data) {
			if (err) {
				Big.warn('error trying to fetchShoppingCart2!');
				Big.warn(err);
				cb(null, false);
			}
			TsvSettingsStore.setCache('shoppingCart', data);
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
	if (TsvSettingsStore.getCache('custommachinesettings', undefined) === undefined) {
		window.location.reload();
		return;
	}
	
	function activated(setActivation) {
		if (setActivation) {
			// no need to constantly poke this thing:
			TsvSettingsStore.setConfig('activated', true);
		}

		resetSelectedItem();
		// need to log out any customer record at this point
		//Big.warn('uh, are we stuck on soething here? CL_Actions no has method???');
		//Big.log(Object.keys(CL_Actions));
		//Big.log(CL_Actions);
		//CL_Actions.customerLogout();
		// moved into here to kill module load race condition:
		TsvActions.customerLogout();
		emptyCart();

		if (TsvSettingsStore.getCache('custommachinesettings.txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle"){
			browserHistory.push("/PageIdle");
			return;

		} else {
			
			return browserHistory.push('/PageIdle'); // ("/Storefront"); <<< this actually should be going to PageIdle
			// there used to be more options here, look in old TsvService to see them
		}
	}
	
	if (TsvSettingsStore.getConfig('activated')) {
		activated(false)
	} else {
	
		TsvActions.apiCall('checkActivation', (err, result) => {
		
			Big.warn('checkActivation');
			Big.log(result);
		
			if (!result || result.resultCode !== "SUCCESS") {
				//Big.throw('WHY U NO ACTIVATE');
				// FIXME (or not) temporarily disabling this, not sure what the deal is with TSV <=> AVT
				//return browserHistory.push("/Admin/Activate");
			}
		
			activated(true);
		});
	}
}

export function idleClicked() {
	return browserHistory.push("/Storefront");	
	// there used to be more options here, look in old TsvService to see them
}

export function resetSelectedItem() {
	//Big.log("resetSelectedItem()!");
	TsvSettingsStore.setSession({
		bRunningClearFaults: false,
		bRunningAutoMap: false,
		cashMsg: Translate.translate("CashVending", "HintMessageInsertCash"),
		vendErrorMsg1: '',
		vendErrorMsg2: '',
		vendSettleTotal: 0,
		bVendedOldCredit: false
	});
}


/******

stuff below here are old "rootscope" actions mostly.

*******/

// this is never called anywhere:
export function getCreditMessage() {
	if (TsvSettingsStore.getConfig('bCashless')) {
		return Translate.translate("BalanceLabel") + ":" + '\n' + currencyFilter( TsvSettingsStore.getConfig('fundsAvailable') );
	} else {
		return Translate.translate("CreditLabel") + ":"  + '\n'+  currencyFilter( TsvSettingsStore.getConfig('credit') );
	}
}

// this is never called anywhere:
export function getShowCredit() {
	if (TsvSettingsStore.getConfig('bCashless')) {
		var fundsA = TsvSettingsStore.getConfig('fundsAvailable');
		return typeof fundsA !== 'undefined' && fundsA !== 0 && TsvSettingsStore.getConfig('bShowCredit');
	} else {
		var credit = TsvSettingsStore.getConfig('credit');
		return typeof credit !== 'undefined' && credit !== 0 && TsvSettingsStore.getConfig('bShowCredit');
	}
}



/*
// this function was never called in the old code.... looks suspect as well.
// if you try to use, test heavily and study the logic
export function checkout() {
	var bHasShoppingCart = TsvSettingsStore.getCache('custommachinesettings.bHasShoppingCart', true)
		, fundsAvailable = TsvSettingsStore.getConfig('fundsAvailable')
		, summary = TsvSettingsStore.getConfig('summary')
		;

	if (fundsAvailable >= summary.TotalPrice) {
		browserHistory.push("/Cashless_Vending");

	} else {
		//Big.log("bHasShoppingCart:" + TsvService .bCustomSetting('bHasShoppingCart', "true"));
		if (bHasShoppingCart && TsvSettingsStore.getCache('currentLocation') != "/ShoppingCart"){
			browserHistory.push("/ShoppingCart");

		} else {

			if (bHasShoppingCart) {
				return browserHistory.push("/ShoppingCart");
			}

			if (TsvSettingsStore.getCache('custommachinesettings.bAskForReceipt', false)) {
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
	
	var TotalPrice = TsvSettingsStore.getCache('shoppingCart.summary.TotalPrice', 0);
	
	// all payments for now with Living On are customer credits only, we'll need to fix this later
	var payLocation = '/CustomerCreditVending'; // '/ChooseCashCard'
	return browserHistory.push(payLocation);

	if (TotalPrice != 0
		&& TsvSettingsStore.getCache('custommachinesettings.HasCreditCard', true)
		&& TsvSettingsStore.getCache('custommachinesettings.HasBillCoin', true)) {
		browserHistory.push("/ChooseCashCard");

	} else {

		if (TsvSettingsStore.getCache('custommachinesettings.HasBillCoin', true)){
			browserHistory.push("/CashVending");

		} else if (TsvSettingsStore.getCache('custommachinesettings.HasCreditCard', true)) {
			browserHistory.push("/CardVending");

		// this doesn't seem right:
		//} else if (TotalPrice == 0) {
			//browserHistory.push("/CardVending");
		}
	}
}

export function updateCredit() {
	var discount = TsvSettingsStore.getSession('discount', 0)
		, creditBalance = TsvSettingsStore.getSession('creditBalance', 0)
		;
	TsvSettingsStore.setConfig('credit', discount + creditBalance);
}

export function coupon() {
	TsvSettingsStore.setConfig('keyboardView', "Enter_Coupon");
	browserHistory.push("/Keyboard");
}
