'use strict';

angular.module('myApp.THANKYOU_MSG', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/THANKYOU_MSG', {
            templateUrl: 'THANKYOU_MSG/THANKYOU_MSG.html',
            controller: 'THANKYOU_MSGCtrl'
        });
    }])

    .controller('THANKYOU_MSGCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', '$window', function($scope, $rootScope, $timeout, $location, TsvService, $window) {
        $rootScope.updateCredit();

        $rootScope.bDisplayCgryNavigation = $rootScope.bDisplayCgryNavigation2;

        TsvService.session.thankyouTimer = $timeout(thankyouTimeout, TsvService.cache.custommachinesettings.thankyouPageTimeout);

        function thankyouTimeout(){
            console.log("thankyouTimeout()");
            //$location.path("/view1");
            TsvService.gotoDefaultIdlePage($location, $rootScope);
        }
    }]);

