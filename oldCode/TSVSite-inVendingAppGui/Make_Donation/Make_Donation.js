'use strict';



function beep() {
}

//angular.module('myApp.Make_Donation', ['ngRoute', 'ui.bootstrap'])
angular.module('myApp.Make_Donation', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/Make_Donation', {
    templateUrl: 'Make_Donation/Make_Donation.html',
    controller: 'Make_DonationCtrl'
    });
}])

.controller('Make_DonationCtrl', ['$scope', '$rootScope', '$timeout', '$location','TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            TsvService.session.currentView = "Make_Donation";
            $rootScope.bShowLanguage = $rootScope.bShowLanguageFlag;
            $rootScope.bShowCredit = true;
            $scope.minimumDonationAmount = 5;
            $scope.minimumDonationAmount2 = "";

            if(('minimumDonationAmount' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.minimumDonationAmount != "")){
                $scope.minimumDonationAmount = TsvService.cache.custommachinesettings.minimumDonationAmount;
            }

            if(TsvService.cache.custommachinesettings.bHasShoppingCart.toString().toLowerCase() === "false"){
                TsvService.emptyCart();
                $rootScope.itemsInCart = 0;
            }

            TsvService.disablePaymentDevice();
            TsvService.clearVendingInProcessFlag();
            $scope.num = "";
            $scope.dollar = "$";
            $scope.maxChars = 5;
            $rootScope.updateCredit();
            var resetInstructionMsgTimer;
            var bClickedOnce = false;
            $rootScope.defaultStr = $rootScope.bDualMachine?"---":"--";
            TsvService.cache.shoppingCart = TsvService.fetchShoppingCart2();
            $scope.bShowViewCart = (TsvService.cache.shoppingCart.summary.vendItemCount+TsvService.cache.shoppingCart.summary.dropshipItemCount) > 0;

            TsvService.subscribe("notifyTSVReady", function() {
                console.log("Got event notifyTSVReady");
            }, "app.makeDonation");

            $scope.translate = function(name){
                return translate.translate("Make_Donation", name);
            };

            $scope.clear = function() {
                $scope.resetInstruction();
                $scope.num = "";
                $scope.dollar = "$";
            };

            $scope.viewCart = function() {
                $rootScope.bShowLanguage = false;
                $location.path("/Shopping_Cart");
            };

            $scope.resetInstruction = function() {
                $scope.instructionMessage = "EnterDonationAmount";
            };

            $scope.enter = function(){
                TsvService.debug("Enter Button Clicked!");
                if(parseInt($scope.num) < $scope.minimumDonationAmount){
                    $scope.instructionMessage = "MinimumDonationAmount";
                    $scope.num = "";
                    $scope.dollar = "$";
                    $scope.minimumDonationAmount2 = $scope.minimumDonationAmount;

                    //timeout display of prompt
                    resetInstructionMsgTimer = $timeout(function(){
                        $scope.minimumDonationAmount2 = "";
                        $scope.resetInstruction();
                    }, 3000);
                }else{
                    console.log("$scope.num: "+$scope.num);
                    $rootScope.pvr = TsvService.addProductAndPriceByProductId(TsvService.cache.custommachinesettings.singleProductDonation, $scope.num);
                    $scope.num = "";

                    $scope.minimumDonationAmount2 = "";
                    console.log("addToCartByCoil.result: "+$rootScope.pvr.result);
                    switch ($rootScope.pvr.result) {
                        case 1:
                            $rootScope.donation = $scope.dollar;
                            $location.path("/Confirm_Donation");
                            console.log("pvr.productID: "+$rootScope.pvr.productID);
                            console.log("pvr.price: "+$rootScope.pvr.price);
                            break;
                        default:
                            break;
                    }
                    $scope.dollar = "$";

                }
            };

            $scope.press = function(digit) {
                console.log("$scope.dollar "+$scope.dollar);
                $scope.resetInstruction();
                if ($scope.dollar.length < $scope.maxChars) {
                    $scope.dollar += digit;
                    $scope.num += digit;
                } else {
                    beep();
                    $scope.dollar = "$";
                    $scope.num = "";
                    $scope.dollar += digit;
                    $scope.num += digit;
                }
                console.log("$scope.dollar "+$scope.dollar);
            };

            $scope.prompt = function() {
                if ($scope.dollar.length > 1) {
                    return $scope.dollar;
                }
                return $scope.dollar;//$rootScope.defaultStr;
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

            TsvService.startGeneralIdleTimer($location, $rootScope);

            /*(function ($) {
                $(document).ready(function () {
                    $(document).bind('click mousemove', function() {
                        //console.log("reset general idle timer");
                        TsvService.resetGeneralIdleTimer($location, $rootScope);
                    });
                });
            }) (jQuery);*/

            $scope.resetInstruction();
    }]);