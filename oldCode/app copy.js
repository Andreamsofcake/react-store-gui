'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
        'ngRoute',
        //'ui.bootstrap',
        'ngTouch',
        'ngAnimate',
        'ng-virtual-keyboard',
        'angular-virtual-keyboard',
        'translation',
        'avt',
        'myApp.view0',
        'myApp.UI_New',
        'myApp.Page_Idle',
        'myApp.view1',
        'myApp.view2',
        'myApp.Card_Vending',
        'myApp.Cash_Vending',
        'myApp.Cashless_Vending',
        'myApp.THANKYOU_MSG',
        'myApp.Admin_Login',
        'myApp.Admin_Home',
        'myApp.Admin_Inventory',
        'myApp.Admin_System_Info',
        'myApp.Admin_Jofemar_Exerciser',
        'myApp.Admin_Component_Control',
        'myApp.Admin_Check_Faults',
        'myApp.Admin_Vms',
        'myApp.Admin_Auto_Map',
        'myApp.Cash_Card',
        'myApp.Vend_Error',
        'myApp.Category_Search',
        'myApp.Product_Search',
        'myApp.Admin_Settings',
        'myApp.Make_Donation',
        'myApp.Confirm_Donation',
        'myApp.version',
        'ngFitText',
        'myApp.Shopping_Cart',
        'myApp.Keyboard',
        'myApp.Activate'
]);

app.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});

app.run(function() {
        FastClick.attach(document.body, { touchBoundary: 200, tapDelay: 100 });
});

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view0'});
}]);

app.filter('points', function() {

    // Create the return function
    // set the required parameter name to **number**
    return function(number) {

        // Ensure that the passed in data is a number
        if(isNaN(number) || number < 0) {

            // If the data is not a number or is less than one (thus not having a cardinal value) return it unmodified.
            return number;

        } else {

            // If the data we are applying the filter to is a number, perform the actions to check it's ordinal suffix and apply it.

            number = number * 100;
            var lastDigit = number % 10;

            if(lastDigit === 1) {
                return number + ' point'
            } else {
                return number + ' points'
            }
        }
    }
});

app.filter("trustHtml", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    }
}]);

