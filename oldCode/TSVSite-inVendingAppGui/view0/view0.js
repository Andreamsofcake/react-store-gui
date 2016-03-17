'use strict';

function beep() {
}

angular.module('myApp.view0', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view0', {
    templateUrl: 'view0/view0.html',
    controller: 'View0Ctrl'
  });
}])

.controller('View0Ctrl', ['$scope', '$rootScope','$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {
            console.log("::view0");
            var bClickedOnce = false;

            $scope.reloadPage = function(){window.location.reload();}

            $scope.translate = function(name){
                return translate.translate("view0", name);
            };

            TSVService.session.currentView = "View0";

            TSVService.startGeneralIdleTimer($location, $rootScope);

            // KENT SAYS: we're not using jQuery, replace this document.ready with:
            console.error('<<<<        FIXME: need to attach events to click and mouseover globally to TsvService.resetGeneralIdleTimer()        >>>>');
            /*
            (function ($) {
                $(document).ready(function () {
                    $(document).bind('click mousemove', function() {
                        //console.log("Hi Ping reset general idle timer");
                        TSVService.resetGeneralIdleTimer($location, $rootScope);
                    });
                });
            }) (jQuery);
            */

            // KENT SAYS: replace the "$rootScope.gotoDefaultIdlePage" call with "TsvService.gotoDefaultIdlePage()"
            /*
            $rootScope.gotoDefaultIdlePage = function() {
                console.log("gotoDefaultIdlePage");

                // can't go to idle page until we get settings!
                if (TSVService.cache.custommachinesettings === undefined) {
                    $rootScope.reloadPage();
                    return;
                }

                if (TSVService.checkActivation().resultCode !== "SUCCESS") {
                    $location.path("/Activate");
                    return;
                }

                if(TSVService.customSetting('txtIdleScene', 'coil_keypad').toLowerCase() == "page_idle"){
                    $location.path("/Page_Idle");
                    return;
                }else{
                    if (TSVService.customSetting('singleProductDonation')) {
                        //console.log("Hi Ping notifyTSVReady from view0 to Make_Donation");
                        $location.path("/Make_Donation");
                        return;
                    }else{
                        if(TSVService.customSetting('txtSearchScene', 'coil_keypad').toLowerCase() === "coil_keypad"){
                            $location.path("/view1");
                            return;
                        } else if (TSVService.customSetting('txtSearchScene', 'coil_keypad').toLowerCase() === "category_search") {
                            if (TSVService.bCustomSetting('bCategoryView', 'false')){
                                $location.path("/Category_Search");
                                return;
                            }else{
                                $location.path("/Product_Search");
                                return;
                            }
                        }
                    }
                }
            };
			*/

            TSVService.subscribe("noEvent", function() {
                console.log("Got event noEvent");
                if ($location.path() == "/view0") {
                    console.log("Redirect");
                    $rootScope.gotoDefaultIdlePage();
                }
            }, "app.view0");

            TSVService.subscribe("linkDown", function() {
                console.log("Got event linkDown. Switching to /view0");
                window.location.href = "http://localhost:8085/index.html#/view0";
            }, "app.view0");

            $scope.admin = function(){
                if(bClickedOnce){
                    bClickedOnce = false;
                    console.log("Debug double-click need to go to Admin_Login");
                    $location.path("/Admin_Login");
                }else{
                    bClickedOnce = true;
                }
            };

            console.log("::view0 done");
    }]);