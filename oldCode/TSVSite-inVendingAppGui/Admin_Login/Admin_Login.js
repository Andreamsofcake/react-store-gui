'use strict';

angular.module('myApp.Admin_Login', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Login', {
            templateUrl: 'Admin_Login/Admin_Login.html',
            controller: 'Admin_LoginCtrl'
        });
    }])

    .controller('Admin_LoginCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {

        $scope.translate = function(name){
            return translate.translate("Admin_Login", name);
        };

        $scope.instructionMessage = $scope.translate('Password');
        TSVService.session.currentView = "Admin_Login";
        TSVService.disableLoginDevices();
        TSVService.emptyCart();
        $scope.num = "";
        $scope.maxChars = 6;

        $scope.enter = function(){
            var res = TSVService.validateAdminPassword($scope.num);

            switch(res.result){
                case "VALID":
                    $location.path("/Admin_Home");
                    break;
                default:
                    $scope.instructionMessage = $scope.translate('InvalidPassword');//"Invalid Password";
                    break;
            }
        };

        $scope.clear = function() {
            $scope.instructionMessage = $scope.translate('Password');//"Password";
            $scope.num = "";
        };

        $scope.press = function(digit){
            if($scope.num.length < $scope.maxChars){
                $scope.num += digit;
            }else{
                $scope.num = "";
                $scope.num += digit;
            }
        };

        $scope.prompt = function(){
            if($scope.num.length != 0){
                return $scope.num;
            }
            return "";
        };

        $scope.back = function(){
            $location.path("/view1");
        };

    }]);