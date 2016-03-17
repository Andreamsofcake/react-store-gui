import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Card_Vending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Card_Vending');
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.updateCredit();
    TsvService.enablePaymentDevice()
    this.state = {
      cart: RootscopeStore.getCache('shoppingCart.detail'),
      item: RootscopeStore.getCache('shoppingCart.detail')[0],
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      showCancelBtn: true,
      cardTransactionResponse: Translate.translate('Card_Vending', 'InstructionMessage')
    };
    TsvService.resetPaymentTimer();

    if(RootscopeStore.getSession('cardMsg')!= Translate.translate('ProcessingMessage')
      && RootscopeStore.getSession('cardMsg')!= Translate.translate('VendingMessage')
      && RootscopeStore.getSession('cardMsg')!= Translate.translate('InstructionMessage')
      ){
      TsvService.startCardErrorTimer();
     }

    if(RootscopeStore.getSession('bVendingInProcess')){
       this.state.showSpinner = true;
       this.state.cardTransactionResponse = Translate.translate('Card_Vending', "VendingMessage");
       this.state.showCancelBtnCash = false;
     }

    if (this.state.summary.TotalPrice < 0.01) {
 			console.log("this.summary.TotalPrice: "+ this.summary.TotalPrice);
 			console.log("this.summary.TotalPrice less than 0.01 should start vend");
 			this.startVend();
 		}

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

  startVend() {
      TsvServicesService.disablePaymentDevice();
      TsvService.killTimers();
      RootscopeActions.setSession('cardMsg', Translate.translate("Vending", "Vending"));
      //TsvService.debug("Card Approved should vend...");
      TsvService.startVend();
      TsvService.setVendingInProcessFlag();
      this.setState({
        cardTransactionRespose: Translate.translate("Vending", "Vending"),
        showSpinner: true,
        showCancelBtn: false
      })
  }

  cancel(){
    TsvService.stopPaymentTimer();
    TsvService.emptyCart();
    TsvService.gotoDefaultIdlePage();
  }

  // Add change listeners to stores
	cardTransactionHandler(level) {

		TsvService.killCardErrorTimer();
		TsvService.resetPaymentTimer();
		var msg;

		if (!RootscopeStore.getSession('bVendingInProcess')) {

			switch(level){
				case "CARD_INSERTED":
					msg = Translate.translate("ProcessingMessage");
					break;

				case "CARD_PROCESSING":
					msg = Translate.translate("ProcessingMessage");
					break;

				case "CARD_APPROVED":
					startVend();
					break;

				case "CARD_INVALID_READ":
					msg = Translate.translate("CardInvalidMessage");
					TsvService.startCardErrorTimer();
					break;

				case "CARD_DECLINED":
					msg =  Translate.translate("CardDeclinedMessage");
					TsvService.startCardErrorTimer();
					break;

				case "CARD_CONNECTION_FAILURE":
					msg = Translate.translate("CardConnectionErrorMessage");
					TsvService.startCardErrorTimer();
					break;

				case "CARD_UNKNOWN_ERROR":
					msg = Translate.translate("CardUnknownErrorMessage");
					TsvService.startCardErrorTimer();
					break;

				default:
					console.log("Card_Vending Got event cardTransactionResponse()default: "+level);
					msg = Translate.translate("ErrorMessage");
					TsvService.startCardErrorTimer();
					break;
			}
			
			this.setState({
				cardTransactionResponse: msg
			});
		}
  }

	componentDidMount() {

		// this function has no ties to "this", so can be anonymous:
		var vendResponseHandler = function(processStatus){
			TsvService.vendResponse(processStatus);
			TsvService.stopPaymentTimer();
	  };
    TsvService.subscribe("cardTransactionResponse", this.cardTransactionHandler.bind(this), "app.cardVending");
    TsvService.subscribe("vendResponse", vendResponseHandler, "app.cardVending");
	}
  
  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.cardVending");
    TsvService.unsubscribe("vendResponse", "app.cardVending");
  }

  render() {
    return (
      <div className="Card_Vending" >
        <h2>{Translate.translate('Card_Vending', 'CardVending')}</h2>
        <table className="cart">

            <tr>
              {cart.map((prd, $index) => {
                return(
                  <td key={$index}>

                      <img id="prdImg" src={ prd.imagePath } alt="productImage"/> {/*err-src="../Images/ProductImageNotFound.png"*/}

                  </td>
                )}
              )}

            </tr>

        </table>

        { if (this.state.summary.TotalPrice >= 1) { this.renderTotalPriceLabel()} }

        <p id = "cardResponse">{ this.state.cardTransactionResponse }</p>

        <img id="creditCards" src="../Images/creditcards.png" alt="creditcards" />

        { if (this.state.showCancelBtnCash) { this.renderCancelBtnCash()} }

        { if (this.state.showSpinner) { this.renderSpinner()} }
      </div>
    );
  }

  renderCancelBtnCash(){
    return(
      <img id="cancelImg" src="../Images/cancel.png" onClick={this.cancel()} />
    )
  }

  renderTotalPriceLabel() {
    return(
      <p { Translate.translate('Card_Vending', 'TotalPriceLabel')}{TsvService.currencyFilter(this.summary.TotalPrice) }</p>
    )
  }

  renderSpinner(){
    return(
      <_E.Spinner size="md" type="inverted" />
    )
  }

}

export default Card_Vending