app.controller('mainController', ['$rootScope', '$location', 'TsvService', 'translate', '$timeout', '$filter',
    function($rootScope, $location, TsvService, translate, $timeout, $filter) {

        $rootScope.reloadPage = function(){window.location.reload();};
        // * Andrea refactor 3/11
        // $rootScope.bShowLanguageFlag = false;
        // $rootScope.bShowLanguage = false;
        // $rootScope.bShowCredit = false;
        // $rootScope.bCashless = false;
        // $rootScope.bDualMachine = false;
        // $rootScope.itemsInCart = 0;
        // $rootScope.bInsufficientFunds = false;
        // $rootScope.bDisplayCgryNavigation = false;
        // $rootScope.bDisplayCgryNavigation2 = false;
        // $rootScope.categories = [];

        if(Object.getOwnPropertyNames(TsvService.cache.machineSettings).length === 0){
            TsvService.cache.machineSettings = TsvService.fetchAllMachineSettings();
        }
        if(Object.getOwnPropertyNames(TsvService.cache.custommachinesettings).length === 0){
            TsvService.cache.custommachinesettings = TsvService.fetchAllCustomSettings();
        }
        if(Object.getOwnPropertyNames(TsvService.cache.machineList).length === 0){
            TsvService.cache.machineList = TsvService.fetchMachineIds();

            if(TsvService.machineSetting("MachineCount", 1) > 1){
                $rootScope.bDualMachine = true;
            }
        }

        $rootScope.registerKF =  function() {
            TsvService.registerComponent("KioskFramework", "1.0.0.3", "2015-12-10");
        };

        $rootScope.registerKF();

        var currencyType = TsvService.machineSetting("currencyFilter", 'currency');

        $rootScope.currencyFilter = function(model) {
            return $filter(currencyType)(model);
        };

        $rootScope.supportLanguages = TsvService.customSetting('languageSupported', 'En');
        $rootScope.bDualLanguage = $rootScope.supportLanguages.split(";").length > 1;

        //Run translation if selected language changes
        $rootScope.translate = function(name){
            return translate.translate(null, name);//CreditLabel and BalanceLabel
        };

        $rootScope.cgryNavTitle = translate.translate('Category_Search', 'NavTitle');

        $rootScope.bDisplayCgryNavigation2 =  TsvService.customSetting('bDisplayCgryNavigation', false);

        $rootScope.localizedImage = function(name) {
            return translate.localizedPath(name);
        };

        $rootScope.logoClicked = function(){
            TsvService.gotoDefaultIdlePage($location, $rootScope);
        };

        $rootScope.checkout = function() {
            var bHasShoppingCart = TsvService.bCustomSetting('bHasShoppingCart', "true");
            if ($rootScope.fundsAvailable >= $rootScope.summary.TotalPrice) {
                $location.path("/Cashless_Vending");
            } else {
                console.log("bHasShoppingCart:"+TsvService.bCustomSetting('bHasShoppingCart', "true"));
                if(bHasShoppingCart && $location.path() != "/Shopping_Cart"){
                    $location.path("/Shopping_Cart");
                }else{
                    if (bHasShoppingCart) {
                        $location.path("/Shopping_Cart");
                    }
                    if(TsvService.bCustomSetting('bAskForReceipt', "false")) {
                        $rootScope.keyboardView = "Enter_Email";
                        $location.path("/Keyboard");
                    }else{
                        $rootScope.gotoPayment();
                    }
                }
            }
        };

        $rootScope.gotoPayment = function(){
            TsvService.debug("gotoPayment() called");

            if (TsvService.cache.shoppingCart.summary.TotalPrice != 0
                && TsvService.bCustomSetting('HasCreditCard', 'true')
                && TsvService.bCustomSetting('HasBillCoin', 'false')) {
                $location.path("/Cash_Card");
            } else {
                if (TsvService.bCustomSetting('HasBillCoin', 'false')){
                    $location.path("/Cash_Vending");
                } else if (TsvService.bCustomSetting('HasCreditCard', 'true')) {
                    $location.path("/Card_Vending");
                } else if (TsvService.cache.shoppingCart.summary.TotalPrice == 0) {
                        $location.path("/Card_Vending");
                }
            }
        };

        $rootScope.creditMessage = function() {
            if ($rootScope.bCashless) {
                return $rootScope.translate("BalanceLabel") + ":" + '\n' + $rootScope.currencyFilter($rootScope.fundsAvailable);
            }else {
                return $rootScope.translate("CreditLabel") + ":"  + '\n'+  $rootScope.currencyFilter($rootScope.credit);
            }
        };

        TsvService.subscribe("notifyTSVReady", $rootScope, function() {
            console.log("Got event notifyTSVReady");
            if ($location.path() == "/view0") {
                console.log("Redirect to default idle page or reload");

                if (TsvService.cache.custommachinesettings === undefined) {
                    $rootScope.reloadPage();
                } else {
                    $rootScope.registerKF();
                    TsvService.gotoDefaultIdlePage($location, $rootScope);
                }
            }
        }, "app");

        //Need to work on this part later
        $rootScope.clickFlag = function(lang){
            console.log("Clicked Language Flag!");
            if($rootScope.selectedLanguage != lang){
                console.log("last selectedLanguage: "+$rootScope.selectedLanguage + " current selected language: "+lang);
                document.getElementById(lang).className = "showflag";
                document.getElementById($rootScope.selectedLanguage).className = "hideflag";

                $rootScope.selectedLanguage = lang;
                translate.selectLanguage(lang);
            }
        };

        $rootScope.updateCredit = function() {
            $rootScope.credit = TsvService.session.discount + TsvService.session.creditBalance;
            TsvService.debug("Updated credit to include discount "
                + TsvService.session.discount + " + " + TsvService.session.creditBalance
                + " = "
                + $rootScope.credit);
        };

        $rootScope.updateCredit();

        //Init
        $rootScope.selectedLanguage = TsvService.customSetting('languageDefaulted', 'En');
        document.getElementById($rootScope.selectedLanguage).className = "showflag";
        translate.selectLanguage($rootScope.selectedLanguage);

        //Don't display the language button if no other language supported
        var languageSupported = TsvService.customSetting('languageSupported');
        if (languageSupported !== undefined) {
            var languages = languageSupported.split(";");
            $rootScope.bShowLanguageFlag = languages.length > 1;
        }

        $rootScope.coupon = function(){
            $rootScope.keyboardView = "Enter_Coupon";
            $location.path("/Keyboard");
        };

        $rootScope.showCredit = function() {
            if ($rootScope.bCashless) {
                return typeof $rootScope.fundsAvailable != 'undefined' && $rootScope.fundsAvailable != 0 && $rootScope.bShowCredit;
            } else {
                return typeof $rootScope.credit != 'undefined' && $rootScope.credit != 0 && $rootScope.bShowCredit;
            }
        };
}]);
