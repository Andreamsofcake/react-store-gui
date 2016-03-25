'use strict';

angular.module('myApp.Cash_Vending', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Cash_Vending', {
            templateUrl: 'Cash_Vending/Cash_Vending.html',
            controller: 'Cash_VendingCtrl'
        });
    }])

    .controller('Cash_VendingCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {

            $rootScope.bDisplayCgryNavigation = false;

            $scope.translate = function(name){
                return translate.translate("Cash_Vending", name);
            };

            $rootScope.updateCredit();
            TsvService.session.currentView = "Cash_Vending";
            TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");

            $scope.summary = TsvService.cache.shoppingCart.summary;
            $scope.insertedAmount = TsvService.session.creditBalance;
                $scope.summary = TsvService.cache.shoppingCart.summary;
                $scope.insertedAmount = TsvService.session.creditBalance;
                console.log($scope.translate('HintMessageInsertCash'));
                $scope.cart = TsvService.cache.shoppingCart.detail;

                $scope.showCancelBtnCash = true;
                $scope.hintMsg = $scope.translate('HintMessageInsertCash');

                resetPaymentTimer();


                RootscopeActions.setSession(‘bVendedOldCredit’, this.checkBalance())

                if(TsvService.session.bVendingInProcess){
                    TsvService.debug("TsvService.session.bVendingInProcess: "+TsvService.session.bVendingInProcess);
                    $scope.hintMsg = $scope.translate('HintMessageVending');
                    $scope.showCancelBtnCash = false;
                    TsvService.loadingSpinner();
                    stopPaymentTimer();
                }

                $scope.cancel = function(){
                    TsvService.emptyCart();
                    stopPaymentTimer();
                    TsvService.gotoDefaultIdlePage($location, $rootScope);
                };

                function startPaymentTimer(){
                    //console.log("Hi Ping Debug startPaymentTimer");
                    TsvService.session.paymentTimer = $timeout(function(){
                        console.log("Hi Ping Debug paymentTimer timeout");
                        TsvService.emptyCart();
                        TsvService.gotoDefaultIdlePage($location, $rootScope);
                        stopPaymentTimer();
                    }, TsvService.cache.custommachinesettings.paymentPageTimeout)
                }

                function resetPaymentTimer(){
                    //console.log("Hi Ping Debug reset the paymentTimer");
                    stopPaymentTimer();
                    startPaymentTimer();
                }

                function stopPaymentTimer(){
                    //console.log("Debug stop the paymentTimer");
                    $timeout.cancel(TsvService.session.paymentTimer);
                }

                var creditBalanceHandler = function(ins, balance){
                    TsvService.debug("PingPing Cash page Got event Cash_Vending creditBalanceChanged: "+ins+" balance: "+balance);
                    TsvService.session.creditBalance = balance/100.00;
                    $scope.insertedAmount = TsvService.session.creditBalance;

                    if(TsvService.session.bVendingInProcess){
                        $scope.hintMsg = "Vending...";
                        $scope.showCancelBtnCash = false;
                        TsvService.loadingSpinner();
                    }
                    resetPaymentTimer();
                };

                function checkBalance(){
                    TsvService.debug("Hi Ping Debug cash page checkBalance()");
                    var total = TsvService.cache.shoppingCart.summary.TotalPrice;

                    if(TsvService.session.creditBalance >= total && TsvService.cache.shoppingCart.detail.length > 0) {
                        TsvService.disablePaymentDevice();
                        if(!TsvService.session.bVendingInProcess){
                            $scope.hintMsg = $scope.translate('HintMessageVending');
                            $scope.showCancelBtnCash = false;
                            TsvService.loadingSpinner();
                            TsvService.startVend();
                            return true;
                        }
                        return false;
                    }
                    return false;
                }

                TsvService.subscribe("creditBalanceChanged", creditBalanceHandler, "app.cashVending");

                $scope.$on('$destroy', function() {
                    TsvService.unsubscribe("creditBalanceChanged", "app.cashVending");
                });

                var cardTransactionHandler = function(level) {
                    console.log("Got event cardTransactionResponse()default: "+level);
                    if(!TsvService.session.bVendingInProcess) {
                        if($location.path() != "/Card_Vending"){
                            $location.path("/Card_Vending");
                        }

                        TsvService.cardTransaction(level);
                    }
                };

                TsvService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.cashVending");

                $scope.$on('$destroy', function() {
                    TsvService.unsubscribe("cardTransactionResponse", "app.cashVending")
                });

                var vendResponseHandler = function(processStatus){
                    TsvService.debug("GUI Debug vendResponseHandler()!!!!!!!!!!!!!!!");
                    TsvService.vendResponse(processStatus, $location);
                    stopPaymentTimer();
                };

                TsvService.subscribe("vendResponse", vendResponseHandler, "app.cashVending");

                $scope.$on('$destroy', function() {
                    TsvService.unsubscribe("vendResponse", "app.cashVending")
                });
    }]);
