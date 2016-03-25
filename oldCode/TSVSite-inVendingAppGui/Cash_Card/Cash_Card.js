'use strict';

angular.module('myApp.Cash_Card', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Cash_Card', {
            templateUrl: 'Cash_Card/Cash_Card.html',
            controller: 'Cash_CardCtrl'
        });
    }])

    .controller('Cash_CardCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            $rootScope.bDisplayCgryNavigation = false;
            $scope.translate = function(name){
                return translate.translate("Cash_Card", name);
            };

            TsvService.session.currentView = "Cash_Card";

            $scope.cancel = function(){
                TsvService.emptyCart();
                TsvService.gotoDefaultIdlePage($location, $rootScope);
            };

            $rootScope.updateCredit();

            $scope.cancel = function(){
                TsvService.emptyCart();
                TsvService.gotoDefaultIdlePage($location);
            };

            $scope.cash = function(){
                //TsvService.disablePaymentDevice();
                TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");
                $location.path("/Cash_Vending");
            };

            $scope.card = function(){
                //TsvService.disablePaymentDevice();
                TsvService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
                $location.path("/Card_Vending");
            };

            var cardTransactionHandler = function(level) {
                console.log("Got event cardTransactionResponse()default: "+level);
                if(!TsvService.session.bVendingInProcess) {
                    if($location.path() != "/Card_Vending"){
                        $location.path("/Card_Vending");
                    }

                    TsvService.cardTransaction(level);
                }
            };

            TsvService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.cashCard");

            $scope.$on('$destroy', function() {
                TsvService.unsubscribe("cardTransactionResponse", "app.cashCard");
            });
    }]);

