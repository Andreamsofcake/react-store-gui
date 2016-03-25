'use strict';
{/* Andrea refactor 3/14.*/}
function beep() {
}

angular.module('myApp.Page_Idle', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/Page_Idle', {
    templateUrl: 'Page_Idle/Page_Idle.html',
    controller: 'Page_IdleCtrl'
  });
}])

.controller('Page_IdleCtrl', ['$scope', '$rootScope','$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            console.log("::Page_Idle");

            $rootScope.bDisplayCgryNavigation = false;
            $rootScope.bShowCredit = $rootScope.credit && true;

            $scope.translate = function(name){
                return translate.translate("Page_Idle", name);
            };

            $scope.idleClicked = function(){
                TsvService.idleClicked($location, $rootScope);
            };

            TsvService.disableLoginDevices();
}]);
