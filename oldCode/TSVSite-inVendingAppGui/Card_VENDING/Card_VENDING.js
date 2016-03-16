'use strict';

angular.module('myApp.Card_Vending', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/Card_Vending', {
            templateUrl: 'Card_Vending/Card_Vending.html',
            controller: 'Card_VendingCtrl'
        });
    }])

    .controller('Card_VendingCtrl', ['$scope', '$rootScope','$timeout', '$location', 'TSVService', 'translate',
        function($scope, $rootScope, $timeout, $location, TSVService, translate) {

        console.log("Card_VendingCtrl()");
	
        $rootScope.bDisplayCgryNavigation = false;
	    
	$scope.translate = function(name){
	    return translate.translate("Card_Vending", name);
	};

        $rootScope.updateCredit();
        TSVService.session.currentView = "Card_Vending";
        TSVService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
        $scope.cart = TSVService.cache.shoppingCart.detail;
        $scope.item = TSVService.cache.shoppingCart.detail[0];

        $scope.summary = TSVService.cache.shoppingCart.summary;
        $scope.TotalPriceLabel = $scope.translate("TotalPriceLabel");
        $scope.cardTransactionResponse = $scope.translate("InstructionMessage");
        $scope.showCancelBtn = true;
            console.log("$scope.summary.TotalPrice: "+$scope.summary.TotalPrice);

        // TODO: use state variable(s) not messages!
        if(TSVService.session.cardMsg != $scope.translate("ProcessingMessage")
            && TSVService.session.cardMsg != $scope.translate("VendingMessage")
            && TSVService.session.cardMsg != $scope.translate("InstructionMessage")) {
            startCardErrorTimer();
        }

        resetPaymentTimer();

        if(TSVService.session.bVendingInProcess) {
            $scope.cardTransactionResponse = $scope.translate("VendingMessage");
            $scope.showCancelBtn = false;
            TSVService.loadingSpinner();
        }

        function startCardErrorTimer() {
            TSVService.session.cardErrorTimer = $timeout(function(){
                console.log("cardErrorTimeout()");
                TSVService.session.cardMsg = $scope.translate("InstructionMessage");
                $scope.cardTransactionResponse = TSVService.session.cardMsg;
            },3000);
        }

        function killCardErrorTimer(){
            console.log("CardErrorTimer()");
            $timeout.cancel(TSVService.session.cardErrorTimer);
        }

        function killTimers(){
            console.log("killTimers()");
            $timeout.cancel(TSVService.session.paymentTimer);
            $timeout.cancel(TSVService.session.cardErrorTimer);
        }

        $scope.cancel = function(){
            stopPaymentTimer();
            TSVService.emptyCart();
            TSVService.gotoDefaultIdlePage($location, $rootScope);
            killTimers();
        };

        function startPaymentTimer(){
            //console.log("Debug startPaymentTimer");
            TSVService.session.paymentTimer = $timeout(function(){
                console.log("Debug paymentTimer timeout");
                TSVService.emptyCart();
                TSVService.gotoDefaultIdlePage($location, $rootScope);
                console.log("Hi Ping Payment Timer "+TSVService.cache.custommachinesettings.paymentPageTimeout);
            }, TSVService.cache.custommachinesettings.paymentPageTimeout)
        }

        function resetPaymentTimer(){
            //console.log("Debug reset the paymentTimer");
            stopPaymentTimer();
            startPaymentTimer();
        }

        function stopPaymentTimer(){
            //console.log("Debug stop the paymentTimer");
            $timeout.cancel(TSVService.session.paymentTimer);
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
            TSVService.disablePaymentDevice();
            killTimers();
            TSVService.loadingSpinner();
            $scope.showCancelBtn = false;
            TSVService.session.cardMsg = translate.translate("Vending", "Vending");
            TSVService.debug("Card Approved should vend...");
            TSVService.startVend();
            TSVService.setVendingInProcessFlag();
        }

        var cardTransactionHandler = function(level) {
            console.log("Card_Vending Got event cardTransactionResponse(): "+level);
            killCardErrorTimer();
            resetPaymentTimer();

            if(!TSVService.session.bVendingInProcess){
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

		TSVService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.cardVending");

		$scope.$on('$destroy', function() {
			TSVService.unsubscribe("cardTransactionResponse", "app.cardVending");
		});

		var vendResponseHandler = function(processStatus){
			TSVService.vendResponse(processStatus, $location);
			stopPaymentTimer();
		};

		TSVService.subscribe("vendResponse", vendResponseHandler, "app.cardVending");

		$scope.$on('$destroy', function() {
			TSVService.unsubscribe("vendResponse", "app.cardVending");
		});

		if ($scope.summary.TotalPrice < 0.01) {
			console.log("$scope.summary.TotalPrice: "+$scope.summary.TotalPrice);
			console.log("$scope.summary.TotalPrice less than 0.01 should start vend");
			startVend();
		}
	}]);