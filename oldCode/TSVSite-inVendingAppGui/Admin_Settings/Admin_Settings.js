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

kbApp.controller('Admin_SettingsCtrl', ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
    function($scope, $rootScope, $timeout, $location, TsvService, translate) {

    $scope.translate = function(name){
        return translate.translate("Admin_Settings", name);
    };

    $rootScope.updateCredit();
    TsvService.session.currentView = "Admin_Settings";

    if(Object.getOwnPropertyNames(TsvService.cache.machineSettings).length === 0){
        TsvService.cache.machineSettings = TsvService.fetchAllMachineSettings();
    }

    $scope.defaultLanguage = TsvService.cache.machineSettings.defaultLanguage;
    $scope.ccProcessorMode = TsvService.cache.machineSettings.CCProcessorMode;
    $scope.machineSerialNumber = TsvService.cache.machineSettings.MachineSerialNumber;
    $scope.merchantKey = TsvService.cache.machineSettings.CCMerchantKey;
    $scope.merchantID = TsvService.cache.machineSettings.CCMerchantID;
    $scope.dropSensorAttached = TsvService.cache.machineSettings.DropSensorAttached;
    $scope.ccReaderType = TsvService.cache.machineSettings.CCReaderType;
    $scope.vmcPlatform = TsvService.cache.machineSettings.VMCPlatform;
    $scope.machineCount = TsvService.cache.machineSettings.MachineCount;
    $scope.comPort = TsvService.cache.machineSettings.VMCControlCOMPort;
    $scope.salesTaxRate = TsvService.cache.machineSettings.SalesTaxRate;
    $scope.shoppingCartMaxItemCount = TsvService.cache.machineSettings.ShoppingCartMaxItemCount;
    $scope.bHasShoppingCart = TsvService.cache.custommachinesettings.bHasShoppingCart;
    $scope.singleProductDonation = TsvService.cache.custommachinesettings.singleProductDonation;
    $scope.minimumDonationAmount = TsvService.cache.custommachinesettings.minimumDonationAmount;

    var defaultLanguage = (('languageDefaulted' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.languageDefaulted != ""))?TsvService.cache.custommachinesettings.languageDefaulted:"En";
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
        TsvService.cache.custommachinesettings.languageDefaulted = dfltLang;
        TsvService.setCustomMachineSetting("languageDefaulted", TsvService.cache.custommachinesettings.languageDefaulted);
    };

    //Card Processor Mode
    var y = document.getElementById("cardProcessorMode");
    option = document.createElement("option");
    option.text = "Production";
    y.add(option);

    option = document.createElement("option");
    option.text = "Certification";
    y.add(option);

    $("#cardProcessorMode").val(TsvService.cache.machineSettings.CCProcessorMode);

    document.getElementById('cardProcessorMode').onchange = function () {
        TsvService.cache.machineSettings.CCProcessorMode = $("#cardProcessorMode").val();
        TsvService.setMachineSetting("CCProcessorMode", TsvService.cache.machineSettings.CCProcessorMode);
    };

    $scope.backToAdminHome = function(){
        TsvService.removeKeyboard();
        $location.path("/Admin_Home");
    };

    //need to save data in sql database
    $scope.save = function(){
        console.log("save!");
        if(TsvService.cache.machineSettings.MachineSerialNumber != $scope.machineSerialNumber){
            TsvService.setMachineSetting("MachineSerialNumber", $scope.machineSerialNumber);
            TsvService.cache.machineSettings.MachineSerialNumber = $scope.machineSerialNumber;
        }

        if(TsvService.cache.machineSettings.CCMerchantKey != $scope.merchantKey){
            TsvService.setMachineSetting("CCMerchantKey", $scope.merchantKey);
            TsvService.cache.machineSettings.CCMerchantKey = $scope.merchantKey;
        }

        if(TsvService.cache.machineSettings.CCMerchantID != $scope.merchantID){
            TsvService.setMachineSetting("CCMerchantID", $scope.merchantID);
            TsvService.cache.machineSettings.CCMerchantID = $scope.merchantID;
        }

        if(TsvService.cache.machineSettings.DropSensorAttached != $scope.dropSensorAttached){
            TsvService.setMachineSetting("DropSensorAttached", $scope.dropSensorAttached);
            TsvService.cache.machineSettings.DropSensorAttached = $scope.dropSensorAttached;
        }

        if(TsvService.cache.machineSettings.CCReaderType != $scope.ccReaderType){
            TsvService.setMachineSetting("CCReaderType", $scope.ccReaderType);
            TsvService.cache.machineSettings.CCReaderType = $scope.ccReaderType;
        }

        if(TsvService.cache.machineSettings.VMCPlatform != $scope.vmcPlatform){
            TsvService.setMachineSetting("VMCPlatform", $scope.vmcPlatform);
            TsvService.cache.machineSettings.VMCPlatform = $scope.vmcPlatform;
        }

        if(TsvService.cache.machineSettings.MachineCount != $scope.machineCount){
            TsvService.setMachineSetting("MachineCount", $scope.machineCount);
            TsvService.cache.machineSettings.MachineCount = $scope.machineCount;
        }

        if(TsvService.cache.machineSettings.VMCControlCOMPort != $scope.comPort){
            TsvService.setMachineSetting("VMCControlCOMPort", $scope.comPort);
            TsvService.cache.machineSettings.VMCControlCOMPort = $scope.comPort;
        }

        if(TsvService.cache.machineSettings.SalesTaxRate != $scope.salesTaxRate){
            TsvService.setMachineSetting("SalesTaxRate", $scope.salesTaxRate);
            TsvService.cache.machineSettings.SalesTaxRate = $scope.salesTaxRate;
        }

        if(TsvService.cache.machineSettings.ShoppingCartMaxItemCount!= $scope.shoppingCartMaxItemCount){
            TsvService.setMachineSetting("ShoppingCartMaxItemCount", $scope.shoppingCartMaxItemCount);
            TsvService.cache.machineSettings.shoppingCartMaxItemCount = $scope.shoppingCartMaxItemCount;
        }

        if(('languageSupported' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.languageSupported != $scope.supportLanguages)){
            $rootScope.supportLanguages = $scope.supportLanguages;
            TsvService.setCustomMachineSetting("languageSupported", $scope.supportLanguages);
            TsvService.cache.custommachinesettings.languageSupported = $scope.supportLanguages;
        }

        if(('bHasShoppingCart' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.bHasShoppingCart != $scope.bHasShoppingCart)){
            TsvService.setCustomMachineSetting("bHasShoppingCart", $scope.bHasShoppingCart);
            TsvService.cache.custommachinesettings.bHasShoppingCart = $scope.bHasShoppingCart;
        }

        if(('singleProductDonation' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.singleProductDonation != $scope.singleProductDonation)){
            TsvService.setCustomMachineSetting("singleProductDonation", $scope.singleProductDonation);
            TsvService.cache.custommachinesettings.singleProductDonation = $scope.singleProductDonation;
        }

        if(('minimumDonationAmount' in TsvService.cache.custommachinesettings) && (TsvService.cache.custommachinesettings.minimumDonationAmount != $scope.minimumDonationAmount)){
            TsvService.setCustomMachineSetting("minimumDonationAmount", $scope.minimumDonationAmount);
            TsvService.cache.custommachinesettings.minimumDonationAmount = $scope.minimumDonationAmount;
        }
    }
}]);