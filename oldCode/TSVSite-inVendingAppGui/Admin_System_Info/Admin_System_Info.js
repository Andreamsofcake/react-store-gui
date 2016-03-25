'use strict';

angular.module('myApp.Admin_System_Info', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_System_Info', {
            templateUrl: 'Admin_System_Info/Admin_System_Info.html',
            controller: 'Admin_System_InfoCtrl'
        });
    }])

    .controller('Admin_System_InfoCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {

        $scope.translate = function(name){
            return translate.translate("System_Info", name);
        };

        $scope.versionInfos = TsvService.enumerateComponents();
        TsvService.session.currentView = "System_Info";

        $scope.backToAdminHome = function(){
            $location.path("/Admin_Home");
        }
    }]);

