'use strict';

var kbApp = angular.module('myApp.Admin_Settings', ['ngRoute', 'angular-useragent-parser', 'angular-virtual-keyboard']);

kbApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Admin_Settings', {
            templateUrl: 'Admin_Settings/Admin_Settings.html',
            controller: 'Admin_SettingsCtrl'
        });
}]);

kbApp.config(['AVT_VKI_CONFIG', function(AVT_VKI_CONFIG) {
        AVT_VKI_CONFIG.layout['US Standard'] = {
            'name': "US Standard", 'keys': [
                [["'", '"'], ["1", "!", "\u00b9"], ["2", "@", "\u00b2"], ["3", "#", "\u00b3"], ["4", "$", "\u00a3"], ["5", "%", "\u00a2"], ["6", "\u00a8", "\u00ac"], ["7", "&"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+", "\u00a7"], ["Bksp", "Bksp"]],
                [["Tab", "Tab"], ["q", "Q", "/"], ["w", "W", "?"], ["e", "E", "\u20ac"], ["r", "R"], ["t", "T"], ["y", "Y"], ["u", "U"], ["i", "I"], ["o", "O"], ["p", "P"], ["\u00b4", "`"], ["[", "{", "\u00aa"], ["Enter", "Enter"]],
                [["Caps", "Caps"], ["a", "A"], ["s", "S"], ["d", "D"], ["f", "F"], ["g", "G"], ["h", "H"], ["j", "J"], ["k", "K"], ["l", "L"], ["\u00e7", "\u00c7"], ["~", "^"], ["]", "}", "\u00ba"], ["/", "?"]],
                [["Shift", "Shift"], ["\\", "|"], ["z", "Z"], ["x", "X"], ["c", "C", "\u20a2"], ["v", "V"], ["b", "B"], ["n", "N"], ["m", "M"], [",", "<"], [".", ">"], [":", ":"], ["Shift", "Shift"]],
                [[" ", " ", " ", " "], ["AltGr", "AltGr"]]
            ], 'lang': ["en"]
        };

        AVT_VKI_CONFIG.kt = 'US Standard';

        AVT_VKI_CONFIG.layout.Numeric = {
            'name': "Numeric", 'keys': [
                [["1", '1'], ["2", "2"], ["3", "3"], ["Bksp", "Bksp"]],
                [["4", "4"], ["5", "5"], ["6", '6'], ["Enter", "Enter"]],
                [["7", "7"], ["8", "8"], ["9", "9"], []],
                [["0", "0"], ["-"], ["+"], [","]]
            ], 'lang': ["en"]
        };

        //position the keyboard next to the input
        AVT_VKI_CONFIG.relative = true;

        //An array to replace the default labels of the keyboard interface
        AVT_VKI_CONFIG.i18n = {
            '00': "Display Number Pad",
            '01': "Display virtual keyboard interface",
            '02': "Select keyboard layout",
            '03': "Dead keys",
            '04': "On",
            '05': "Off",
            '06': "Close the keyboard",
            '07': "Clear",
            '08': "Clear this input",
            '09': "Version",
            '10': "Decrease keyboard size",
            '11': "Increase keyboard size"
        };
    }]);

kbApp.controller('Admin_SettingsCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
    function($scope, $rootScope, $timeout, $location, TSVService, translate) {

    $scope.translate = function(name){
        return translate.translate("Admin_Settings", name);
    };

    $rootScope.updateCredit();
    TSVService.session.currentView = "Admin_Settings";

    if(Object.getOwnPropertyNames(TSVService.cache.machineSettings).length === 0){
        TSVService.cache.machineSettings = TSVService.fetchAllMachineSettings();
    }

    $scope.defaultLanguage = TSVService.cache.machineSettings.defaultLanguage;
    $scope.ccProcessorMode = TSVService.cache.machineSettings.CCProcessorMode;
    $scope.machineSerialNumber = TSVService.cache.machineSettings.MachineSerialNumber;
    $scope.merchantKey = TSVService.cache.machineSettings.CCMerchantKey;
    $scope.merchantID = TSVService.cache.machineSettings.CCMerchantID;
    $scope.dropSensorAttached = TSVService.cache.machineSettings.DropSensorAttached;
    $scope.ccReaderType = TSVService.cache.machineSettings.CCReaderType;
    $scope.vmcPlatform = TSVService.cache.machineSettings.VMCPlatform;
    $scope.machineCount = TSVService.cache.machineSettings.MachineCount;
    $scope.comPort = TSVService.cache.machineSettings.VMCControlCOMPort;
    $scope.salesTaxRate = TSVService.cache.machineSettings.SalesTaxRate;
    $scope.shoppingCartMaxItemCount = TSVService.cache.machineSettings.ShoppingCartMaxItemCount;
    $scope.bHasShoppingCart = TSVService.cache.custommachinesettings.bHasShoppingCart;
    $scope.singleProductDonation = TSVService.cache.custommachinesettings.singleProductDonation;
    $scope.minimumDonationAmount = TSVService.cache.custommachinesettings.minimumDonationAmount;

    var defaultLanguage = (('languageDefaulted' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.languageDefaulted != ""))?TSVService.cache.custommachinesettings.languageDefaulted:"En";
    $scope.supportLanguages = $rootScope.supportLanguages;
    var languages = $scope.supportLanguages.split(";");
    var option;

    //supported Languages
    var x = document.getElementById("defaultLanguage");
    for(var i=0; i<languages.length; i++){
        if(languages[i] != "") {
            option = document.createElement("option");
            option.text = languages[i];
            x.add(option);
        }
    }

    $("#defaultLanguage").val(defaultLanguage);

    document.getElementById('defaultLanguage').onchange = function () {

        var dfltLang = $("#defaultLanguage").val();
        console.log("$(#defaultLanguage).val(): "+ dfltLang);
        TSVService.cache.custommachinesettings.languageDefaulted = dfltLang;
        TSVService.setCustomMachineSetting("languageDefaulted", TSVService.cache.custommachinesettings.languageDefaulted);
    };

    //Card Processor Mode
    var y = document.getElementById("cardProcessorMode");
    option = document.createElement("option");
    option.text = "Production";
    y.add(option);

    option = document.createElement("option");
    option.text = "Certification";
    y.add(option);

    $("#cardProcessorMode").val(TSVService.cache.machineSettings.CCProcessorMode);

    document.getElementById('cardProcessorMode').onchange = function () {
        TSVService.cache.machineSettings.CCProcessorMode = $("#cardProcessorMode").val();
        TSVService.setMachineSetting("CCProcessorMode", TSVService.cache.machineSettings.CCProcessorMode);
    };

    $scope.backToAdminHome = function(){
        TSVService.removeKeyboard();
        $location.path("/Admin_Home");
    };

    //need to save data in sql database
    $scope.save = function(){
        console.log("save!");
        if(TSVService.cache.machineSettings.MachineSerialNumber != $scope.machineSerialNumber){
            TSVService.setMachineSetting("MachineSerialNumber", $scope.machineSerialNumber);
            TSVService.cache.machineSettings.MachineSerialNumber = $scope.machineSerialNumber;
        }

        if(TSVService.cache.machineSettings.CCMerchantKey != $scope.merchantKey){
            TSVService.setMachineSetting("CCMerchantKey", $scope.merchantKey);
            TSVService.cache.machineSettings.CCMerchantKey = $scope.merchantKey;
        }

        if(TSVService.cache.machineSettings.CCMerchantID != $scope.merchantID){
            TSVService.setMachineSetting("CCMerchantID", $scope.merchantID);
            TSVService.cache.machineSettings.CCMerchantID = $scope.merchantID;
        }

        if(TSVService.cache.machineSettings.DropSensorAttached != $scope.dropSensorAttached){
            TSVService.setMachineSetting("DropSensorAttached", $scope.dropSensorAttached);
            TSVService.cache.machineSettings.DropSensorAttached = $scope.dropSensorAttached;
        }

        if(TSVService.cache.machineSettings.CCReaderType != $scope.ccReaderType){
            TSVService.setMachineSetting("CCReaderType", $scope.ccReaderType);
            TSVService.cache.machineSettings.CCReaderType = $scope.ccReaderType;
        }

        if(TSVService.cache.machineSettings.VMCPlatform != $scope.vmcPlatform){
            TSVService.setMachineSetting("VMCPlatform", $scope.vmcPlatform);
            TSVService.cache.machineSettings.VMCPlatform = $scope.vmcPlatform;
        }

        if(TSVService.cache.machineSettings.MachineCount != $scope.machineCount){
            TSVService.setMachineSetting("MachineCount", $scope.machineCount);
            TSVService.cache.machineSettings.MachineCount = $scope.machineCount;
        }

        if(TSVService.cache.machineSettings.VMCControlCOMPort != $scope.comPort){
            TSVService.setMachineSetting("VMCControlCOMPort", $scope.comPort);
            TSVService.cache.machineSettings.VMCControlCOMPort = $scope.comPort;
        }

        if(TSVService.cache.machineSettings.SalesTaxRate != $scope.salesTaxRate){
            TSVService.setMachineSetting("SalesTaxRate", $scope.salesTaxRate);
            TSVService.cache.machineSettings.SalesTaxRate = $scope.salesTaxRate;
        }

        if(TSVService.cache.machineSettings.ShoppingCartMaxItemCount!= $scope.shoppingCartMaxItemCount){
            TSVService.setMachineSetting("ShoppingCartMaxItemCount", $scope.shoppingCartMaxItemCount);
            TSVService.cache.machineSettings.shoppingCartMaxItemCount = $scope.shoppingCartMaxItemCount;
        }

        if(('languageSupported' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.languageSupported != $scope.supportLanguages)){
            $rootScope.supportLanguages = $scope.supportLanguages;
            TSVService.setCustomMachineSetting("languageSupported", $scope.supportLanguages);
            TSVService.cache.custommachinesettings.languageSupported = $scope.supportLanguages;
        }

        if(('bHasShoppingCart' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.bHasShoppingCart != $scope.bHasShoppingCart)){
            TSVService.setCustomMachineSetting("bHasShoppingCart", $scope.bHasShoppingCart);
            TSVService.cache.custommachinesettings.bHasShoppingCart = $scope.bHasShoppingCart;
        }

        if(('singleProductDonation' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.singleProductDonation != $scope.singleProductDonation)){
            TSVService.setCustomMachineSetting("singleProductDonation", $scope.singleProductDonation);
            TSVService.cache.custommachinesettings.singleProductDonation = $scope.singleProductDonation;
        }

        if(('minimumDonationAmount' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.minimumDonationAmount != $scope.minimumDonationAmount)){
            TSVService.setCustomMachineSetting("minimumDonationAmount", $scope.minimumDonationAmount);
            TSVService.cache.custommachinesettings.minimumDonationAmount = $scope.minimumDonationAmount;
        }
    }
}]);