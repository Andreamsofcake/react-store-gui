'use strict';

angular.module('myApp.Vend_Error', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Vend_Error', {
            templateUrl: 'Vend_Error/Vend_Error.html',
            controller: 'Vend_ErrorCtrl'
        });
    }])

    .controller('Vend_ErrorCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', function($scope, $rootScope, $timeout, $location, TsvService) {
        TsvService.debug("Hi Ping Debug Vend_Error!!!!!!!!!!!!");
        $rootScope.updateCredit();
        TsvService.session.currentView = "Vend_Error";

        //need to timeout to view1 after 10 seconds
        $scope.errorMsg1 = TsvService.session.vendErrorMsg1;
        $scope.errorMsg2 = TsvService.session.vendErrorMsg2;
        TsvService.session.vendErrorTimer = $timeout(vendErrorTimeout, 10000);

        function vendErrorTimeout(){
            console.log("Hi Ping VendError Timeout");
            TsvService.debug("vendErrorTimeout()");
            //$location.path("/view1");
            TsvService.gotoDefaultIdlePage($location, $rootScope);
        }
    }]);

