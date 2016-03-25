'use strict';

angular.module('myApp.Cashless_Vending', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Cashless_Vending', {
            templateUrl: 'Cashless_Vending/Cashless_Vending.html',
            controller: 'Cashless_VendingCtrl'
        });
    }])

    .controller('Cashless_VendingCtrl', ['$scope', '$rootScope','$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
        TsvService.debug("Cashless vending...");

        $scope.translate = function(name){
            return translate.translate("Cashless_Vending", name);
        };

        $rootScope.updateCredit();
        TsvService.session.currentView = "Cashless_Vending";

        $scope.item = TsvService.cache.shoppingCart.detail[0];
        $scope.summary = TsvService.cache.shoppingCart.summary;
        $scope.cart = TsvService.cache.shoppingCart.detail;

        TsvService.killGeneralIdleTimer();
        $scope.cardTransactionResponse = TsvService.session.cardMsg;
        $scope.showCancelBtn = false;
        TsvService.loadingSpinner();
        TsvService.startVend();

        var vendResponseHandler = function(processStatus){
            TsvService.vendResponse(processStatus, $location);
        };

        TsvService.subscribe("vendResponse", vendResponseHandler, "app.cashlessVending");

        $scope.$on('$destroy', function() {
            TsvService.unsubscribe("vendResponse", "app.cashlessVending")
        });
    }]);