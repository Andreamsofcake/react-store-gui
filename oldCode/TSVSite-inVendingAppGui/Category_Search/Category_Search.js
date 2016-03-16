'use strict';

angular.module('myApp.Category_Search', ['ngRoute', 'ngAnimate', 'ngTouch'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Category_Search', {
            templateUrl: 'Category_Search/Category_Search.html',
            controller: 'Category_SearchCtrl'
        });
    }])

    .controller('Category_SearchCtrl',  ['$scope', '$rootScope', '$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            // $rootScope.bDisplayCgryNavigation = false;
            var bClickedOnce = false;
            // $scope.bShowCgryTitle = true;
            var topOffset = '500px';
            var col = 2;
            var row = 2;
            var left = 100;
            var leftOffset = left+'px';
            var color= 'red';
            $scope.myStyle = {'position':'absolute','left':leftOffset, 'top':topOffset};

            // if(TSVService.customSetting('txtIdleScene', txtIdleScene).toLowerCase() === "category_search"
            //     || !TSVService.isCartEmpty()) {
            //     console.log("Hi Ping Debug TSVService.session.generalIdleTimer is null and restart it");
            //     TSVService.startGeneralIdleTimer($location, $rootScope);
            // }

            // $scope.translate = function(name){
            //     return translate.translate("Category_Search", name);
            // };

            // $rootScope.updateCredit();
            // TSVService.session.currentView = "Category_Search";
            // $rootScope.cgryNavTitle = $scope.translate('SelectCategory');
            // $scope.bShowPrevArrow = false;//true;//false;
            // $scope.bShowNextArrow = false;//true;//false;
            // $rootScope.categories = TSVService.fetchProductCategoriesByParentCategoryID(0);

            $scope.back = function(){
                 //need to go back to the parent category page
                 //need to
            };

            $scope.admin = function(){
                if(bClickedOnce){
                    bClickedOnce = false;
                    $rootScope.bShowLanguage = false;
                    $rootScope.bShowCredit = false;
                    $location.path("/Admin_Login");
                }else{
                    bClickedOnce = true;
                }
            };

            // initial image index
            $scope._Index = 0;

            // if a current image is the same as requested image
            $scope.isActive = function (index) {
                return $scope._Index === index;
            };

            $scope.setPosition = function(index){
                console.log("Hi Ping index: "+index);
                var color= 'red';
                var style = "background-color:red; position: absolute; left:150px; top:200px"
                return style;
            };

            //show prev page
            $scope.showPrev = function () {
                $(".container_slider" ).animate({
                    marginLeft: '+=600px'
                }, 800, function() {
                    // Animation complete.
                });
            };

            //show next page
            $scope.showNext = function () {
                $(".container_slider" ).animate({
                    marginLeft: '-=600px'
                }, 800, function() {
                    // Animation complete.
                });
            };

            $rootScope.fetchCategory = function (categoryID) {
                console.log("Need to fetch category2 : "+categoryID);
                $rootScope.categories = TSVService.fetchProductCategoriesByParentCategoryID(categoryID);

                if($rootScope.categories.length == 0){
                    console.log("No more categories...");
                    $rootScope.products = TSVService.fetchProductByCategory(categoryID);
                    console.log($rootScope.products[0]);
                    $location.path("/Product_Search");
                }else{
                    console.log("more categories...");
                }
            };
    }]);
