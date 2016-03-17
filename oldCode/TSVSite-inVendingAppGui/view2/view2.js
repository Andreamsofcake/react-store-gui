'use strict';

var app = angular.module('myApp.view2', ['ngRoute', 'ngFitText'])

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}]);

// KENT SAYS: no imageonload directives...
// NOTE: this is to automagically resize an image to optimally fit in a box on the screen.
/*
app.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                console.log("image is loaded!!");

                //returns an object that contains the new width and height
                function fitRectIntoBounds(rect, bounds) {
                    console.log("Hi Ping Debug fitRectIntoBounds()");
                    var rectRatio = rect.width / rect.height;
                    var boundsRatio = bounds.width / bounds.height;
                    var newDimensions = {};
                    //console.log("rectRatio: "+rectRatio);
                    //console.log("boundsRatio: "+boundsRatio);

                    // Rect is more landscape than bounds - fit to width
                    if(rectRatio > boundsRatio) {
                        newDimensions.width = bounds.width;
                        newDimensions.height = rect.height * (bounds.width / rect.width);
                    }
                    // Rect is more portrait than bounds - fit to height
                    else {
                        newDimensions.width = rect.width * (bounds.height / rect.height);
                        newDimensions.height = bounds.height;
                    }

                    //console.log("newDimensions.width: "+newDimensions.width);
                    //console.log("newDimensions.height: "+newDimensions.height);
                    return newDimensions;
                }

                var frame = $("#tdImg");
                var img = $("#aImg").find('img');
                //console.log("img.width: "+img.get(0).naturalWidth);
                //console.log("img.height: "+img.get(0).naturalHeight);
                //console.log("frame.width(): "+frame.width());
                //console.log("frame.height(): "+frame.height());

                // note: naturalSize does not work in IE8
                var realSize = {
                    width:  img.get(0).naturalWidth,
                    height: img.get(0).naturalHeight
                };

                var bounds = {
                    width:  frame.width(),
                    height: frame.height()
                };

                var resized = fitRectIntoBounds(realSize, bounds);

                var resizeStyle =
                      "width: " + resized.width + "px !important;"
                    + "height: " + resized.height + "px !important;"
                    + "top: " + (bounds.height - resized.height) / 2 + "px !important;"
                    + "left: " + (bounds.width - resized.width) / 2 + "px !important;";

                img.attr('style', resizeStyle);

                //img.css({
                //   width:  resized.width,
                //   height: resized.height,
                //   top:    (bounds.height - resized.height) / 2,
                //   left:   (bounds.width - resized.width) / 2
                //});
            });
        }
    };
});
*/

