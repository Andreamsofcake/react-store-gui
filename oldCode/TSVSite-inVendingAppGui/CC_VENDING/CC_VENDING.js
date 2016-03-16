'use strict';

angular.module('myApp.CC_VENDING', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/CC_VENDING', {
            templateUrl: 'CC_VENDING/CC_VENDING.html',
            controller: 'CC_VENDINGCtrl'
        });
    }])

    .controller('CC_VENDINGCtrl', ['$scope', '$timeout', '$location', 'TSVService', function($scope, $timeout, $location, TSVService) {
        TSVService.session.currentView = "CC_VENDING";
        TSVService.disablePaymentDevice();
        TSVService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
        $scope.item = TSVService.cache.shoppingCart.detail[0];
        $scope.summary = TSVService.cache.shoppingCart.summary;
        $scope.cardTransactionResponse = TSVService.session.msg;
        $scope.showCancelBtn = true;
        var promise;

        if(TSVService.session.msg == "Error"){
            promise = $timeout(function(){
                console.log("cardErrorTimeout()");
                TSVService.session.msg = "Please Swipe Card...";
                $scope.cardTransactionResponse = TSVService.session.msg;
            },3000);
        }

        startPaymentTimer();

        if(TSVService.session.bVendingInProcess){
            $scope.cardTransactionResponse = "Vending...";//TSVService.session.msg;
            loadingSpinner();
        }

        TSVService.subscribe("cardTransactionResponse", function(level) {
            if(TSVService.session.currentView != "CC_VENDING") return;

            if(!TSVService.session.bVendingInProcess){
                $timeout.cancel(promise);
                resetPaymentTimer();
                switch(level){
                    case "CARD_INSERTED":
                        console.log("CC_VENDING Got event cardTransactionResponse(): "+level);
                        break;
                    case "CARD_PROCESSING":
                        console.log("CC_VENDING Got event cardTransactionResponse(): "+level);
                        $scope.cardTransactionResponse = "Processing...";
                        break;
                    case "CARD_APPROVED":
                        console.log("CC_VENDING Got event cardTransactionResponse(): "+level);
                        $scope.cardTransactionResponse = "Vending...";
                        killTimers();
                        loadingSpinner();
                        TSVService.session.msg = "Vending...";
                        TSVService.startVend();
                        TSVService.session.bVendingInProcess = true;
                        break;
                    default:
                        console.log("CC_VENDING Got event cardTransactionResponse()default: "+level);
                        $scope.cardTransactionResponse = "Error...";
                        $timeout(function(){
                            console.log("cardErrorTimeout()");
                            $scope.cardTransactionResponse = "Please Swipe Card...";
                        },3000);
                        break;
                }
            }
        });

        function killTimers(){
            console.log("Hi Ping Debug killTimers()");
            $timeout.cancel(TSVService.session.paymentTimer);
            $timeout.cancel(TSVService.session.adminTimer);
            $timeout.cancel(TSVService.session.thankyouTimer);
            $timeout.cancel(TSVService.session.vendErrorTimer);
        }

        function loadingSpinner(){
            console.log("loadingSpinner()");
            $scope.showCancelBtn = false;

            var canvas = document.getElementById('spinner');
            var context = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 200;
            canvas.style.width  = '200px';
            canvas.style.height = '200px';

            var start = new Date();
            var lines = 16,
                cW = canvas.width,
                cH = canvas.height;

            var draw = function() {
                var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
                context.save();
                context.clearRect(0, 0, cW, cH);
                context.translate(cW / 2, cH / 2);
                context.rotate(Math.PI * 2 * rotation);

                for (var i = 0; i < lines; i++) {
                    context.beginPath();
                    context.rotate(Math.PI * 2 / lines);
                    context.moveTo(cW/10, 0);
                    context.lineTo(cW/4, 0);
                    context.lineWidth = cW/30;
                    context.strokeStyle = "rgba(255, 255, 255," + i/lines + ")";
                    context.stroke();
                }
                context.restore();
            };
            window.setInterval(draw, 1000 / 30);
        }

        $scope.cancel = function(){
            TSVService.emptyCart();
            $location.path("/view1");
            $timeout.cancel(TSVService.paymentTimer);
            $timeout.cancel(promise);
        }

        // KENT NOTE: isFullSuccessVendResult() is also in TsvServices, identical.
        // please call that one instead of this local one, remove local one.

        //to handle partial vend error for multi-vending
        function isFullSuccessVendResult(){
            console.log("Hi Ping Debug isFullSuccessVendResult() is called!");
            TSVService.session.vendSettleTotal =  $scope.summary.netTotalPrice;
            var itemsVendFail = $scope.summary.vendFailCount;
            var itemsVendSuccess = $scope.summary.vendItemCount-itemsVendFail;

            if(itemsVendFail > 0){
                console.log("is it a fullVendSuccess?(false)!success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
                return false;
            }
            console.log("is it a fullVendSuccess?(true)success:("+itemsVendSuccess+")fail:("+itemsVendFail+")");
            return true;
        }

        // KENT NOTE: pass "view1" to the TsvService.startPaymentTimer() here
        function startPaymentTimer(){
            console.log("Hi Ping Debug startPaymentTimer");
            TSVService.session.paymentTimer = $timeout(function(){
                console.log("Hi Ping Debug paymentTimer timeout");
                TSVService.emptyCart();
                $location.path("/view1");
            }, TSVService.cache.custommachinesettings.paymentPageTimeout)
        }

        function resetPaymentTimer(){
            console.log("Hi Ping Debug reset the paymentTimer");
            stopPaymentTimer();
            startPaymentTimer();
        }

        function stopPaymentTimer(){
            console.log("Hi Ping Debug stop the paymentTimer");
            $timeout.cancel(TSVService.session.paymentTimer);
        }
    }]);

