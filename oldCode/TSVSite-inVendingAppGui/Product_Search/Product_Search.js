'use strict';
{/* Andrea refactor 3/14.*/}
angular.module('myApp.Product_Search', ['ngRoute', 'ngAnimate', 'ngTouch'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Product_Search', {
            templateUrl: 'Product_Search/Product_Search.html',
            controller: 'Product_SearchCtrl'
        });
    }])

    .controller('Product_SearchCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {
            $scope.bShowBackBtn = false;

            $scope.translate = function(name){
                return translate.translate("Product_Search", name);
            };

            $scope.setOpacity = function(stockCount){
                 if(stockCount == 0){
                     var style = "opacity:0.4";
                 }else{
                     var style = "opacity:1";
                 }
                 return style;
            };

            $scope.bDisplayCgry = false;

            $rootScope.updateCredit();

            //$rootScope.products = TsvService.fetchProduct();
            $rootScope.credit = TsvService.session.creditBalance;
            TsvService.session.currentView = "Product_Search";

            //$rootScope.products = TsvService.fetchProduct();
            if(TsvService.cache.custommachinesettings.bCategoryView.toString().toLowerCase() === "false"){
                $scope.products = TsvService.fetchProduct();
            }else{
                $scope.products = $rootScope.products;
                $scope.bShowBackBtn = true;
            }

            // initial image index
            $scope._Index = 0;

            // if a current image is the same as requested image
            $scope.isActive = function (index) {
                return $scope._Index === index;
            };

            // show prev image
            $scope.showPrev = function () {
                $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.products.length - 1;
            };

            // show next image
            $scope.showNext = function () {
                console.log("show next image");

                /*$(".flex-item").animate({
                    left: '-=600px',
                    opacity: '0.5'
                });*/
            };

            // show a certain image
            $scope.setPrdSelected = function (productID, stockCount, index) {
                console.log("Hi Ping Debug setPrdSelected()!!! productID: "+productID);
                //$("#prdImg"+index).css("opacity", 0);

                if(stockCount > 0){
                    $rootScope.pvr = TsvService.addToCartByProductID(productID);
                    $location.path("/view2");
                }
            };

            $scope.logoClicked = function(){
                TsvService.gotoDefaultIdlePage($location, $rootScope);
            };

            // show a certain image
            $scope.updateCategory = function (categoryID, $rootScope) {
                //$scope._Index = index;
                console.log("Need to update category2 : "+categoryID);
                $scope.products = TsvService.fetchProductByCategory(categoryID);
            };

            $scope.back = function(){
                $location.path("/Category_Search");
            };
  }])
