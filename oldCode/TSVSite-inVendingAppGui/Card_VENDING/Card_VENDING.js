'use strict';

angular.module('myApp.Card_Vending', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Card_Vending', {
            templateUrl: 'Card_Vending/Card_Vending.html',
            controller: 'Card_VendingCtrl'
        });
    }])

    .controller('Card_VendingCtrl', ['$scope', '$rootScope','$timeout', '$location', 'TsvService', 'translate',
        function($scope, $rootScope, $timeout, $location, TsvService, translate) {

        console.log("Card_VendingCtrl()");
	
        $rootScope.bDisplayCgryNavigation = false;
	    
	$scope.translate = function(name){
	    return translate.translate("Card_Vending", name);
	};

        $rootScope.updateCredit();
        TsvService.session.currentView = "Card_Vending";
        TsvService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
        $scope.cart = TsvService.cache.shoppingCart.detail;
        $scope.item = TsvService.cache.shoppingCart.detail[0];

        $scope.summary = TsvService.cache.shoppingCart.summary;
        $scope.TotalPriceLabel = $scope.translate("TotalPriceLabel");
        $scope.cardTransactionResponse = $scope.translate("InstructionMessage");
        $scope.showCancelBtn = true;
            console.log("$scope.summary.TotalPrice: "+$scope.summary.TotalPrice);

        // TODO: use state variable(s) not messages!
        if(TsvService.session.cardMsg != $scope.translate("ProcessingMessage")
            && TsvService.session.cardMsg != $scope.translate("VendingMessage")
            && TsvService.session.cardMsg != $scope.translate("InstructionMessage")) {
            startCardErrorTimer();
        }

        resetPaymentTimer();

        if(TsvService.session.bVendingInProcess) {
            $scope.cardTransactionResponse = $scope.translate("VendingMessage");
            $scope.showCancelBtn = false;
            TsvService.loadingSpinner();
        }

        function startCardErrorTimer() {
            TsvService.session.cardErrorTimer = $timeout(function(){
                console.log("cardErrorTimeout()");
                TsvService.session.cardMsg = $scope.translate("InstructionMessage");
                $scope.cardTransactionResponse = TsvService.session.cardMsg;
            },3000);
        }

        function killCardErrorTimer(){
            console.log("CardErrorTimer()");
            $timeout.cancel(TsvService.session.cardErrorTimer);
        }

        function killTimers(){
            console.log("killTimers()");
            $timeout.cancel(TsvService.session.paymentTimer);
            $timeout.cancel(TsvService.session.cardErrorTimer);
        }

        $scope.cancel = function(){
            stopPaymentTimer();
            TsvService.emptyCart();
            TsvService.gotoDefaultIdlePage($location, $rootScope);
            killTimers();
        };

        function startPaymentTimer(){
            //console.log("Debug startPaymentTimer");
            TsvService.session.paymentTimer = $timeout(function(){
                console.log("Debug paymentTimer timeout");
                TsvService.emptyCart();
                TsvService.gotoDefaultIdlePage($location, $rootScope);
                console.log("Hi Ping Payment Timer "+TsvService.cache.custommachinesettings.paymentPageTimeout);
            }, TsvService.cache.custommachinesettings.paymentPageTimeout)
        }

        function resetPaymentTimer(){
            //console.log("Debug reset the paymentTimer");
            stopPaymentTimer();
            startPaymentTimer();
        }

        function stopPaymentTimer(){
            //console.log("Debug stop the paymentTimer");
            $timeout.cancel(TsvService.session.paymentTimer);
        }

        /****
        
			KENT NOTE: TsvService.startVend() is called in other numerous places,
			and is usually ONLY wrapped in a function,
			that is triggered on an event after a TsvService.subscribe() call
			
			this is the only place where there is an optional no-event-driven startVend()
			see below, this looks suspect:
				if ($scope.summary.TotalPrice < 0.01) {
			
			seems weird that the TotalPrice can sneak up on the app and suddenly be completed,
			
			probably bad logic surrounding the Credit Card processing etc,
				and assume it will be solved with better state management that we're doing.

        ****/

        function startVend() {
            console.log("Hi Ping Debug card_vending card_approved and start to vend");
            $scope.cardTransactionResponse = translate.translate("Vending", "Vending");
            TsvService.disablePaymentDevice();
            killTimers();
            TsvService.loadingSpinner();
            $scope.showCancelBtn = false;
            TsvService.session.cardMsg = translate.translate("Vending", "Vending");
            TsvService.debug("Card Approved should vend...");
            TsvService.startVend();
            TsvService.setVendingInProcessFlag();
        }

        var cardTransactionHandler = function(level) {
            console.log("Card_Vending Got event cardTransactionResponse(): "+level);
            killCardErrorTimer();
            resetPaymentTimer();

            if(!TsvService.session.bVendingInProcess){
                switch(level){
                    case "CARD_INSERTED":
                        $scope.cardTransactionResponse = $scope.translate("ProcessingMessage");
                        break;
                    case "CARD_PROCESSING":
                        $scope.cardTransactionResponse = $scope.translate("ProcessingMessage");
                        break;
                    case "CARD_APPROVED":
                        startVend();
                        break;
                    case "CARD_INVALID_READ":
                        $scope.cardTransactionResponse = $scope.translate("CardInvalidMessage");
                        startCardErrorTimer();
                        break;
                    case "CARD_DECLINED":
                        $scope.cardTransactionResponse =  $scope.translate("CardDeclinedMessage");
                        startCardErrorTimer();
                        break;
                    case "CARD_CONNECTION_FAILURE":
                        $scope.cardTransactionResponse = $scope.translate("CardConnectionErrorMessage");
                        startCardErrorTimer();
                        break;
                    case "CARD_UNKNOWN_ERROR":
                        $scope.cardTransactionResponse = $scope.translate("CardUnknownErrorMessage");
                        startCardErrorTimer();
                        break;
                    default:
                        console.log("Card_Vending Got event cardTransactionResponse()default: "+level);
                        $scope.cardTransactionResponse = $scope.translate("ErrorMessage");
                        startCardErrorTimer();
                        break;
				}
			}
		};

		TsvService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.cardVending");

		$scope.$on('$destroy', function() {
			TsvService.unsubscribe("cardTransactionResponse", "app.cardVending");
		});

		var vendResponseHandler = function(processStatus){
			TsvService.vendResponse(processStatus, $location);
			stopPaymentTimer();
		};

		TsvService.subscribe("vendResponse", vendResponseHandler, "app.cardVending");

		$scope.$on('$destroy', function() {
			TsvService.unsubscribe("vendResponse", "app.cardVending");
		});

		if ($scope.summary.TotalPrice < 0.01) {
			console.log("$scope.summary.TotalPrice: "+$scope.summary.TotalPrice);
			console.log("$scope.summary.TotalPrice less than 0.01 should start vend");
			startVend();
		}
	}]);