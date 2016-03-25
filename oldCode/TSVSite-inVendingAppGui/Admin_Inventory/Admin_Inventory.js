'use strict';

angular.module('myApp.Admin_Inventory', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Inventory', {
            templateUrl: 'Admin_Inventory/Admin_Inventory.html',
            controller: 'Admin_InventoryCtrl'
        });
    }])

    .controller('Admin_InventoryCtrl', ['$scope', '$rootScope', '$timeout', '$http', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $http, $location, TsvService, translate) {
            TsvService.debug("Hi Admin_Inventory....");

            $scope.translate = function(name){
                return translate.translate("Admin_Inventory", name);
            };

            TsvService.session.currentView = "Admin_Inventory";
            $scope.instructionMessage = $scope.translate('EnterCoil');
            TsvService.cache.productList = TsvService.fetchProductQuick();
            var promise;
            $scope.machineID = 0;
            $scope.num = "";
            $scope.maxChars = $rootScope.bDualMachine?3:2;
            $scope.bEnterCoil = true;
            $scope.showKeypad = false;

            TsvService.cache.machineList = TsvService.fetchMachineIds();

            if(TsvService.cache.machineList.length > 1){
                $scope.bShowDropDownForMachines = true;
                TsvService.debug("machine Count: "+TsvService.cache.machineList.length);
                addMachineOptions();
            }

            document.getElementById('selectMachine').onchange = function () {
                $scope.machineID = document.getElementById("selectMachine").selectedIndex;
                document.getElementById("displayMachine").innerHTML =
                    $scope.translate("FillAllCoilsForMachine") + ($scope.machineID + 1).toString();
            };

            function addMachineOptions(){
                var x = document.getElementById("selectMachine");

                for(var i=0; i< TsvService.cache.machineList.length; i++) {
                    var option = document.createElement("option");
                    option.text = $scope.translate("Machine") + " " + (Number(TsvService.cache.machineList[i]) + 1);
                    x.add(option);
                }
            }

            $scope.fillMachine = function(){
                TsvService.debug("Fill machine for machine "+$scope.machineID.toString());
                TsvService.fillMachine($scope.machineID.toString());
            };

            $scope.fillCoil = function(){
                if($scope.num != ""){
                    $scope.vpbc = TsvService.adminValidateProductByCoil($scope.num);

                    switch ($scope.vpbc.result) {
                        case "UNKNOWN":
                            $scope.instructionMessage = $scope.translate('UnknownProduct');
                            $timeout(function(){
                                $scope.instructionMessage = $scope.translate('EnterCoil');
                            }, 3000);
                            break;
                        case "INVALID_PRODUCT":
                            $scope.instructionMessage = $scope.translate('InvalidProduct');
                            $timeout(function(){
                                $scope.instructionMessage = $scope.translate('EnterCoil');
                            }, 3000);
                            break;
                        default:
                            $scope.instructionMessage = $scope.translate('EnterStockAmount');
                            $scope.coilNumber = $scope.num;
                            $scope.num = "";
                            $scope.bEnterCoil = false;
                            TsvService.debug("Fill coil "+$scope.coilNumber);
                            TsvService.fillCoil($scope.coilNumber);
                            break;
                    }
                }
            };

            $scope.backToAdminHome = function(){
                $scope.num = "";
                if($scope.bEnterCoil){
                    $location.path("/Admin_Home");
                }else{
                    $scope.bEnterCoil = true;
                }
            };

            $scope.addStock = function(){
                if($scope.num != ""){
                    console.log("Hi Ping Debug addStock()"+$scope.num);
                    TsvService.addStock($scope.coilNumber, $scope.num);

                    $scope.vpbc = TsvService.adminValidateProductByCoil($scope.coilNumber);
                    $scope.num = "";

                    promise = $timeout(function(){
                        console.log("Hi Ping Debug Invalid Coil Timer");
                        $scope.instructionMessage = $scope.translate('EnterCoil');
                        $scope.bEnterCoil = true;
                        $scope.num = "";
                    }, 2000);
                }
            };

            $scope.removeStock = function(){
                console.log("Hi Ping Debug addStock()");
                if($scope.num != ""){
                    console.log("Hi Ping Debug addStock()"+$scope.num);
                    TsvService.removeStock($scope.coilNumber, $scope.num);
                    $scope.vpbc = TsvService.adminValidateProductByCoil($scope.coilNumber);
                    $scope.stockCount = "Stock Count: "+$scope.vpbc.inventoryCount;
                    $scope.num = "";

                    promise = $timeout(function(){
                        console.log("Hi Ping Debug Invalid Coil Timer");
                        $scope.instructionMessage = $scope.translate('EnterCoil');
                        $scope.bEnterCoil = true;
                        $scope.num = "";
                    }, 2000);
                }
            };

            $scope.clear = function(){
                $scope.num = "";
            };

            $scope.enter = function(){
                console.log("Hi Ping Debug Coil Enter: "+$scope.num);
                $scope.vpbc = TsvService.adminValidateProductByCoil($scope.num);

                switch ($scope.vpbc.result) {
                    case "UNKNOWN":
                        $scope.instructionMessage = $scope.translate('ProductUnknown');
                        $timeout(function(){
                            console.log("Hi Ping Debug Invalid Coil Timer");
                            $scope.instructionMessage = $scope.translate('EnterCoil');
                        }, 3000);
                        break;
                    case "INVALID_PRODUCT":
                        $scope.instructionMessage = $scope.translate('InvalidProduct');
                        $timeout(function(){
                            console.log("Hi Ping Debug Invalid Coil Timer");
                            $scope.instructionMessage = $scope.translate('EnterCoil');
                        }, 3000);
                        break;
                    default:
                        $scope.instructionMessage = $scope.translate('EnterStockAmount');
                        $scope.coilNumber = $scope.num;
                        $scope.num = "";
                        $scope.bEnterCoil = false;
                        break;
                }
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
    }]);