'use strict';

angular.module('myApp.THANKYOU_MSG', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/THANKYOU_MSG', {
            templateUrl: 'THANKYOU_MSG/THANKYOU_MSG.html',
            controller: 'THANKYOU_MSGCtrl'
        });
    }])

    .controller('THANKYOU_MSGCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', '$window', function($scope, $rootScope, $timeout, $location, TSVService, $window) {
        $rootScope.updateCredit();

        $rootScope.bDisplayCgryNavigation = $rootScope.bDisplayCgryNavigation2;

        TSVService.session.thankyouTimer = $timeout(thankyouTimeout, TSVService.cache.custommachinesettings.thankyouPageTimeout);

        function thankyouTimeout(){
            console.log("thankyouTimeout()");
            //$location.path("/view1");
            TSVService.gotoDefaultIdlePage($location, $rootScope);
        }
    }]);

