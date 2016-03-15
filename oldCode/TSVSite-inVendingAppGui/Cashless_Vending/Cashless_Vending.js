'use strict';

angular.module('myApp.Cashless_Vending', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Cashless_Vending', {
            templateUrl: 'Cashless_Vending/Cashless_Vending.html',
            controller: 'Cashless_VendingCtrl'
        });
    }])

    .controller('Cashless_VendingCtrl', ['$scope', '$rootScope','$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
        TSVService.debug("Cashless vending...");

        $scope.translate = function(name){
            return translate.translate("Cashless_Vending", name);
        };

        $rootScope.updateCredit();
        TSVService.session.currentView = "Cashless_Vending";

        $scope.item = TSVService.cache.shoppingCart.detail[0];
        $scope.summary = TSVService.cache.shoppingCart.summary;
        $scope.cart = TSVService.cache.shoppingCart.detail;

        TSVService.killGeneralIdleTimer();
        $scope.cardTransactionResponse = TSVService.session.cardMsg;
        $scope.showCancelBtn = false;
        TSVService.loadingSpinner();
        TSVService.startVend();

        var vendResponseHandler = function(processStatus){
            TSVService.vendResponse(processStatus, $location);
        };

        TSVService.subscribe("vendResponse", vendResponseHandler, "app.cashlessVending");

        $scope.$on('$destroy', function() {
            TSVService.unsubscribe("vendResponse", "app.cashlessVending")
        });
    }]);