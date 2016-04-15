import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import * as _E from 'elemental'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'

class Cash_Card extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    //RootscopeActions.setSession('currentView', 'Cash_Card');
    //RootscopeActions.setCache('currentLocation', '/Cash_Card');
    RootscopeActions.updateCredit();

  };

  cancel(){
    TsvService.emptyCart();
    //TsvService.gotoDefaultIdlePage();
    browserHistory.push("/Storefront");
  }

  cash() {
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH", () => {});
    browserHistory.push("/Cash_Vending");
  }

  card() {
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD", () => {});
    browserHistory.push("/Card_Vending");
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("cardTransactionResponse",
      (level) => {
        if(!RootscopeStore.getSession('bVendingInProcess')) {
            if(browserHistory.push() != "/Card_Vending"){
                return browserHistory.push("/Card_Vending");
            }

            TsvService.cardTransaction(level, () => {});
        }
    }
    , "app.cashCard");
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.cashCard");
  }

  render() {
    return (
      <_E.Row className="Cash_Card">
      <_E.Col>
		  <h2>{Translate.translate('Cash_Card', 'InstructionMessage')}</h2>
		  <_E.Row>
			  <_E.Col sm="1/2">
				  <img className="paymentMethod" onClick={this.cash} src={Translate.localizedImage('cash.png')} alt="cash" style={{maxWidth:'90%'}} />
				</_E.Col>
			  <_E.Col sm="1/2">
				  <img className="paymentMethod" onClick={this.card} src={Translate.localizedImage('card.png')} alt="card" style={{maxWidth:'90%'}} />
			  </_E.Col>
		  </_E.Row>

		  <_E.Row>
			  <_E.Col>
				  <img src={Translate.localizedImage('cancel.png')} onClick={this.cancel} />
			  </_E.Col>
		  </_E.Row>
      </_E.Col>
      </_E.Row>
    );
    /*
    return (
      <div className="Cash_Card">
      <h2>{Translate.translate('Cash_Card', 'InstructionMessage')}</h2>

      <div className="cashAndCards">

          <img className="paymentMethod" onClick={this.cash()} src={Translate.localizedImage('cash.png')} alt="cash">

          <img className="paymentMethod" onClick={this.card()} src={Translate.localizedImage('card.png')} alt="card">

      </div>

      <img src={Translate.localizedImage('cancel.png')} onClick={this.cancel()} />

      </div>
    );
    */
  }

}

export default Cash_Card
