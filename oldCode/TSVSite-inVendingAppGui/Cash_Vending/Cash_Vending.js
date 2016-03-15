'use strict';

angular.module('myApp.Cash_Vending', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Cash_Vending', {
            templateUrl: 'Cash_Vending/Cash_Vending.html',
            controller: 'Cash_VendingCtrl'
        });
    }])

    .controller('Cash_VendingCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
	
            $rootScope.bDisplayCgryNavigation = false;

            $scope.translate = function(name){
                return translate.translate("Cash_Vending", name);
            };

            $rootScope.updateCredit();
            TSVService.session.currentView = "Cash_Vending";
            TSVService.enablePaymentDevice("PAYMENT_TYPE_CASH");

            $scope.summary = TSVService.cache.shoppingCart.summary;
            $scope.insertedAmount = TSVService.session.creditBalance;
                $scope.summary = TSVService.cache.shoppingCart.summary;
                $scope.insertedAmount = TSVService.session.creditBalance;
                console.log($scope.translate('HintMessageInsertCash'));
                $scope.cart = TSVService.cache.shoppingCart.detail;

                $scope.showCancelBtnCash = true;
                $scope.hintMsg = $scope.translate('HintMessageInsertCash');

                resetPaymentTimer();

                TSVService.session.bVendedOldCredit = checkBalance();

                if(TSVService.session.bVendingInProcess){
                    TSVService.debug("TSVService.session.bVendingInProcess: "+TSVService.session.bVendingInProcess);
                    $scope.hintMsg = $scope.translate('HintMessageVending');
                    $scope.showCancelBtnCash = false;
                    TSVService.loadingSpinner();
                    stopPaymentTimer();
                }

                $scope.cancel = function(){
                    TSVService.emptyCart();
                    stopPaymentTimer();
                    TSVService.gotoDefaultIdlePage($location, $rootScope);
                };

                function startPaymentTimer(){
                    //console.log("Hi Ping Debug startPaymentTimer");
                    TSVService.session.paymentTimer = $timeout(function(){
                        console.log("Hi Ping Debug paymentTimer timeout");
                        TSVService.emptyCart();
                        TSVService.gotoDefaultIdlePage($location, $rootScope);
                        stopPaymentTimer();
                    }, TSVService.cache.custommachinesettings.paymentPageTimeout)
                }

                function resetPaymentTimer(){
                    //console.log("Hi Ping Debug reset the paymentTimer");
                    stopPaymentTimer();
                    startPaymentTimer();
                }

                function stopPaymentTimer(){
                    //console.log("Debug stop the paymentTimer");
                    $timeout.cancel(TSVService.session.paymentTimer);
                }

                var creditBalanceHandler = function(ins, balance){
                    TSVService.debug("PingPing Cash page Got event Cash_Vending creditBalanceChanged: "+ins+" balance: "+balance);
                    TSVService.session.creditBalance = balance/100.00;
                    $scope.insertedAmount = TSVService.session.creditBalance;

                    if(TSVService.session.bVendingInProcess){
                        $scope.hintMsg = "Vending...";
                        $scope.showCancelBtnCash = false;
                        TSVService.loadingSpinner();
                    }
                    resetPaymentTimer();
                };

                function checkBalance(){
                    TSVService.debug("Hi Ping Debug cash page checkBalance()");
                    var total = TSVService.cache.shoppingCart.summary.TotalPrice;

                    if(TSVService.session.creditBalance >= total && TSVService.cache.shoppingCart.detail.length > 0) {
                        TSVService.disablePaymentDevice();
                        if(!TSVService.session.bVendingInProcess){
                            $scope.hintMsg = $scope.translate('HintMessageVending');
                            $scope.showCancelBtnCash = false;
                            TSVService.loadingSpinner();
                            TSVService.startVend();
                            return true;
                        }
                        return false;
                    }
                    return false;
                }

                TSVService.subscribe("creditBalanceChanged", creditBalanceHandler, "app.cashVending");

                $scope.$on('$destroy', function() {
                    TSVService.unsubscribe("creditBalanceChanged", "app.cashVending");
                });

                var cardTransactionHandler = function(level) {
                    console.log("Got event cardTransactionResponse()default: "+level);
                    if(!TSVService.session.bVendingInProcess) {
                        if($location.path() != "/Card_Vending"){
                            $location.path("/Card_Vending");
                        }

                        TSVService.cardTransaction(level);
                    }
                };

                TSVService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.cashVending");

                $scope.$on('$destroy', function() {
                    TSVService.unsubscribe("cardTransactionResponse", "app.cashVending")
                });

                var vendResponseHandler = function(processStatus){
                    TSVService.debug("GUI Debug vendResponseHandler()!!!!!!!!!!!!!!!");
                    TSVService.vendResponse(processStatus, $location);
                    stopPaymentTimer();
                };

                TSVService.subscribe("vendResponse", vendResponseHandler, "app.cashVending");

                $scope.$on('$destroy', function() {
                    TSVService.unsubscribe("vendResponse", "app.cashVending")
                });
    }]);