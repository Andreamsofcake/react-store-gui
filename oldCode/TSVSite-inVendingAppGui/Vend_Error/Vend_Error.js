'use strict';

angular.module('myApp.Vend_Error', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Vend_Error', {
            templateUrl: 'Vend_Error/Vend_Error.html',
            controller: 'Vend_ErrorCtrl'
        });
    }])

    .controller('Vend_ErrorCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', function($scope, $rootScope, $timeout, $location, TSVService) {
        TSVService.debug("Hi Ping Debug Vend_Error!!!!!!!!!!!!");
        $rootScope.updateCredit();
        TSVService.session.currentView = "Vend_Error";

        //need to timeout to view1 after 10 seconds
        $scope.errorMsg1 = TSVService.session.vendErrorMsg1;
        $scope.errorMsg2 = TSVService.session.vendErrorMsg2;
        TSVService.session.vendErrorTimer = $timeout(vendErrorTimeout, 10000);

        function vendErrorTimeout(){
            console.log("Hi Ping VendError Timeout");
            TSVService.debug("vendErrorTimeout()");
            //$location.path("/view1");
            TSVService.gotoDefaultIdlePage($location, $rootScope);
        }
    }]);

