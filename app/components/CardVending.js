import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	updateCredit,
	resetPaymentTimer,
	killTimers,
	stopPaymentTimer,
	setVendingInProcessFlag,
	emptyCart,
	gotoDefaultIdlePage,
	vendResponse,
} from '../utils/TsvUtils'

import { currencyFilter } from '../utils/TsvUtils'

class Card_Vending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Card_Vending');
    //RootscopeActions.setCache('currentLocation', '/Card_Vending');

    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    updateCredit();
    TsvActions.apiCall('enablePaymentDevice', 'PAYMENT_TYPE_CREDIT_CARD');

    this.state = {
		cart: RootscopeStore.getCache('shoppingCart.detail'),
		// testing, this fails: (so setting differently below)
		//item: RootscopeStore.getCache('shoppingCart.detail')[0],
		summary: RootscopeStore.getCache('shoppingCart.summary'),
		showCancelBtn: true,
		cardTransactionResponse: Translate.translate('Card_Vending', 'InstructionMessage')
    };

	this.state.item = this.state.cart && this.state.cart.length ? this.state.cart[0] : false;

/*
    if (RootscopeStore.getSession('cardMsg')!= Translate.translate('ProcessingMessage')
		&& RootscopeStore.getSession('cardMsg')!= Translate.translate('VendingMessage')
		&& RootscopeStore.getSession('cardMsg')!= Translate.translate('InstructionMessage')
		) {
		TsvService.startCardErrorTimer();
	}
*/

    if (RootscopeStore.getSession('bVendingInProcess')){
		this.state.showSpinner = true;
		this.state.cardTransactionResponse = Translate.translate('Card_Vending', "VendingMessage");
		this.state.showCancelBtnCash = false;
    }

    //if (!this.state.summary || (this.state.summary && this.state.summary.TotalPrice < 0.01)) {
    if (this.state.summary && this.state.summary.TotalPrice < 0.01) {
		console.warn("this.summary.TotalPrice: "+ this.summary.TotalPrice);
		console.warn("this.summary.TotalPrice less than 0.01 should start vend");
		this.startVend();
	}
	
	this._onTsvChange = this._onTsvChange.bind(this);

    resetPaymentTimer();

  }

  /****

	>> dev note: below notes are way way stale, since Tsv has been blown into Flux. <<

    KENT NOTE: TsvService.startVend() is called in other numerous places,
    and is usually ONLY wrapped in a function,
    that is triggered on an event after a TsvService.subscribe() call

    this is the only place where there is an optional no-event-driven startVend()
    see below, this looks suspect:
      if ($scope.summary.TotalPrice < 0.01) {

    seems weird that the TotalPrice can sneak up on the app and suddenly be completed,

    maybe bad logic surrounding the Credit Card processing etc?
      assume it will be solved with better state management that we're doing.

  ****/

	startVend() {
		TsvActions.apiCall('disablePaymentDevice');
		TsvActions.apiCall('startVend');
		killTimers();
		setVendingInProcessFlag();
		RootscopeActions.setSession('cardMsg', Translate.translate("Card_Vending", "Vending", "Vending"));
		//TsvActions.apiCall("Card Approved should vend...");

		this.setState({
			cardTransactionRespose: Translate.translate("Card_Vending", "Vending", "Vending"),
			showSpinner: true,
			showCancelBtn: false
		});
	}

	cancel(){
		TsvActions.apiCall('stopPaymentTimer');
		emptyCart();
		gotoDefaultIdlePage();
	}

  // Add change listeners to stores
	cardTransactionHandler(level) {

		killTimers('cardErrorTimer');
		resetPaymentTimer();
		var msg, showSpinner = false;

		if (!RootscopeStore.getSession('bVendingInProcess')) {

			switch(level){
				case "CARD_INSERTED":
					msg = Translate.translate("Card_Vending", "ProcessingMessage");
					showSpinner = true;
					break;

				case "CARD_PROCESSING":
					msg = Translate.translate("Card_Vending", "ProcessingMessage");
					showSpinner = true;
					break;

				case "CARD_APPROVED":
					msg = Translate.translate("Card_Vending", "CardAccepted");
					this.startVend();
					break;

				case "CARD_INVALID_READ":
					msg = Translate.translate("Card_Vending", "CardInvalidMessage");
					resetPaymentTimer();
					break;

				case "CARD_DECLINED":
					msg =  Translate.translate("Card_Vending", "CardDeclinedMessage");
					resetPaymentTimer();
					break;

				case "CARD_CONNECTION_FAILURE":
					msg = Translate.translate("Card_Vending", "CardConnectionErrorMessage");
					resetPaymentTimer();
					break;

				case "CARD_UNKNOWN_ERROR":
					msg = Translate.translate("Card_Vending", "CardUnknownErrorMessage");
					resetPaymentTimer();
					break;

				default:
					console.log("Card_Vending Got event cardTransactionResponse()default: "+level);
					msg = Translate.translate("Card_Vending", "ErrorMessage");
					resetPaymentTimer();
					break;
			}

			this.setState({
				cardTransactionResponse: msg,
				showSpinner: showSpinner
			});
		}
  }

	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method) {
			switch (event.method) {
				case 'vendResponse':
					vendResponse(processStatus);
					stopPaymentTimer();
					break;
				case 'cardTransactionResponse':
					this.cardTransactionHandler(event.data);
					break;
			}
		}
	}

  render() {
    return (
      <_E.Row className="Card_Vending" >
        <_E.Col>
          <h2>{Translate.translate('Card_Vending', 'CardVending')}</h2>
              <_E.Row>
                {this.state.cart ? this.state.cart.map((prd, $index) => {
                  return(
                    <VendCartItem
                     key={$index}
                     data={prd}
                    />
                  )}
                ) : (<p>No cart products found! probably testing</p>) }

              </_E.Row>

        {/*
        <table className="cart">

            <tr>
              {cart.map((prd, $index) => {
                return(
                  <td key={$index}>

                      <img id="prdImg" src={ prd.imagePath } alt="productImage"/> err-src="../Images/ProductImageNotFound.png"

                  </td>
                )}
              )}

            </tr>

        </table>
        */}

          { this.state.summary && this.state.summary.TotalPrice >= 1 ? this.renderTotalPriceLabel() : null }

          <p id = "cardResponse">{ this.state.cardTransactionResponse || 'no msg yet' }</p>

          { this.state.showSpinner ? this.renderSpinner() : null }

          <img id="creditCards" src="/gfx/creditcards.png" alt="creditcards" />

          { this.state.showCancelBtnCash ? this.renderCancelBtnCash() : null }

        </_E.Col>
      </_E.Row>
    );
	{/*
    <div className="Card_Vending" >
        <h2>{Translate.translate('Card_Vending', 'CardVending')}</h2>
        <table className="cart">

            <tr>
              {cart.map((prd, $index) => {
                return(
                  <td key={$index}>

                      <img id="prdImg" src={ prd.imagePath } alt="productImage"/>

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


    */}
  }

  renderCancelBtnCash(){
    return(
      <_E.Button type="warning" onClick={this.cancel}>Cancel</_E.Button> /*<img src="../Images/cancel.png" onClick={this.cancel()} />*/
    )
  }

  renderTotalPriceLabel() {
    return(
      <p> { Translate.translate('Card_Vending', 'TotalPriceLabel')}{ currencyFilter(this.summary.TotalPrice) }</p>
    )
  }

  renderSpinner(){
  	console.warn('render spinner!!!!');
    return(
    	<div style={{margin:'0 auto 2em'}}>
      <_E.Spinner size="lg" type="primary" style={{margin:'0 auto 2em'}} />
      </div>
    )
  }

}

export default Card_Vending
