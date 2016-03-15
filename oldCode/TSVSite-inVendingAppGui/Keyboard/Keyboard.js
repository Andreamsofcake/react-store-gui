'use strict';

angular.module('myApp.Keyboard', ['ngRoute', 'ngAnimate', 'ngTouch'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Keyboard', {
            templateUrl: 'Keyboard/Keyboard.html',
            controller: 'KeyboardCtrl'
        });
    }])

    .controller('KeyboardCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            $scope.bShowBtns = true;
            $scope.emailAddress = "";
            $scope.email = "";//may need to use rootScope
            $scope.coupon = "";

            $scope.bShift = false;
            $scope.key_a = $scope.bShift?"A":"a";
            $scope.key_b = $scope.bShift?"B":"b";
            $scope.key_c = $scope.bShift?"C":"c";
            $scope.key_d = $scope.bShift?"D":"d";
            $scope.key_e = $scope.bShift?"E":"e";
            $scope.key_f = $scope.bShift?"F":"f";
            $scope.key_g = $scope.bShift?"A":"a";
            $scope.key_h = $scope.bShift?"B":"b";
            $scope.key_i = $scope.bShift?"C":"c";
            $scope.key_j = $scope.bShift?"D":"d";
            $scope.key_k = $scope.bShift?"E":"e";
            $scope.key_f = $scope.bShift?"F":"f";

            $rootScope.bDisplayCgryNavigation = false;


            $scope.translate = function(name){
                return translate.translate("Keyboard", name);
            };
        $rootScope.updateCredit();
        TSVService.session.currentView = "Keyboard";
        $scope.keyboardTitle = "EnterEmailTitle";
        //$rootScope.keyboardView = "Enter_Coupon";

            $rootScope.credit = TSVService.session.creditBalance;
            TSVService.session.currentView = "Keyboard";
            $scope.keyboardTitle = "EnterEmailTitle";
            //$rootScope.keyboardView = "Enter_Coupon";

            $scope.yes = function(){
                console.log("Yes! Email");
                $scope.bShowBtns = false;
                $scope.keyboardTitle = "EnterEmail";
                console.log("Yes!!!!!");
            };

            $scope.no = function(){
                console.log("No Email");
                $rootScope.gotoPayment();
            };

            $scope.back = function(){
                TSVService.removeKeyboard();
                if(TSVService.cache.custommachinesettings.bHasShoppingCart.toString().toLowerCase() === "true" && $location.path() != "/Shopping_Cart"){
                    $location.path("/Shopping_Cart");
                }else{
                    $location.path("/view2");
                }
            };

            $scope.enter = function(){
                console.log("entered!");
                switch($rootScope.keyboardView){
                    case "Enter_Email":
                        console.log("Validate Email");
                        $location.path("/THANKYOU_MSG");
                        break;
                    case "Enter_Coupon":
                        console.log("Validate Coupon");
                        //
                        break;
                    default:
                        break;
                }
            };

            $scope.clickKey = function(key){
                console.log("Hi Ping Debug Click Key: "+key);
                console.log("email: " + $scope.email);
                $scope.email += key;
            };

            $scope.prompt = function(){
                return $scope.email;
            };

            $scope.bksp = function(){
                 if($scope.email.length > 0){
                     $scope.email = $scope.email.substr(0, $scope.email.length-1);
                 }
            };

            $scope.capsLock = function(){
                $scope.bShift = !$scope.bShift;
                //Need to change class name here
            };

            $scope.shiftKey = function(){
                $scope.bShift = !$scope.bShift;

                $(document).ready(function(){
                    $(".shift").toggleClass("system_key");
                });
            };

            $scope.switchKeys = function(key){
                switch(key){
                    case '`':
                        return $scope.bShift?'~':key;
                        break;
                    case '1':
                        return $scope.bShift?'!':key;
                        break;
                    case '2':
                        return $scope.bShift?'@':key;
                        break;
                    case '3':
                        return $scope.bShift?'#':key;
                        break;
                    case '4':
                        return $scope.bShift?'$':key;
                        break;
                    case '5':
                        return $scope.bShift?'%':key;
                        break;
                    case '6':
                        return $scope.bShift?'^':key;
                        break;
                    case '7':
                        return $scope.bShift?'&':key;
                        break;
                    case '8':
                        return $scope.bShift?'*':key;
                        break;
                    case '9':
                        return $scope.bShift?'(':key;
                        break;
                    case '0':
                        return $scope.bShift?')':key;
                        break;
                    case '-':
                        return $scope.bShift?'_':key;
                        break;
                    case '=':
                        return $scope.bShift?'+':key;
                        break;
                    case '[':
                        return $scope.bShift?'{':key;
                        break;
                    case ']':
                        return $scope.bShift?'}':key;
                        break;
                    case '&bsol;':
                        return $scope.bShift?key:'&bsol;';
                        break;
                    case ';':
                        return $scope.bShift?':':key;
                        break;
                    case "quote":
                        return $scope.bShift?'"':"'";
                        break;
                    case ',':
                        return $scope.bShift?'<':key;
                        break;
                    case '.':
                        return $scope.bShift?'>':key;
                        break;
                    case '/':
                        return $scope.bShift?'?':key;
                        break;
                    default:
                        return $scope.bShift?key.toUpperCase():key;
                }
            };
    }]);