app.controller('View2Ctrl', ['$scope', '$rootScope', '$timeout','$location', 'TSVService', "translate",
    function($scope, $rootScope, $timeout, $location, TSVService, translate) {

        console.log("View2Ctrl()");

        $scope.bDisplayPrdGalleryOnDetailPage = false;
        $scope.bShowCheckout = true;

        $scope.path = $location.path();

        if(('bDisplayPrdGalleryOnDetailPage' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.bDisplayPrdGalleryOnDetailPage.toString().toLowerCase() === "true")){
            $rootScope.bDisplayPrdGalleryOnDetailPage = true;
        }

        $scope.translate = function(name){
            return translate.translate("view2", name);
        };

        if (!$rootScope.pvr) {
            TSVService.gotoDefaultIdlePage($location);
            return;
        }

        TSVService.session.currentView = "view2";
        $rootScope.bShowLanguage = false;
        TSVService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
        TSVService.enablePaymentDevice("PAYMENT_TYPE_CASH");
        TSVService.cache.shoppingCart = TSVService.fetchShoppingCart2();
        $scope.bShowCouponBtn = false;
        //$rootScope.itemsInCart = TSVService.cache.shoppingCart.detail.qtyInCart;

        // TODO: refactor to explicitly treat this as "state"
        TSVService.session.cardMsg = translate.translate("Card_Vending", "InstructionMessage");
        TSVService.session.cashMsg = translate.translate("Cash_Vending", "HintMessageInsertCash");

        TSVService.resetGeneralIdleTimer($location,$rootScope);

        if ($rootScope.bInsufficientFunds) {
            // this happens when redirected due to cashless session begin
            // but insufficient funds on account to pay for cart
            $rootScope.bInsufficientFunds = false;
            $scope.instructionMessage = "InsufficientFunds";
        } else {
            $scope.instructionMessage = "InstructionMessage";
        }
        $scope.item = $rootScope.pvr;//TSVService.cache.shoppingCart.detail[0];
        console.log("pvr.productID2: "+$rootScope.pvr.productID);
        console.log("pvr.price: "+$rootScope.pvr.price);
        $scope.bShowCheckout = !TSVService.isCartEmpty();

        for(var i=0; i<TSVService.cache.shoppingCart.detail.length; i++)
        {
            console.log("Found!");
            if(TSVService.cache.shoppingCart.detail[i].productID == $rootScope.pvr.productID){
                $scope.item = TSVService.cache.shoppingCart.detail[i];
                break;
            }
        }

        $scope.imagePath = $scope.item.imagePath;
        $scope.imagePath2 = $scope.imagePath;
        $scope.summary = TSVService.cache.shoppingCart.summary;
        $rootScope.summary = $scope.summary;

        $rootScope.updateCredit();
        $scope.nutritionFactsUrl = "";
        $scope.bShowNutritionFactsBtn = false;
        $scope.bShowCalories = false;
        $scope.calories = "0 Cal";
        $scope.bShowDesc = false;
        $scope.productName = $scope.item.productName;//default
        $scope.productDescription = $scope.item.description;
        $scope.bDisplayNavCgry = true;

        if($scope.item.description == ""){
            $scope.bShowDesc = false;
        }

        if(TSVService.cache.custommachinesettings.bHasShoppingCart.toLowerCase() === "true"){
            $scope.checkoutOrAddToCartUrl = $rootScope.localizedImage('addToCart.png');
        }else{
            $scope.checkoutOrAddToCartUrl = $rootScope.localizedImage('checkout.png');
            if(('bHasCouponCodes' in TSVService.cache.custommachinesettings) && (TSVService.cache.custommachinesettings.bHasCouponCodes != "")){
                if(TSVService.cache.custommachinesettings.bHasCouponCodes.toLowerCase() === "true"){
                    $scope.bShowCouponBtn = true;
                }
            }
        }

        if(('Attributes' in $scope.item) && $scope.item.Attributes != null) {
            var attributeName = $rootScope.selectedLanguage + "ProductName";

            if ((attributeName in $scope.item.Attributes) && ($scope.item.Attributes[attributeName] != null)) {
                console.log("Localized productName: " + attributeName + " = " + $scope.productName);
                $scope.productName = $scope.item.Attributes[attributeName][0];
            }

            if(('AltLangImageGroup' in $scope.item.Attributes) && ($scope.item.Attributes.AltLangImageGroup != null)){
                for (var i=0; i<Object.keys($scope.item.Attributes.AltLangImageGroup).length; i++){
                    if($scope.item.Attributes.AltLangImageGroup[i].toLowerCase().indexOf($rootScope.selectedLanguage.toLowerCase()) > -1){
                        $scope.imagePath = "../Images/Products/"+$scope.item.productID+"_"+$scope.item.Attributes.AltLangImageGroup[i];
                        $scope.imagePath2 = $scope.imagePath;
                        console.log("AltLangImageGroup url: "+$scope.imagePath);
                        break;
                    }
                }
            }

            // Kent says: skip these two if's:
            /*
            if(('NutritionalFactsImages' in $scope.item.Attributes) && ($scope.item.Attributes.NutritionalFactsImages != null)){
                console.log("NutritionFactImageURL: "+$scope.item.Attributes.NutritionalFactsImages[0]);

                $scope.nutritionFactsUrl = "../Images/Products/"+$scope.item.productID+"_"+$scope.item.Attributes.NutritionalFactsImages[0];
                $scope.imagePath2 = $scope.nutritionFactsUrl;
                $scope.bShowNutritionFactsBtn = true;

                if($rootScope.bDualLanguage){
                    for (var j=0; j<Object.keys($scope.item.Attributes.NutritionalFactsImages).length; j++){
                        if($scope.item.Attributes.NutritionalFactsImages[j].toLowerCase().indexOf($rootScope.selectedLanguage.toLowerCase()) > -1){
                            $scope.nutritionFactsUrl = "../Images/Products/"+$scope.item.productID+"_"+$scope.item.Attributes.NutritionalFactsImages[j];
                            $scope.imagePath2 = $scope.nutritionFactsUrl;
                            break;
                        }
                    }
                }
            }

            if(('Calories' in $scope.item.Attributes) && ($scope.item.Attributes.Calories != null)){
                $scope.bShowCalories = true;
                $scope.calories = $scope.item.Attributes.Calories[0] + " Cal";
            }
            */
        }



		// KENT SAYS: skip all this jquery stuff:
		/*
        $(document).ready(function() {

            if(typeof $.fancybox !== "undefined"){

                $(".fancyboxNutrition0").fancybox({
                    openEffect	: 'none',
                    closeEffect	: 'none',
                    closeClick  : true,
                    openSpeed: 250,

                    tpl: {
                        closeBtn : '<a title="" class="fancybox-item fancybox-close" href="javascript:;"></a>'
                    },

                    //content: $("#preloadedNutritionImg"),//doesn't make much difference
                    type: 'image',

                    helpers   : {
                        title: 'none',
                        overlay : {
                            showEarly  : true,
                            css : {
                                'overflow' : 'hidden',
                                'cursor':'none'
                            }
                        }
                    }
                });

                $(".fancyboxNutrition1").fancybox({
                    type: 'image',
                    openEffect	: 'none',
                    closeEffect	: 'none',
                    closeClick  : true,
                    openSpeed: 250,

                    tpl: {
                        closeBtn : '<a title="" class="fancybox-item fancybox-close" href="javascript:;"></a>'
                    },

                    helpers   : {
                        title: 'none',
                        overlay : {
                            showEarly  : true,
                            css : {
                                'overflow' : 'hidden',
                                'cursor':'none'
                            }
                        }
                    }
                });

                $(".fancyboxNutrition2").fancybox({
                    type: 'image',
                    openEffect	: 'none',
                    closeEffect	: 'none',
                    closeClick  : true,
                    openSpeed: 250,

                    tpl: {
                        closeBtn : '<a title="" class="fancybox-item fancybox-close" href="javascript:;"></a>'
                    },

                    helpers   : {
                        title:'none',
                        overlay : {
                            showEarly  : true,
                            css : {
                                'overflow' : 'hidden',
                                'cursor':'none'
                            }
                        }
                    }
                });
            }
        });
        */

        $scope.back = function() {
            if(TSVService.cache.custommachinesettings.bHasShoppingCart.toString().toLowerCase() === "false"){
                TSVService.emptyCart();
                $rootScope.itemsInCart = 0;
            }

            TSVService.gotoDefaultIdlePage($location, $rootScope);
        };

        var cardTransactionHandler = function(level) {
            console.log("Got event cardTransactionResponse()default: "+level);

            $.fancybox.close();

            if ($location.path() != $scope.path) {
                console.log("Path doesn't match. Not for view2, ignoring")
                return;
            }

            TSVService.cardTransaction(level);

            if(!TSVService.session.bVendingInProcess) {
                switch(level){
                    case "CARD_INVALID_READ":
                    case "CARD_DECLINED":
                    case "CARD_CONNECTION_FAILURE":
                    case "CARD_UNKNOWN_ERROR":
                        //Do nothing, don't go to card_vending page
                        break;
                    default:
                        if($location.path() != "/Card_Vending"){
                            $location.path("/Card_Vending");
                        }
                        break;
                }
            } else {
                console.log("Ignoring credit card event, from view2, vend is in progress?");
            }
        };

        TSVService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.view2");

}]);