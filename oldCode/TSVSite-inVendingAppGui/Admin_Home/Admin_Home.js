'use strict';

angular.module('myApp.Admin_Home', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Home', {
            templateUrl: 'Admin_Home/Admin_Home.html',
            controller: 'Admin_HomeCtrl'
        });
    }])

    .controller('Admin_HomeCtrl', ['$scope', '$rootScope', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $location, TsvService, translate) {
            TsvService.session.currentView = "Admin_Home";
            $scope.translate = function(name){
                return translate.translate("Admin_Home", name);
            };

            $scope.backhome = function(){
                TsvService.gotoDefaultIdlePage($location, $rootScope);
            };

            $scope.inventory = function(){
                $location.path("/Admin_Inventory");
            };

            $scope.jofemarExerciser = function(){
                $location.path("/Admin_Jofemar_Exerciser");
            };

            $scope.machineSettings = function(){
                $location.path("/Admin_Settings");
            };

            $scope.systemInfo = function(){
                $location.path("/Admin_System_Info");
            };

            $scope.vms = function(){
                $location.path("/Admin_Vms");
            };

            $scope.checkFaults = function(){
                $location.path("/Admin_Check_Faults");
            };

            $scope.autoMap = function(){
                $location.path("/Admin_Auto_Map");
            };

            $scope.restart = function(){
                TsvService.debug("restart");
                TsvService.restart();
                $location.path("/view0");
            };

            $scope.shutdown = function(){
                TsvService.debug("shutdown");
                TsvService.shutdown();
            };
    }]);

