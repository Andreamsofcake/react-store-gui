'use strict';

angular.module('myApp.Admin_Vms', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Vms', {
            templateUrl: 'Admin_Vms/Admin_Vms.html',
            controller: 'Admin_VmsCtrl'
        });
    }])

    .controller('Admin_VmsCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            TSVService.session.currentView = "Admin_Vms";

            $scope.translate = function(name){
                return translate.translate("Admin_Vms", name);
            };

            $scope.lastHeartbeatTime = function(){
                console.log("Hi Ping Debug lastHeartBeatTime");
                $scope.lastHeartBeatTime = TSVService.lastHeartbeatTime();
            }

            $scope.heartBeatNow = function(){
                console.log("lastHeartBeatTime");
                TSVService.heartbeatNow();
                $scope.lastHearBeatTime = TSVService.lastHeartbeatTime();
            }

            $scope.backToAdminHome = function(){
                $location.path("/Admin_Home");
            }
    }]);

