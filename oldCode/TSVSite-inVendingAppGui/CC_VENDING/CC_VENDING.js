'use strict';

angular.module('myApp.CC_VENDING', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/CC_VENDING', {
            templateUrl: 'CC_VENDING/CC_VENDING.html',
            controller: 'CC_VENDINGCtrl'
        });
    }])

    .controller('CC_VENDINGCtrl', ['$scope', '$timeout', '$location', 'TsvService', function($scope, $timeout, $location, TsvService) {
        TsvService.session.currentView = "CC_VENDING";
        TsvService.disablePaymentDevice();
        TsvService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
        $scope.item = TsvService.cache.shoppingCart.detail[0];
        $scope.summary = TsvService.cache.shoppingCart.summary;
        $scope.cardTransactionResponse = TsvService.session.msg;
        $scope.showCancelBtn = true;
        var promise;

        if(TsvService.session.msg == "Error"){
            promise = $timeout(function(){
                console.log("cardErrorTimeout()");
                TsvService.session.msg = "Please Swipe Card...";
                $scope.cardTransactionResponse = TsvService.session.msg;
            },3000);
        }

        startPaymentTimer();

        if(TsvService.session.bVendingInProcess){
            $scope.cardTransactionResponse = "Vending...";//TsvService.session.msg;
            loadingSpinner();
        }

        TsvService.subscribe("cardTransactionResponse", function(level) {
            if(TsvService.session.currentView != "CC_VENDING") return;

            if(!TsvService.session.bVendingInProcess){
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
                        TsvService.session.msg = "Vending...";
                        TsvService.startVend();
                        TsvService.session.bVendingInProcess = true;
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
            $timeout.cancel(TsvService.session.paymentTimer);
            $timeout.cancel(TsvService.session.adminTimer);
            $timeout.cancel(TsvService.session.thankyouTimer);
            $timeout.cancel(TsvService.session.vendErrorTimer);
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
            TsvService.emptyCart();
            $location.path("/view1");
            $timeout.cancel(TsvService.paymentTimer);
            $timeout.cancel(promise);
        }

        // KENT NOTE: isFullSuccessVendResult() is also in TsvServices, identical.
        // please call that one instead of this local one, remove local one.

        //to handle partial vend error for multi-vending
        function isFullSuccessVendResult(){
            console.log("Hi Ping Debug isFullSuccessVendResult() is called!");
            TsvService.session.vendSettleTotal =  $scope.summary.netTotalPrice;
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
            TsvService.session.paymentTimer = $timeout(function(){
                console.log("Hi Ping Debug paymentTimer timeout");
                TsvService.emptyCart();
                $location.path("/view1");
            }, TsvService.cache.custommachinesettings.paymentPageTimeout)
        }

        function resetPaymentTimer(){
            console.log("Hi Ping Debug reset the paymentTimer");
            stopPaymentTimer();
            startPaymentTimer();
        }

        function stopPaymentTimer(){
            console.log("Hi Ping Debug stop the paymentTimer");
            $timeout.cancel(TsvService.session.paymentTimer);
        }
    }]);

