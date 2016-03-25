'use strict';

angular.module('myApp.Admin_Vms', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Vms', {
            templateUrl: 'Admin_Vms/Admin_Vms.html',
            controller: 'Admin_VmsCtrl'
        });
    }])

    .controller('Admin_VmsCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            TsvService.session.currentView = "Admin_Vms";

            $scope.translate = function(name){
                return translate.translate("Admin_Vms", name);
            };

            $scope.lastHeartbeatTime = function(){
                console.log("Hi Ping Debug lastHeartBeatTime");
                $scope.lastHeartBeatTime = TsvService.lastHeartbeatTime();
            }

            $scope.heartBeatNow = function(){
                console.log("lastHeartBeatTime");
                TsvService.heartbeatNow();
                $scope.lastHearBeatTime = TsvService.lastHeartbeatTime();
            }

            $scope.backToAdminHome = function(){
                $location.path("/Admin_Home");
            }
    }]);

