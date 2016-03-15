'use strict';

var activateApp = angular.module('myApp.Activate', ['ngRoute', 'ng-virtual-keyboard']);

activateApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/Activate', {
        templateUrl: 'Activate/Activate.html',
        controller: 'ActivateCtrl'
    });
}]);

activateApp.config(['VKI_CONFIG', function (VKI_CONFIG) {

    VKI_CONFIG.layout = 'custom';

    VKI_CONFIG.customLayout = {
        'default': [
            'E F 7 8 9',
            'C D 4 5 6',
            'A B 1 2 3',
            '{sp:2} {sp:2} {sp:10px} {bksp} 0 {a}'
        ]
    };

    VKI_CONFIG.usePreview = true;

    VKI_CONFIG.position = null;
    //VKI_CONFIG.position = {
    //    of : $('body'), // null (attach to input/textarea) or a jQuery object (attach elsewhere)
    //    my : 'center center',
    //    at : 'center center',
    //    collision: 'fit fit'
    //};

    VKI_CONFIG.stayOpen = true;
    VKI_CONFIG.maxLength = 4;
    VKI_CONFIG.restrictInput = true;
    VKI_CONFIG.restrictInclude = 'a b c d e f';
    VKI_CONFIG.useCombos = false;
    VKI_CONFIG.acceptValid = true;

}]);


activateApp.controller('ActivateCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate', 'ngVirtualKeyboardService', '$sce',
    function ($scope, $rootScope, $timeout, $location, TSVService, translate, ngVirtualKeyboardService, $sce) {

        $scope.translate = function (name) {
            return translate.translate("Activate", name);
        };

        TSVService.session.currentView = "Activate";

        $scope.activationKey = '';

        $scope.serialNumber = TSVService.machineSetting('MachineSerialNumber');

        setTimeout(function () {

            $scope.kb = ngVirtualKeyboardService.getKeyboardById('activationKey');

            $scope.kb.reveal();

            $scope.kb.options.validate = function(keyboard, value, isClosing) {

                // only allow a 3-digit number
                var valid = false;

                if (isClosing) {
                    valid = TSVService.activate(value).resultCode === 'SUCCESS';
                }

                if (isClosing && valid) {

                    // *** closing and valid ***
                    setTimeout(function() {
                        $location.path("/Admin_Login");
                    }, 0);

                    return true;
                } else if (isClosing && !valid) {

                    // *** closing and not valid ***
                    // add an indicator/popup here to tell the user the input is not valid
                    $scope.promptMessage = $sce.trustAsHtml($scope.translate("WrongActivationCode"));
                    $scope.$apply();

                    setTimeout(function () {
                        $scope.resetPrompt();
                        $scope.$apply();
                    }, 5000);

                    keyboard.$el.trigger('canceled', [keyboard, keyboard.el]);
                    return false;
                }
            };

        }, 0);

        $scope.resetPrompt = function() {
            $scope.promptMessage = $sce.trustAsHtml(
                            $scope.translate('CallToActivate1')
                + "<br>" +  $scope.translate('CallToActivate2')
                + "<br>" +  $scope.translate('CallToActivate3')
                + "<br>" +  "SERIAL# " + $scope.serialNumber
            );
        };
        $scope.resetPrompt();

        $scope.prompt = function () {
            return $scope.promptMessage;
        };

        $scope.activate = function () {
            var success = TSVService.activate($scope.activationKey).resultCode === 'SUCCESS';
            if (!success) {
                $scope.kb.reveal();
            }
        };

        $scope.$on("$destroy", function () {
            $scope.kb.close();
        });

    }]);