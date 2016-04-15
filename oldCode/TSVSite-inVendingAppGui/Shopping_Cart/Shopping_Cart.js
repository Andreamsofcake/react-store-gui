'use strict';

angular.module('myApp.Shopping_Cart', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Shopping_Cart', {
            templateUrl: 'Shopping_Cart/Shopping_Cart.html',
            controller: 'Shopping_CartCtrl'
        });
    }])

    .controller('Shopping_CartCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            $rootScope.bDisplayCgryNavigation = $rootScope.bDisplayCgryNavigation2;

            $scope.translate = function(name){
                return translate.translate("Shopping_Cart", name);
            };

            $rootScope.updateCredit();
            TsvService.session.currentView = "Shopping_Cart";
            $scope.totalPrice = TsvService.cache.shoppingCart.summary.TotalPrice;
            $scope.cart = TsvService.cache.shoppingCart.detail;
            $scope.salesTaxAmount = TsvService.cache.shoppingCart.summary.salesTaxAmount;
            $rootScope.summary = $scope.summary;
            $scope.emptyCart = false;
            $scope.bShowTax = $scope.salesTaxAmount > 0;

            $scope.bShowCgryNav = true;

            if(('bHasCouponCodes' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.bHasCouponCodes != "")){
                if(TsvService.cache.custommachinesettings.bHasCouponCodes.toLowerCase() === "true"){
                    $scope.bShowCouponBtn = true;
                }
            }

            $scope.back = function(){
                  $location.path("/view2");
            };

            $scope.cancel = function(){
                TsvService.emptyCart();
                $rootScope.itemsInCart = 0;
                TsvService.gotoDefaultIdlePage($location, $rootScope);
            };

            $scope.shopmore = function(){
                TsvService.gotoDefaultIdlePage($location, $rootScope);
            };

            $scope.minusQty = function(coil){
                console.log("Minus Qty for Coil: "+coil);
                TsvService.removeFromCartByCoilNo(coil);
                TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
                $scope.cart = TsvService.cache.shoppingCart.detail;
                $scope.totalPrice = TsvService.cache.shoppingCart.summary.TotalPrice;
                $scope.emptyCart =  $scope.cart.length <= 0;
                if($scope.emptyCart){
                    TsvService.gotoDefaultIdlePage($location, $rootScope);
                }
            };

            $scope.addQty = function(coil){
                console.log("Add Qty for Coil: "+coil);
                TsvService.addToCartByCoil(coil);
                TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
                $scope.cart = TsvService.cache.shoppingCart.detail;
                $scope.totalPrice = TsvService.cache.shoppingCart.summary.TotalPrice;
            };

            $scope.removeAllQty = function(coil, qty){
                console.log("removeAll for coil: "+coil);
                console.log("qty: "+qty);

                TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
                $scope.cart = TsvService.cache.shoppingCart.detail;

                while(qty > 0){
                    console.log("Removed!");
                    TsvService.removeFromCartByCoilNo(coil);

                    TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
                    $scope.cart = TsvService.cache.shoppingCart.detail;
                    qty--;
                }
                TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
                $scope.cart = TsvService.cache.shoppingCart.detail;
                $scope.totalPrice = TsvService.cache.shoppingCart.summary.TotalPrice;
                console.log("After remove: "+$scope.cart.length);
                $scope.emptyCart =  $scope.cart.length <= 0;
                if($scope.emptyCart){
                    TsvService.gotoDefaultIdlePage($location, $rootScope);
                }
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

            TsvService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.shoppingCart");

            $scope.$on('$destroy', function() {
                TsvService.unsubscribe("cardTransactionResponse", "app.shoppingCart");
            });
    }]);
