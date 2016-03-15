'use strict';

angular.module('myApp.Shopping_Cart', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Shopping_Cart', {
            templateUrl: 'Shopping_Cart/Shopping_Cart.html',
            controller: 'Shopping_CartCtrl'
        });
    }])

    .controller('Shopping_CartCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            $rootScope.bDisplayCgryNavigation = $rootScope.bDisplayCgryNavigation2;

            $scope.translate = function(name){
                return translate.translate("Shopping_Cart", name);
            };

            $rootScope.updateCredit();
            TSVService.session.currentView = "Shopping_Cart";
            $scope.totalPrice = TSVService.cache.shoppingCart.summary.TotalPrice;
            $scope.cart = TSVService.cache.shoppingCart.detail;
            $scope.salesTaxAmount = TSVService.cache.shoppingCart.summary.salesTaxAmount;
            $rootScope.summary = $scope.summary;
            $scope.emptyCart = false;
            $scope.bShowTax = $scope.salesTaxAmount > 0;

            $scope.bShowCgryNav = true;

            if(('bHasCouponCodes' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.bHasCouponCodes != "")){
                if(TSVService.cache.custommachinesettings.bHasCouponCodes.toLowerCase() === "true"){
                    $scope.bShowCouponBtn = true;
                }
            }

            $scope.back = function(){
                  $location.path("/view2");
            };

            $scope.cancel = function(){
                TSVService.emptyCart();
                $rootScope.itemsInCart = 0;
                TSVService.gotoDefaultIdlePage($location, $rootScope);
            };

            $scope.shopmore = function(){
                TSVService.gotoDefaultIdlePage($location, $rootScope);
            };

            $scope.minusQty = function(coil){
                console.log("Minus Qty for Coil: "+coil);
                TSVService.removeFromCartByCoilNo(coil);
                TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
                $scope.cart = TSVService.cache.shoppingCart.detail;
                $scope.totalPrice = TSVService.cache.shoppingCart.summary.TotalPrice;
                $scope.emptyCart =  $scope.cart.length <= 0;
                if($scope.emptyCart){
                    TSVService.gotoDefaultIdlePage($location, $rootScope);
                }
            };

            $scope.addQty = function(coil){
                console.log("Add Qty for Coil: "+coil);
                TSVService.addToCartByCoil(coil);
                TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
                $scope.cart = TSVService.cache.shoppingCart.detail;
                $scope.totalPrice = TSVService.cache.shoppingCart.summary.TotalPrice;
            };

            $scope.removeAllQty = function(coil, qty){
                console.log("removeAll for coil: "+coil);
                console.log("qty: "+qty);

                TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
                $scope.cart = TSVService.cache.shoppingCart.detail;


                while(qty > 0){
                    console.log("Removed!");
                    TSVService.removeFromCartByCoilNo(coil);

                    TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
                    $scope.cart = TSVService.cache.shoppingCart.detail;
                    qty--;
                }
                TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
                $scope.cart = TSVService.cache.shoppingCart.detail;
                $scope.totalPrice = TSVService.cache.shoppingCart.summary.TotalPrice;
                console.log("After remove: "+$scope.cart.length);
                $scope.emptyCart =  $scope.cart.length <= 0;
                if($scope.emptyCart){
                    TSVService.gotoDefaultIdlePage($location, $rootScope);
                }
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

            TSVService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.shoppingCart");

            $scope.$on('$destroy', function() {
                TSVService.unsubscribe("cardTransactionResponse", "app.shoppingCart");
            });
    }]);
