import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import VendCartItem from './VendCartItem'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	updateCredit,
	resetPaymentTimer,
	setVendingInProcessFlag,
	emptyCart,
	gotoDefaultIdlePage,
	vendResponse,
	GuiTimer,
	KillGuiTimer
} from '../utils/TsvUtils'

import { currencyFilter } from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CardVending');

class CardVending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    TsvSettingsStore.setConfig('bDisplayCgryNavigation', false);
    updateCredit();
    TsvActions.apiCall('enablePaymentDevice', 'PAYMENT_TYPE_CREDIT_CARD');

    this.state = {
		cart: TsvSettingsStore.getCache('shoppingCart.detail'),
		// testing, this fails: (so setting differently below)
		//item: TsvSettingsStore.getCache('shoppingCart.detail')[0],
		summary: TsvSettingsStore.getCache('shoppingCart.summary'),
		showCancelBtn: true,
		cardTransactionResponse: Translate.translate('CardVending', 'InstructionMessage')
    };

	this.state.item = this.state.cart && this.state.cart.length ? this.state.cart[0] : false;

/*
    if (TsvSettingsStore.getSession('cardMsg')!= Translate.translate('ProcessingMessage')
		&& TsvSettingsStore.getSession('cardMsg')!= Translate.translate('VendingMessage')
		&& TsvSettingsStore.getSession('cardMsg')!= Translate.translate('InstructionMessage')
		) {
		TsvService.startCardErrorTimer();
	}
*/

    if (TsvSettingsStore.getSession('bVendingInProcess')){
		this.state.showSpinner = true;
		this.state.cardTransactionResponse = Translate.translate('CardVending', "VendingMessage");
		this.state.showCancelBtnCash = false;
    }

    //if (!this.state.summary || (this.state.summary && this.state.summary.TotalPrice < 0.01)) {
    if (this.state.summary && this.state.summary.TotalPrice < 0.01) {
		Big.warn("this.summary.TotalPrice: "+ this.summary.TotalPrice);
		Big.warn("this.summary.TotalPrice less than 0.01 should start vend");
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
		KillGuiTimer();
		setVendingInProcessFlag();
		TsvSettingsStore.setSession('cardMsg', Translate.translate("CardVending", "Vending", "Vending"));
		//TsvActions.apiCall("Card Approved should vend...");

		this.setState({
			cardTransactionRespose: Translate.translate("CardVending", "Vending", "Vending"),
			showSpinner: true,
			showCancelBtn: false
		});
	}

	cancel(){
		TsvActions.apiCall('disablePaymentDevice');
		KillGuiTimer();
		emptyCart();
		gotoDefaultIdlePage();
	}

  // Add change listeners to stores
	cardTransactionHandler(level) {

		KillGuiTimer();
		var msg, showSpinner = false;

		if (!TsvSettingsStore.getSession('bVendingInProcess')) {

			switch(level){
				case "CARD_INSERTED":
					msg = Translate.translate("CardVending", "ProcessingMessage");
					showSpinner = true;
					resetPaymentTimer();
					break;

				case "CARD_PROCESSING":
					msg = Translate.translate("CardVending", "ProcessingMessage");
					showSpinner = true;
					resetPaymentTimer();
					break;

				case "CARD_APPROVED":
					msg = Translate.translate("CardVending", "CardAccepted");
					this.startVend();
					break;

				case "CARD_INVALID_READ":
					msg = Translate.translate("CardVending", "CardInvalidMessage");
					resetPaymentTimer();
					break;

				case "CARD_DECLINED":
					msg =  Translate.translate("CardVending", "CardDeclinedMessage");
					resetPaymentTimer();
					break;

				case "CARD_CONNECTION_FAILURE":
					msg = Translate.translate("CardVending", "CardConnectionErrorMessage");
					resetPaymentTimer();
					break;

				case "CARD_UNKNOWN_ERROR":
					msg = Translate.translate("CardVending", "CardUnknownErrorMessage");
					resetPaymentTimer();
					break;

				default:
					Big.log("CardVending Got event cardTransactionResponse()default: "+level);
					msg = Translate.translate("CardVending", "ErrorMessage");
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
		GuiTimer();
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
					vendResponse(event.data); //processStatus);
					KillGuiTimer();
					break;
				case 'cardTransactionResponse':
					this.cardTransactionHandler(event.data);
					break;
			}
		}
	}

  render() {
    return (
      <_E.Row className="CardVending" >
        <_E.Col>
          <h2>{Translate.translate('CardVending', 'CardVending')}</h2>
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


          { this.state.summary && this.state.summary.TotalPrice >= 1 ? this.renderTotalPriceLabel() : null }

          <p id = "cardResponse">{ this.state.cardTransactionResponse || 'no msg yet' }</p>

          { this.state.showSpinner ? this.renderSpinner() : null }

          <img id="creditCards" src="/gfx/creditcards.png" alt="creditcards" />

          { this.state.showCancelBtnCash ? this.renderCancelBtnCash() : null }

        </_E.Col>
      </_E.Row>
    );
  }

  renderCancelBtnCash(){
    return(
      <_E.Button type="warning" onClick={this.cancel.bind(this)}>Cancel</_E.Button> /*<img src="../Images/cancel.png" onClick={this.cancel()} />*/
    )
  }

  renderTotalPriceLabel() {
    return(
      <p> { Translate.translate('CardVending', 'TotalPriceLabel')}{ currencyFilter(this.summary.TotalPrice) }</p>
    )
  }

  renderSpinner(){
  	Big.warn('render spinner!!!!');
    return(
    	<div style={{margin:'0 auto 2em'}}>
      <_E.Spinner size="lg" type="primary" style={{margin:'0 auto 2em'}} />
      </div>
    )
  }

}

export default CardVending
