'use strict';

angular.module('myApp.Admin_Jofemar_Exerciser', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Jofemar_Exerciser', {
            templateUrl: 'Admin_Jofemar_Exerciser/Admin_Jofemar_Exerciser.html',
            controller: 'Admin_Jofemar_ExerciserCtrl'
        });
    }])

    .controller('Admin_Jofemar_ExerciserCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            $scope.num = "";
            $scope.maxChars = $rootScope.bDualMachine?3:2;
            $scope.machineNumber = 0;
            TSVService.session.currentView = "Admin_Jofemar_Exerciser";
            $scope.errs = 0;
            $scope.bShowDropDownForMachines = false;

            $scope.translate = function(name){
                return translate.translate("Admin_Jofemar_Exerciser", name);
            };

            TSVService.cache.machineList = TSVService.fetchMachineIds();

            if(TSVService.cache.machineList.length > 1){
                $scope.bShowDropDownForMachines = true;
                addMachineOptions();
            }

            document.getElementById('selectMachine').onchange = function () {
                $scope.machineNumber = document.getElementById("selectMachine").selectedIndex;
                console.log("$scope.machineNumber: "+$scope.machineNumber);
            };

            function addMachineOptions(){
                var x = document.getElementById("selectMachine");
                for(var i=0; i< TSVService.cache.machineList.length; i++) {
                    var option = document.createElement("option");
                    option.text = $scope.translate("Machine") + " " + (Number(TSVService.cache.machineList[i]) + 1);
                    x.add(option);
                }
            }

            $scope.vend = function(){
                clearStatus();
                TSVService.vendProduct($scope.machineNumber, parseInt($scope.num) + $scope.machineNumber * 100);
                $scope.num = "";
            };

            $scope.lightOn = function() {
                TSVService.setLights($scope.machineNumber, true);
            };

            $scope.lightOff = function() {
                TSVService.setLights($scope.machineNumber, false);
            };

            $scope.backToAdminHome = function(){
                $location.path("/Admin_Home");
            };

            $scope.clear = function(){
                $scope.num = "";
            };

            $scope.press = function(digit){
                if($scope.num.length < $scope.maxChars){
                    $scope.num += digit;
                }else{
                    $scope.num = "";
                    $scope.num += digit;
                }
                $scope.num = parseInt($scope.num).toString();
            };

            $scope.prompt = function(){
                if($scope.num.length != 0){
                    return $scope.num;
                }
                return "";
            };

            var clearStatus = function() {
                $scope.errs = 0;
                $(".vmsStatus").empty();
            };

            var notifyVmsEvent = function(eventArgs) {
                if ($location.path() !== "/Admin_Jofemar_Exerciser")
                    return;
                if (this.errs == 2) {
                    clearStatus();
                }
                $(".vmsStatus").append(eventArgs.eventType + ' (' + eventArgs.exceptionMessage + ')<br/>');
                this.errs++;
            };

            TSVService.subscribe("notifyVmsEvent", notifyVmsEvent, "app.jofemarExerciser");

            $scope.$on('$destroy', function() {
                TSVService.unsubscribe("notifyVmsEvent", "app.jofemarExerciser");
            });
    }]);

