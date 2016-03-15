'use strict';



function beep() {
}

angular.module('myApp.Confirm_Donation', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/Confirm_Donation', {
    templateUrl: 'Confirm_Donation/Confirm_Donation.html',
    controller: 'Confirm_DonationCtrl'
    });
}])

.controller('Confirm_DonationCtrl', ['$scope', '$rootScope', '$timeout', '$location','TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            TSVService.session.currentView = "Confirm_Donation";
            $rootScope.bShowLanguage = $rootScope.bShowLanguageFlag;
            $rootScope.bShowCredit = true;

            TSVService.disablePaymentDevice();
            TSVService.clearVendingInProcessFlag();
            $rootScope.updateCredit();

            TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
            $scope.bShowViewCart = (TSVService.cache.shoppingCart.summary.vendItemCount+TSVService.cache.shoppingCart.summary.dropshipItemCount) > 0;

            TSVService.subscribe("notifyTSVReady", function() {
                console.log("Got event notifyTSVReady");
            }, "app.confirmDonation");

            $scope.translate = function(name){
                return translate.translate("Confirm_Donation", name);
            };

            $scope.cancel = function() {
                console.log("No!!!!!!!");
                TSVService.emptyCart();
                $location.path("/Make_Donation");
            };

            $scope.ok = function() {
                console.log("Yes!!!!!!!");
                $location.path("/view2");
            };

            $scope.resetInstruction = function() {
                $scope.instructionMessage = "ConfirmDonation";
            };

            $scope.resetInstruction();
    }]);