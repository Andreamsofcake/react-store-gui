'use strict';

angular.module('myApp.Admin_Check_Faults', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Check_Faults', {
            templateUrl: 'Admin_Check_Faults/Admin_Check_Faults.html',
            controller: 'Admin_Check_FaultsCtrl'
        });
    }])

    .controller('Admin_Check_FaultsCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate){
            TsvService.session.currentView = "Admin_Check_Faults";
            $scope.bRunningClearFaults = false;
            $scope.machineID = 0;

            $scope.translate = function(name){
                return translate.translate("Check_Faults", name);
            };

            TsvService.cache.machineList = TsvService.fetchMachineIds();

            $scope.faults = TsvService.getFaultCodes($scope.machineID.toString());

            if(TsvService.cache.machineList.length > 1){
                $scope.bShowDropDownForMachines = true;
                TsvService.debug("machine Count: "+TsvService.cache.machineList.length);
                addMachineOptions();
            }

            function addMachineOptions(){
                var x = document.getElementById("selectMachine");

                for(var i=0; i< TsvService.cache.machineList.length; i++) {
                    var option = document.createElement("option");
                    option.text = $scope.translate("Machine") + (Number(TsvService.cache.machineList[i]) + 1);
                    x.add(option);
                }
            }

            document.getElementById('selectMachine').onchange = function () {
                $scope.machineID = document.getElementById("selectMachine").selectedIndex;
                $scope.faults = TsvService.getFaultCodes($scope.machineID.toString());
                //document.getElementById("displayFaults").innerHTML = "Fill All coils for machine "+$scope.machineID.toString();
            };

            $scope.backToAdminHome = function(){
                $location.path("/Admin_Home");
            };

            $scope.clearFaults = function(){
                if(!$scope.bRunningClearFaults){
                    $scope.bRunningClearFaults = true;
                    TsvService.clearMachineFaults($scope.machineID.toString());
                    TsvService.debug("returned from clearMachineFaults");
                }
            };

            var resetCompletedHandler = function(machineID) {
                TsvService.debug("resetCompletedHandler [" + machineID + "]");
                $scope.bRunningClearFaults = false;
                $scope.faults = TsvService.getFaultCodes(machineID.toString());
            };

            TsvService.subscribe("notifyResetComplete", resetCompletedHandler, "app.checkFaults");

            $scope.$on('$destroy', function() {
                TsvService.unsubscribe("notifyResetComplete", "app.checkFaults")
            });
}]);
