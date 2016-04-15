'use strict';

function beep() {
}

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
    });
}])

.controller('View1Ctrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            if(('singleProductDonation' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.singleProductDonation != "")){
                $location.path("/Make_Donation");
            }else{
                if(TsvService.customSetting('txtIdleScene', 'coil_keypad').toLowerCase() !== "coil_keypad"
                    || !TsvService.isCartEmpty()) {
                    console.log("Hi Ping Debug TsvService.session.generalIdleTimer is null and restart it");
                    TsvService.startGeneralIdleTimer($location, $rootScope);
                }
            }

            var PVR_UNAVAILABLE = 0;
            var PVR_AVAILABLE = 1;
            var PVR_OUT_OF_STOCK = 2;
            var PVR_INVALID_PRODUCT = 3;
            var PVR_CART_ITEM_MAX_EXCEEDED = 4;
            var PVR_CART_VALUE_MAX_EXCEEDED = 5;

            TsvService.session.currentView = "View1";
            $rootScope.bShowLanguage = $rootScope.bShowLanguageFlag;
            $rootScope.bShowCredit = true;

            if(TsvService.cache.custommachinesettings.bHasShoppingCart.toString().toLowerCase() === "false"){
                TsvService.emptyCart();
                $rootScope.itemsInCart = 0;
            }

            var creditObj = TsvService.fetchCreditBalance();
            $rootScope.updateCredit();

            TsvService.disablePaymentDevice();
            TsvService.clearVendingInProcessFlag();
            $scope.num = "";
            $scope.maxChars = $rootScope.bDualMachine?3:2;
            //$rootScope.credit = TsvService.session.creditBalance;
            var resetInstructionMsgTimer;
            var bClickedOnce = false;
            $rootScope.defaultStr = $rootScope.bDualMachine?"---":"--";
            TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
            TsvService.session.creditBalance = $rootScope.credit;
            //$rootScope.itemsInCart = TsvService.cache.shoppingCart.detail.qtyInCart;

            console.log("TsvService.cache.shoppingCart: "+TsvService.cache.shoppingCart);
            if(TsvService.cache.shoppingCart != null && TsvService.cache.shoppingCart!=undefined){
                console.log("TsvService.cache.shoppingCart.summary: "+TsvService.cache.shoppingCart.summary);
                $scope.bShowViewCart = (TsvService.cache.shoppingCart.summary.vendItemCount+TsvService.cache.shoppingCart.summary.dropshipItemCount) > 0;
            }

            TsvService.subscribe("notifyTSVReady", function() {
                console.log("Got event notifyTSVReady");
            }, "app.view1");

            $scope.translate = function(name){
                return translate.translate("view1", name);
            };

            $scope.clear = function() {
                $scope.resetInstruction();
                $scope.num = "";
            };

            $scope.viewCart = function() {
                $rootScope.bShowLanguage = false;
                $location.path("/Shopping_Cart");
            };

            $scope.resetInstruction = function() {
                $scope.instructionMessage = "MakeASelection";
            };

            $scope.enter = function(){
                TsvService.debug("Enter Button Clicked!");
                $timeout.cancel(resetInstructionMsgTimer);
                if($scope.num == "" && TsvService.cache.shoppingCart.detail.length >=1){
                    $location.path("/view2");
                    return;
                }
                $rootScope.pvr = TsvService.addToCartByCoil($scope.num);
                $scope.num = "";

                console.log("addToCartByCoil.result: "+$rootScope.pvr.result);
                switch ($rootScope.pvr.result) {
                    case PVR_AVAILABLE:
                        TsvService.debug("Enter Button Clicked! Before go to view2");
                        $location.path("/view2");
                        TsvService.debug("Enter Button Clicked! After go to view2");
                        return;
                    case PVR_UNAVAILABLE:
                        $scope.instructionMessage = "Unavailable";
                        break;
                    case PVR_OUT_OF_STOCK:
                        $scope.instructionMessage = "OutOfStock";
                        break;
                    case PVR_INVALID_PRODUCT:
                        $scope.instructionMessage = "InvalidProduct";
                        break;
                    case PVR_CART_ITEM_MAX_EXCEEDED:
                        console.log("Bug? Can't exceed 1 item cart. Resetting");
                        $scope.instructionMessage = "MaxItemsExceeded";
                        TsvService.emptyCart();
                        $rootScope.itemsInCart = 0;
                        TsvService.fetchShoppingCart2();
                        break;
                    case PVR_CART_VALUE_MAX_EXCEEDED:
                        $scope.instructionMessage = "MaxValueExceeded";
                        break;
                    default:
                        $scope.instructionMessage = "Unavailable";
                        TsvService.emptyCart();
                        $rootScope.itemsInCart = 0;
                        break;
                }

                //timeout display of prompt
                resetInstructionMsgTimer = $timeout(function(){
                    $scope.resetInstruction();
                }, 3000);
            };

            $scope.press = function(digit) {
                $scope.resetInstruction();
                if ($scope.num.length < $scope.maxChars) {
                    $scope.num += digit;
                } else {
                    beep();
                    $scope.num = "";
                    $scope.num += digit;
                }
                $scope.num = parseInt($scope.num).toString();
            };

            $scope.prompt = function() {
                if ($scope.num.length != 0) {
                    return $scope.num;
                }
                return $rootScope.defaultStr;
            };

            $scope.admin = function(){
                if(bClickedOnce){
                    bClickedOnce = false;
                    $timeout.cancel(resetInstructionMsgTimer);
                    $rootScope.bShowLanguage = false;
                    $rootScope.bShowCredit = false;
                    $location.path("/Admin_Login");
                }else{
                    bClickedOnce = true;
                }
            };

            function couponHandler (coupon) {
                TsvService.debug("couponHandler called");
                if (!coupon.isValid || coupon.isDiscountInPercentage) {
                    TsvService.debug("Clearing invalid or %age discount");
                    TsvService.session.discount = 0;
                } else {
                    TsvService.debug("Setting discount");
                    TsvService.session.discount = coupon.discount;
                }
                $rootScope.updateCredit();
                TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
                TsvService.debug("Updated credit to include discount " + $rootScope.credit);

                TsvService.autoCheckout();
            };
            TsvService.subscribe("notifyCouponEvent", couponHandler, "app.view1");

            $scope.isLoggedIn = function () {
                return TsvService.session.discount != 0
            };
            $scope.logout = function () {
                TsvService.logoutShopper();
            };

            var identityHandler = function(event, id) {
                TsvService.debug("identityHandler called");
                if (event === "LoggedIn") {
                    // prevent unwanted scans during remainder of flow
                    TsvService.disableLoginDevices();
                } else {

                    if (!TsvService.session.bVendingInProcess) {
                        TsvService.debug("!!!Going to default idle page because logged out");
                        TsvService.emptyCart();
                        TsvService.gotoDefaultIdlePage($location);
                    } else {
                        TsvService.debug("Ignoring log-out, still vending!");
                    }
                }
            };
            TsvService.subscribe("identityEvent", identityHandler, "app.view1");

            var creditBalanceHandler = function(ins, balance){
                TsvService.debug("rootScope Got event cash creditBalanceChanged: "+ins+" creditBalance: "+balance);
                $.fancybox.close();
                TsvService.session.creditBalance = balance/100.00;
                $rootScope.updateCredit();

                if(!TsvService.session.bVendedOldCredit){
                    TsvService.checkBalance();

                    if(balance != 0){
                        $location.path("/Cash_Vending");
                    }
                }
            };

            TsvService.subscribe("creditBalanceChanged", creditBalanceHandler, "app.view1");

            function cashlessBeginSession(fundsAvailable) {
                var where = $location.path();
                console.log("cashlessBeginSession " + fundsAvailable + " view: " + where);
                $rootScope.fundsAvailable = ((1.0) * fundsAvailable) / 100.0 + TsvService.session.discount;
                $rootScope.bCashless = true;

                if (   where === "/view2"
                    || where === "/Shopping_Cart"
                    || where === "/Cash_Vending"
                    || where === "/Card_Vending"
                    || where === "/Cash_Card"
                ) {
                    if ($rootScope.fundsAvailable >= TsvService.cache.shoppingCart.summary.TotalPrice) {
                        console.log("Cashless swipe in product detail/cart... vend now");
                        $location.path("/Cashless_Vending");
                    }else {
                        $rootScope.bInsufficientFunds = true;
                        $location.path("/view2");
                    }
                }
            }

            function cashlessEndSession () {
                console.log("cashlessEndSession");
                $rootScope.fundsAvailable = 0;
                $rootScope.bCashless = false;
            }

            TsvService.subscribe("cashlessBeginSession", cashlessBeginSession, "app.view1");

            TsvService.subscribe("cashlessEndSession", cashlessEndSession, "app.view1");

            $scope.resetInstruction();

            TsvService.enableLoginDevices();
    }]);