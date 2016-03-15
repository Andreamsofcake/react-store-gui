'use strict';

angular.module('myApp.Admin_Auto_Map', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Auto_Map', {
            templateUrl: 'Admin_Auto_Map/Admin_Auto_Map.html',
            controller: 'Admin_Auto_MapCtrl'
        });
    }])

    .controller('Admin_Auto_MapCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate){
            TSVService.session.currentView = "Admin_Auto_Map";
            TSVService.session.bRunningAutoMap = false;
            $scope.status = "";

            $scope.translate = function(name){
                return translate.translate("Auto_Map", name);
            };

            TSVService.cache.machineList = TSVService.fetchMachineIds();
            $scope.bShowMachine2 = false;
            if(TSVService.cache.machineList.length > 1){
                $scope.bShowMachine2 = true;
            }
            
            $scope.backToAdminHome = function(){
                $location.path("/Admin_Home");
            };

            var table = document.getElementById("mapTable");
            var tableRow;
            var tableCol;
            var cellDiv;
            var lastRow;

            $scope.mapMachine = function(machineID){
                console.log("Debug MAP MACHINE " + machineID);
                TSVService.debug("Debug MAP MACHINE " + machineID);
                lastRow = -1;
                table.innerHTML = "";
                if(!TSVService.session.bRunningAutoMap){
                    TSVService.debug("Debug MAP MACHINE!!!");
                    TSVService.session.bRunningAutoMap = true;
                    TSVService.runAutoMap(machineID, -1);
                }
            };

            var notifyMapStatusHandler = function(status, info){
                if (info != null && info != undefined)
                TSVService.debug("MapStatus " + status + ":" + info.coilNumber);
                if($location.path() != "/Admin_Auto_Map")    return;

                $scope.status = status;
                switch(status){
                    case "Map":
                        addNewCoil(info.coilNumber);
                        break;
                    case "End":
                        TSVService.session.bRunningAutoMap = false;
                        break;
                    default:
                        break;
                }
            };

            var addNewCoil = function(coilNumber){
                $scope.status = "Mapping coil: "+coilNumber;
                var coilNum = parseInt(coilNumber);
                var rowNum = Math.floor((coilNum - 1) / 10);
                TSVService.debug("CoilNum = " + coilNum + " Prev Row = " + lastRow + " Cur Row = " + rowNum);

                if (rowNum != lastRow) {
                    lastRow = rowNum;
                    tableRow = table.insertRow(-1);
                    tableCol = tableRow.insertCell(-1);
                    cellDiv = document.createElement("div");
                    cellDiv.setAttribute("class", "trayCoils");
                    tableCol.appendChild(cellDiv);
                }
                cellDiv.innerHTML += "<div class='coilNumber'>" + coilNumber + "</div>";
            };

            TSVService.subscribe("notifyMapStatusChange", notifyMapStatusHandler, "app.automap");

            $scope.$on('$destroy', function() {
                TSVService.unsubscribe("notifyMapStatusChange", "app.automap")
            });
    }]);

