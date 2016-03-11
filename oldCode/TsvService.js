"use strict";
import axios from 'axios'

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

    var tsv = {};

    tsv.failing = true;
    tsv.failCount = 0;

    function doRequest(args) {

        var , callback = args.pop()
        	, requestJson = JSON.stringify(args)
        	;

        if (!callback || typeof callback !== 'function') {
        	throw new Error( 'tsv service requires last argument to be a callback, standard nodejs signature (err, data)' );
        }

        axios.post('tsv/flashapi', requestJson)
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
        tsv[tsvApi[i]] = (function (name) {
            return function () {

                var args = Array.prototype.slice.call(arguments);
                args.unshift(name);

                return doRequest(args);
            };
        })(tsvApi[i]);
    }

    // FIXME: turn into RootscopeStore + RootscopeActions:
    // RootscopeStore._store.session
    // RootscopeStore._store.cache
    // etc

//*Andrea refactor 3/11
    // tsv.session = {};
    // tsv.session.cashMsg = translate.translate("Cash_Vending", "HintMessageInsertCash");
    // tsv.session.cardMsg = translate.translate("Card_Vending", "InstructionMessage");
    // tsv.session.vendErrorMsg1 = "vendErrorMsg1";
    // tsv.session.vendErrorMsg2 = "vendErrorMsg2";
    // tsv.session.vendSettleTotal = 0;
    // tsv.session.creditBalance = 0;
    // tsv.session.discount = 0;
    // //tsv.session.thankyouTimer;
    // //tsv.session.vendErrorTimer;
    // //tsv.session.paymentTimer;
    // //tsv.session.generalIdleTimer;
    // //tsv.session.cardErrorTimer;
    // tsv.session.bRunningAutoMap = false;
    // tsv.session.machineID = 0;
    // //tsv.session.currentView;
    // tsv.session.bVendedOldCredit = false;
    // tsv.session.categories = null;
    // tsv.session.products = null;

    // tsv.cache = {};
    // tsv.cache.shoppingCart = {};
    // tsv.cache.productList = {};
    // tsv.cache.planogram = {};
    // tsv.cache.machineSettings = {};
    // tsv.cache.custommachinesettings = {};
    // tsv.cache.machineList = {};
    // tsv.cache.prdHashTable = {};

/**** METHODS below here still need refactoring, Kent is working on it *****/
    // override emptyCart so it clears any items from cached cart first
    tsv.emptyCart = function() {
    	// FIXME: tie this into the RootscopeStore + RootscopeAction somehow maybe?
    	// should be something like: RootscopeAction.emptyCart()
        if (tsv.cache.shoppingCart && tsv.cache.shoppingCart.detail) {
            tsv.cache.shoppingCart.detail = [];
        }
        doRequest(['emptyCart']);
    };

    // FIXME: turn into RootscopeAction:
    tsv.refreshIndexPage = function() {
        window.location.reload();
    };

