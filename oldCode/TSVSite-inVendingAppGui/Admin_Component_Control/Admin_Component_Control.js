'use strict';

angular.module('myApp.Admin_Component_Control', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Component_Control', {
            templateUrl: 'Admin_Component_Control/Admin_Component_Control.html',
            controller: 'Admin_Component_ControlCtrl'
        });
    }])

    .controller('Admin_Component_ControlCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            TSVService.session.currentView = "Admin_Component_Control";

            $scope.translate = function(name){
                return translate.translate("Admin_Component_Control", name);
            };

            // KENT: this is the only place this method is called, let's just do a re-render instead?
            $scope.restartGUI = function(){
                TSVService.refreshIndexPage();
            };

            $scope.backToAdminHome = function(){
                $location.path("/Admin_Home");
            }
    }]);

