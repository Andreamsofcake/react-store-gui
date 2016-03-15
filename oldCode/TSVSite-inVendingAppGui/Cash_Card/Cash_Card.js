'use strict';

angular.module('myApp.Cash_Card', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Cash_Card', {
            templateUrl: 'Cash_Card/Cash_Card.html',
            controller: 'Cash_CardCtrl'
        });
    }])

    .controller('Cash_CardCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            $rootScope.bDisplayCgryNavigation = false;
            $scope.translate = function(name){
                return translate.translate("Cash_Card", name);
            };

            TSVService.session.currentView = "Cash_Card";

            $scope.cancel = function(){
                TSVService.emptyCart();
                TSVService.gotoDefaultIdlePage($location, $rootScope);
            };

            $rootScope.updateCredit();

            $scope.cancel = function(){
                TSVService.emptyCart();
                TSVService.gotoDefaultIdlePage($location);
            };

            $scope.cash = function(){
                //TSVService.disablePaymentDevice();
                TSVService.enablePaymentDevice("PAYMENT_TYPE_CASH");
                $location.path("/Cash_Vending");
            };

            $scope.card = function(){
                //TSVService.disablePaymentDevice();
                TSVService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
                $location.path("/Card_Vending");
            };

            var cardTransactionHandler = function(level) {
                console.log("Got event cardTransactionResponse()default: "+level);
                if(!TSVService.session.bVendingInProcess) {
                    if($location.path() != "/Card_Vending"){
                        $location.path("/Card_Vending");
                    }

                    TSVService.cardTransaction(level);
                }
            };

            TSVService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.cashCard");

            $scope.$on('$destroy', function() {
                TSVService.unsubscribe("cardTransactionResponse", "app.cashCard");
            });
    }]);