/*** EVENTS, SUBSCRIPTIONS ***/
    // FIXME: change out eventSubscriptions here with utils/PubSub when ready
    tsv.eventSubscriptions = {};

    tsv.isSubscribed = function(eventName, namespace) {
        var chain = tsv.eventSubscriptions[eventName];
        if (chain === undefined) return false;
        var len = chain.length;
        for (var i = 0; i < len; i++) {
            if (chain[i][2] === namespace) {
                return true;
            }
        }
        return false;
    };

    tsv.subscribe = function(eventName, self, handler, namespace) {
        if (tsv.isSubscribed(eventName, namespace)) {
            console.log("Already subscribed " + eventName + ", " + namespace, " replacing...");
            tsv.unsubscribe(eventName, namespace);
        }

        var chain = tsv.eventSubscriptions[eventName] || [];
        chain.push([self, handler, namespace]);
        tsv.eventSubscriptions[eventName] = chain;
    };

    tsv.unsubscribe =  function(eventName, namespace) {
        var chain = tsv.eventSubscriptions[eventName];
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

    tsv.setVendingInProcessFlag = function () {
        tsv.debug("setVendingInProcessFlag()");
        tsv.session.bVendingInProcess = true;
    };

    tsv.clearVendingInProcessFlag = function () {
        tsv.debug("clearVendingInProcessFlag()");
        tsv.session.bVendingInProcess = false;
    };

    tsv.clearVendingInProcessFlag();

    tsv.vendResponse = function(processStatus, $location, $rootScope) {
        tsv.debug("Hi Ping Debug vendResponse!!!!!!!!!!!!!");
        tsv.resetSelectedItem();
        tsv.cache.shoppingCart = tsv.fetchShoppingCart2();

        switch(processStatus){
            case "VEND_SUCCESS":
                tsv.debug("Got event vendResponse(): "+processStatus);
                //tsv.cache.productList = tsv.fetchProduct(); //Not In Use Right Now

                if (tsv.isFullSuccessVendResult()){
                    tsv.debug("Full Vend Success!");
                    $location.path("/THANKYOU_MSG");
                }else{
                    tsv.debug("Partial Vend Error");
                    //pay out
                    if ($location.path() == "/Cash_Vending"){
                        tsv.enablePaymentDevice("PAYMENT_TYPE_CASH");
                    }
                    tsv.session.vendErrorMsg1 = translate.translate("Vending", "PartialVendFailure");
                    tsv.session.vendErrorMsg2 = translate.translate("Vending", "YouHaveBeenCharged")
                                                + $rootScope.currencyFilter(tsv.session.vendSettleTotal);
                    $location.path("/Vend_Error");
                }
                break;
            case "VEND_FAILURE":
                tsv.debug("Got event vendResponse(): "+processStatus);
                tsv.session.vendErrorMsg1 = translate.translate("Vending", "TotalVendFailure");
                tsv.session.vendErrorMsg2 = translate.translate("Vending", "YouWereNotCharged");
                $location.path("/Vend_Error");
                break;
            case "EXCEPTION":
                console.log("Got event vendResponse(): "+processStatus);
                tsv.session.vendErrorMsg1 = translate.translate("Vending", "TotalVendFailure");
                tsv.session.vendErrorMsg2 = translate.translate("Vending", "YouWereNotCharged");
                $location.path("/Vend_Error");
                break;
            default:
                console.log("Got event vendResponse: "+processStatus);
                break;
        }

        tsv.emptyCart();
    };

    tsv.isFullSuccessVendResult = function (){
        tsv.session.vendSettleTotal =  tsv.cache.shoppingCart.summary.netTotalPrice;
        var itemsVendFail = tsv.cache.shoppingCart.summary.vendFailCount;
        var itemsVendSuccess = tsv.cache.shoppingCart.summary.vendItemCount-itemsVendFail;

        if(itemsVendFail > 0){
            console.log("is it a fullVendSuccess?(false)!success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
            return false;
        }
        tsv.debug("is it a fullVendSuccess?(true)success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
        return true;
    };

    tsv.checkBalance = function (){
        tsv.debug("checkBalance()!!!!!");
        var total = tsv.cache.shoppingCart.summary.TotalPrice;

        if((tsv.session.creditBalance * 100) >= (total * 100) && tsv.cache.shoppingCart.detail.length > 0){
            tsv.disablePaymentDevice();
            if(!tsv.session.bVendingInProcess){
                tsv.debug("Inserted Enough Cash should vend...!!!!!");
                tsv.session.cashMsg = "Vending...";
                tsv.setVendingInProcessFlag();
                tsv.debug("tsv.session.bVendingInProcess: "+tsv.session.bVendingInProcess);
                tsv.startVend();
            }
        }
    };

    tsv.autoCheckout = function() {
        var total = tsv.cache.shoppingCart.summary.TotalPrice;
        var creditBalance = tsv.session.creditBalance;
        var itemsInCart = tsv.cache.shoppingCart.detail.length;
        tsv.debug("autoCheckout() totalPrice = " + total + " credit = " + creditBalance + " items = " + itemsInCart);

        if (creditBalance >= total && itemsInCart > 0) {
            tsv.debug("disabling payment device");
            tsv.disablePaymentDevice();
            tsv.debug("check vend in process?");
            if (!tsv.session.bVendingInProcess) {
                tsv.debug("Calling gotoPayment on rootScope");
                $rootScope.gotoPayment();
            }
        } else {
            tsv.debug("Insufficient funds to autoCheckout");
        }
    }

    tsv.cardTransaction = function(level) {
        switch(level){
            case "CARD_INSERTED":
                tsv.session.cardMsg = translate.translate("Card_Vending", "ProcessingMessage");
                break;
            case "CARD_PROCESSING":
                tsv.session.cardMsg = translate.translate("Card_Vending", "ProcessingMessage");
                break;
            case "CARD_APPROVED":
                tsv.disablePaymentDevice();
                break;
            case "CARD_INVALID_READ":
                tsv.session.cardMsg = translate.translate("Card_Vending", "CardInvalidMessage");
                break;
            case "CARD_DECLINED":
                tsv.session.cardMsg = translate.translate("Card_Vending", "CardDeclinedMessage");
                break;
            case "CARD_CONNECTION_FAILURE":
                tsv.session.cardMsg = translate.translate("Card_Vending", "CardConnectionErrorMessage");
                break;
            case "CARD_UNKNOWN_ERROR":
                tsv.session.cardMsg = translate.translate("Card_Vending", "CardUnknownErrorMessage");
                break;
            default:
                tsv.session.cardMsg = translate.translate("Card_Vending", "CardUnknownErrorMessage");
                break;
        }
    };

    tsv.removeKeyboard = function (){
        console.log("removeKeyboard()!");
        angular.forEach(angular.element(document).find('input'), function(value) {
            var inputChild = angular.element(value);
            if(angular.equals('true', inputChild.attr('VKI_attached'))) {
                inputChild.triggerHandler('close');
            }
        });
    };

    tsv.loadingSpinner = function (){
        console.log("loadingSpinner()");

        var spinnerColor = tsv.customSetting('spinnerColor', '255,255,255');

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

    tsv.configCategories = function($rootScope){
        console.log("Hi Ping configCategories!");
        $rootScope.categories = tsv.fetchProductCategoriesByParentCategoryID(0);
    };

    tsv.onGeneralTimeout = function ($location, $rootScope){
        console.log("gotoDefaultIdlePage()");
        tsv.debug("gotoDefaultIdlePage()");

        if($rootScope.bDualLanguage){
            var dfltLang = tsv.cache.custommachinesettings.languageDefaulted || "En";

            $('.showflag').removeClass('showflag').addClass('hideflag');
            document.getElementById(dfltLang).className = "showflag";

            $rootScope.selectedLanguage = dfltLang;
            translate.selectLanguage(dfltLang);
        }

        tsv.debug("$location.path(): "+$location.path());
        switch($location.path()){
            case "/view0":
                break;
            case "/view1":
                tsv.emptyCart();
                tsv.gotoDefaultIdlePage($location, $rootScope);
                return;
            case "/Category_Search":
                tsv.gotoDefaultIdlePage($location, $rootScope);
                return;
            case "/Product_Search":
                tsv.gotoDefaultIdlePage($location, $rootScope);
                return;
            case "/Make_Donation":
                //tsv.emptyCart();
                break;
            case "/THANKYOU_MSG":
                break;
            case "/Vend_Error":
                break;
            case "/Cash_Vending":
                tsv.debug("On cash page idle timeout disabled...Running the paymentTimer...");
                console.log("On cash page idle timeout disabled...Running the paymentTimer...");
                tsv.emptyCart();
                break;
            case "/Card_Vending":
                tsv.debug("On card page idle timeout disabled...Running the paymentTimer...");
                console.log("On card page idle timeout disabled...Running the paymentTimer...");
                tsv.emptyCart();
                break;
            case "/Admin_Check_Faults":
                if(!tsv.session.bRunningClearFaults){
                    tsv.gotoDefaultIdlePage($location, $rootScope);
                    tsv.debug("Idle Timeout from Admin_Check_Faults not running ClearFaults");
                    return;
                }
                break;
            case "/Admin_Auto_Map":
                if(!tsv.session.bRunningAutoMap){
                    tsv.gotoDefaultIdlePage($location, $rootScope);
                    tsv.debug("Idle Timeout from Admin_Auto_Map not running AutoMap");
                    return;
                }
                break;
            case "/Page_Idle":
                return;
            default:
                tsv.debug("Idle Timeout from "+$location.path());
                tsv.emptyCart();
                tsv.gotoDefaultIdlePage($location, $rootScope);
                return;
        }

        tsv.startGeneralIdleTimer($location, $rootScope);//Ping added on 1016/2015
    };

    tsv.startGeneralIdleTimer = function($location, $rootScope) {
        tsv.killGeneralIdleTimer();

        tsv.session.generalIdleTimer = $timeout(function(){
            console.log("Hi Ping generalIdleTimer timeout...");
            tsv.debug("onGeneralIdleTimeout() @" + tsv.customSetting('generalPageTimeout', "default"));
            tsv.onGeneralTimeout($location, $rootScope);
        }, tsv.customSetting('generalPageTimeout', '120000'));
    };

    tsv.customSetting = function (name, dflt) {
        var settings = tsv.cache.custommachinesettings;

        if (typeof settings === 'undefined' || !settings.hasOwnProperty(name)) {
            return dflt;
        }

        return settings[name];
    };

    var stringToBoolean = function (string){
        switch(string.toLowerCase().trim()){
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(string);
        }
    }

    tsv.bCustomSetting = function(name, dflt) {
        return stringToBoolean(tsv.customSetting(name, dflt));
    };

    tsv.machineSetting = function (name, dflt) {
        var settings = tsv.cache.machineSettings;
        if (typeof settings === 'undefined' || !settings.hasOwnProperty(name)) {
            return dflt;
        }
        return settings[name];
    };

    tsv.bMachineSetting = function (name, dflt) {
        return stringToBoolean(tsv.machineSetting(name, dflt));
    };

    tsv.resetGeneralIdleTimer = function ($location, $rootScope){
        tsv.startGeneralIdleTimer($location, $rootScope);
    };

    tsv.isCartEmpty = function () {
        if (!tsv.cache.shoppingCart) {
            tsv.cache.shoppingCart = tsv.fetchShoppingCart2();
        }
        if (!tsv.cache.shoppingCart || !tsv.cache.shoppingCart.detail) {
            return true;
        }
        return tsv.cache.shoppingCart.detail.length == 0;
    };

    tsv.killGeneralIdleTimer = function() {
        var promise = tsv.session.generalIdleTimer;
        if (promise == null) return;
        tsv.session.generalIdleTimer = null;
        $timeout.cancel(promise);
    };

    tsv.gotoDefaultIdlePage = function ($location, $rootScope){
        tsv.resetSelectedItem($location);
        if(typeof $.fancybox !== "undefined"){
            $.fancybox.close();
        }

        if (tsv.checkActivation().resultCode !== "SUCCESS") {
            $location.path("/Activate");
            return;
        }

        if (tsv.customSetting('txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle") {
            $location.path("/Page_Idle");
            return;
        }else{
            tsv.idleClicked($location, $rootScope);
        }
    };

    tsv.idleClicked = function($location, $rootScope){
        switch(tsv.cache.custommachinesettings.txtSearchScene.toLowerCase()){
            case "make_donation":
                $location.path("/Make_Donation");
                break;
            case "coil_keypad":
                $location.path("/view1");
                break;
            case "category_search":
                tsv.configCategories($rootScope);
                $location.path("/Category_Search");
                break;
            case "product_search":
                $location.path("/Product_Search");
                break;
            default:
                $location.path("/view1");
                break;
        }
    };

    tsv.resetSelectedItem = function (){
        //console.log("resetSelectedItem");
        tsv.debug("resetSelectedItem()!");
        tsv.session.bRunningClearFaults = false;
        tsv.session.bRunningAutoMap= false;
        tsv.session.cardMsg = translate.translate("Card_Vending", "InstructionMessage");
        tsv.session.cashMsg = translate.translate("Cash_Vending", "HintMessageInsertCash");
        tsv.session.vendErrorMsg1 = "";
        tsv.session.vendErrorMsg2 = "";
        tsv.session.vendSettleTotal = 0;
        tsv.session.bVendedOldCredit = false;

        if(tsv.session.currentView == "Admin_Settings"){
            tsv.removeKeyboard();
        }
    };


    var dispatch = function (e) {
        var eventName = e.shift();
        tsv.debug("dispatch EventName: "+eventName);
        var chain = tsv.eventSubscriptions[eventName];
        var dirtyScopes = {};
        var rootScope = angular.element(document).scope();

        // invoke all event subscribers
        if (!(chain === undefined)) {
            for (var i = 0; i < chain.length; i++) {
                var pair = chain[i];

                try {
                    if (pair[0].constructor.name === "Scope") {
                        dirtyScopes[pair[0].$id] = pair[0];
                    } else {
                        dirtyScopes[rootScope.$id] = rootScope;
                    }
                } catch (err) {
                    console.log("Failed adding to dirty scope " + err.message);
                }

                try {
                    pair[1].apply(pair[0], e);
                } catch (err) {
                    console.log("Failed invoking " + eventName + " handler: " + err);
                }
            }
        }

        var ds = [];
        $.each(dirtyScopes, function(key, value) {
            ds.push(value);
        });
        return ds;
    };

    var refreshNgViews = function (dirtyScopes) {
        for (var i = 0; i < dirtyScopes.length; i++) {
            var $scope = dirtyScopes[i];
            try {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            } catch (err) {
                console.log("Failed to refresh ng view " + err.message);
                tsv.debug("Failed to refresh ng view " + err.message);

            }
        }
    };

    var setFailing = function() {
        tsv.failing = true;
    };

    var dispatchAll = function(eventList) {
        if (undefined != eventList) {

            if (eventList[0] == 'noEvent') {
                if (tsv.failing) {
                    eventList = [['noEvent']];
                    tsv.failing = false;
                } else {
                    eventList = [];
                }
            }

            // dispatch all events received
            for (var ijk = 0; ijk < eventList.length; ijk++) {
                //tsv.debug("Debug eventList ijk0: "+ijk);
                try{
                    var tsvEvent = eventList[ijk];

                    tsv.debug("TsvEvent: [" + tsvEvent.join(",") + "]");
                    console.log("TsvEvent: [" + tsvEvent.join(",") + "]");
                    var dirtyScopes = dispatch(tsvEvent);
                    if (dirtyScopes.length != 0) {
                        refreshNgViews(dirtyScopes);
                    }
                }
                catch (err) {
                    tsv.debug("Failed " + err.message);
                }
            }

        }
    };

    // set up event poller every 300 msec
    setInterval(function () {

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

    }, 150);

    console.log("Completed initialization of TSV service.")
//    return tsv;

//}]);
