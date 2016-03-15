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

.controller('View1Ctrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            if(('singleProductDonation' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.singleProductDonation != "")){
                $location.path("/Make_Donation");
            }else{
                if(TSVService.customSetting('txtIdleScene', 'coil_keypad').toLowerCase() !== "coil_keypad"
                    || !TSVService.isCartEmpty()) {
                    console.log("Hi Ping Debug TSVService.session.generalIdleTimer is null and restart it");
                    TSVService.startGeneralIdleTimer($location, $rootScope);
                }
            }

            var PVR_UNAVAILABLE = 0;
            var PVR_AVAILABLE = 1;
            var PVR_OUT_OF_STOCK = 2;
            var PVR_INVALID_PRODUCT = 3;
            var PVR_CART_ITEM_MAX_EXCEEDED = 4;
            var PVR_CART_VALUE_MAX_EXCEEDED = 5;

            TSVService.session.currentView = "View1";
            $rootScope.bShowLanguage = $rootScope.bShowLanguageFlag;
            $rootScope.bShowCredit = true;

            if(TSVService.cache.custommachinesettings.bHasShoppingCart.toString().toLowerCase() === "false"){
                TSVService.emptyCart();
                $rootScope.itemsInCart = 0;
            }

            var creditObj = TSVService.fetchCreditBalance();
            $rootScope.updateCredit();

            TSVService.disablePaymentDevice();
            TSVService.clearVendingInProcessFlag();
            $scope.num = "";
            $scope.maxChars = $rootScope.bDualMachine?3:2;
            //$rootScope.credit = TSVService.session.creditBalance;
            var resetInstructionMsgTimer;
            var bClickedOnce = false;
            $rootScope.defaultStr = $rootScope.bDualMachine?"---":"--";
            TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
            TSVService.session.creditBalance = $rootScope.credit;
            //$rootScope.itemsInCart = TSVService.cache.shoppingCart.detail.qtyInCart;

            console.log("TSVService.cache.shoppingCart: "+TSVService.cache.shoppingCart);
            if(TSVService.cache.shoppingCart != null && TSVService.cache.shoppingCart!=undefined){
                console.log("TSVService.cache.shoppingCart.summary: "+TSVService.cache.shoppingCart.summary);
                $scope.bShowViewCart = (TSVService.cache.shoppingCart.summary.vendItemCount+TSVService.cache.shoppingCart.summary.dropshipItemCount) > 0;
            }

            TSVService.subscribe("notifyTSVReady", function() {
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
                TSVService.debug("Enter Button Clicked!");
                $timeout.cancel(resetInstructionMsgTimer);
                if($scope.num == "" && TSVService.cache.shoppingCart.detail.length >=1){
                    $location.path("/view2");
                    return;
                }
                $rootScope.pvr = TSVService.addToCartByCoil($scope.num);
                $scope.num = "";

                console.log("addToCartByCoil.result: "+$rootScope.pvr.result);
                switch ($rootScope.pvr.result) {
                    case PVR_AVAILABLE:
                        TSVService.debug("Enter Button Clicked! Before go to view2");
                        $location.path("/view2");
                        TSVService.debug("Enter Button Clicked! After go to view2");
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
                        TSVService.emptyCart();
                        $rootScope.itemsInCart = 0;
                        TSVService.fetchShoppingCart2();
                        break;
                    case PVR_CART_VALUE_MAX_EXCEEDED:
                        $scope.instructionMessage = "MaxValueExceeded";
                        break;
                    default:
                        $scope.instructionMessage = "Unavailable";
                        TSVService.emptyCart();
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
                TSVService.debug("couponHandler called");
                if (!coupon.isValid || coupon.isDiscountInPercentage) {
                    TSVService.debug("Clearing invalid or %age discount");
                    TSVService.session.discount = 0;
                } else {
                    TSVService.debug("Setting discount");
                    TSVService.session.discount = coupon.discount;
                }
                $rootScope.updateCredit();
                TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
                TSVService.debug("Updated credit to include discount " + $rootScope.credit);

                TSVService.autoCheckout();
            };
            TSVService.subscribe("notifyCouponEvent", couponHandler, "app.view1");

            $scope.isLoggedIn = function () {
                return TSVService.session.discount != 0
            };
            $scope.logout = function () {
                TSVService.logoutShopper();
            };

            var identityHandler = function(event, id) {
                TSVService.debug("identityHandler called");
                if (event === "LoggedIn") {
                    // prevent unwanted scans during remainder of flow
                    TSVService.disableLoginDevices();
                } else {

                    if (!TSVService.session.bVendingInProcess) {
                        TSVService.debug("!!!Going to default idle page because logged out");
                        TSVService.emptyCart();
                        TSVService.gotoDefaultIdlePage($location);
                    } else {
                        TSVService.debug("Ignoring log-out, still vending!");
                    }
                }
            };
            TSVService.subscribe("identityEvent", identityHandler, "app.view1");

            var creditBalanceHandler = function(ins, balance){
                TSVService.debug("rootScope Got event cash creditBalanceChanged: "+ins+" creditBalance: "+balance);
                $.fancybox.close();
                TSVService.session.creditBalance = balance/100.00;
                $rootScope.updateCredit();

                if(!TSVService.session.bVendedOldCredit){
                    TSVService.checkBalance();

                    if(balance != 0){
                        $location.path("/Cash_Vending");
                    }
                }
            };

            TSVService.subscribe("creditBalanceChanged", creditBalanceHandler, "app.view1");

            function cashlessBeginSession(fundsAvailable) {
                var where = $location.path();
                console.log("cashlessBeginSession " + fundsAvailable + " view: " + where);
                $rootScope.fundsAvailable = ((1.0) * fundsAvailable) / 100.0 + TSVService.session.discount;
                $rootScope.bCashless = true;

                if (   where === "/view2"
                    || where === "/Shopping_Cart"
                    || where === "/Cash_Vending"
                    || where === "/Card_Vending"
                    || where === "/Cash_Card"
                ) {
                    if ($rootScope.fundsAvailable >= TSVService.cache.shoppingCart.summary.TotalPrice) {
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

            TSVService.subscribe("cashlessBeginSession", cashlessBeginSession, "app.view1");

            TSVService.subscribe("cashlessEndSession", cashlessEndSession, "app.view1");

            $scope.resetInstruction();

            TSVService.enableLoginDevices();
    }]);