'use strict';

angular.module('myApp.cash', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/cash', {
            templateUrl: 'cash/cash.html',
            controller: 'CashCtrl'
        });
    }])

    .controller('CashCtrl',  ['$scope', '$timeout', '$location', 'TsvService', function($scope, $timeout, $location, TsvService) {
        TsvService.session.currentView = "cash";
        TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");

        $scope.summary = TsvService.cache.shoppingCart.summary;
        $scope.insertedAmount = TsvService.session.inserted;
        $scope.hintMsg = "Insert Cash Now....";
        $scope.showCancelBtnCash = true;
        $scope.item = TsvService.cache.shoppingCart.detail[0];
        startPaymentTimer();

        if(TsvService.session.bVendingInProcess){
            $scope.hintMsg = "Vending...";
            $scope.showCancelBtnCash = false;
            loadingSpinner();
            stopPaymentTimer();
        }

        $scope.cancel = function(){
            TsvService.emptyCart();
            TsvService.session.inserted = 0;
            stopPaymentTimer();
            $location.path("/view1");
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

        // KENT NOTE: pass "view1" to the TsvService.startPaymentTimer() here
        function startPaymentTimer(){
            console.log("Hi Ping Debug startPaymentTimer");
            TsvService.session.paymentTimer = $timeout(function(){
                console.log("Hi Ping Debug paymentTimer timeout");
                TsvService.emptyCart();
                TsvService.session.inserted = 0;
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

        TsvService.subscribe("creditBalanceChanged", function(ins, balance){
            if(TsvService.session.currentView != "cash")    return;

            console.log("Got event cash creditBalanceChanged: "+ins+" balance: "+balance);
            TsvService.session.inserted = balance/100.00;
            TsvService.session.creditBalance = $scope.summary.TotalPrice - (balance/100.00);
            $scope.insertedAmount = TsvService.session.inserted;

            checkBalance();
            resetPaymentTimer();
        });

        function checkBalance(){
            console.log("Hi Ping Debug checkBalance()!");
            var total = TsvService.cache.shoppingCart.summary.TotalPrice;

            if((TsvService.session.inserted * 100) >= (total * 100) && TsvService.cache.shoppingCart.detail.length > 0){
                TsvService.disablePaymentDevice();
                if(!TsvService.session.bVendingInProcess){
                    $scope.hintMsg = "Vending...";
                    TsvService.startVend();
                    loadingSpinner();
                    $scope.showCancelBtnCash = false;
                    TsvService.session.bVendingInProcess = true;
                }
                return 1;
            }
            return -1;
        }
    }]);
