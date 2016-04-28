import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import * as _E from 'elemental'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	updateCredit,
	emptyCart,
	gotoDefaultIdlePage,
} from '../utils/TsvUtils'


class ChooseCashCard extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    updateCredit();

  };

  cancel(){
	emptyCart();
    //gotoDefaultIdlePage();
    browserHistory.push("/Storefront");
  }

  cash() {
    TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");
    browserHistory.push("/CashVending");
  }

  card() {
    TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CREDIT_CARD");
    browserHistory.push("/CardVending");
  }

  // Add change listeners to stores
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method == 'cardTransactionResponse') {
			if (!RootscopeStore.getSession('bVendingInProcess')) {
				let level = event.data;
				cardTransaction(level);
				browserHistory.push("/CardVending");
			}
		}
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

export default ChooseCashCard
