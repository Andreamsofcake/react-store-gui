import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import * as _E from 'elemental'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	updateCredit,
	emptyCart,
	gotoDefaultIdlePage,
	GuiTimer,
	KillGuiTimer
} from '../utils/TsvUtils'


class ChooseCashCard extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    TsvSettingsStore.setConfig('bDisplayCgryNavigation', false);
    updateCredit();

  };

  cancel(){
    emptyCart();
    browserHistory.push('/Storefront');

  }

  customerCredit() {
    //TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");
    browserHistory.push("/CustomerCreditVending");
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
		GuiTimer();
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method == 'cardTransactionResponse') {
			if (!TsvSettingsStore.getSession('bVendingInProcess')) {
				let level = event.data;
				cardTransaction(level);
				browserHistory.push("/CardVending");
			}
		}
	}

  render() {
    return (
      <_E.Row className="CashCard">
      <_E.Col>
		  <h2>{Translate.translate('CashCard', 'InstructionMessage')}</h2>
		  <_E.Row>
			  <_E.Col sm="1/3">
				  <_E.Button type="primary" size="lg" onClick={this.customerCredit}>Pay with Customer Credit</_E.Button>
				</_E.Col>
			  <_E.Col sm="1/3">
				  <img className="paymentMethod" onClick={this.cash} src={Translate.localizedImage('cash.png')} alt="cash" style={{maxWidth:'90%'}} />
				</_E.Col>
			  <_E.Col sm="1/3">
				  <img className="paymentMethod" onClick={this.card} src={Translate.localizedImage('card.png')} alt="card" style={{maxWidth:'90%'}} />
			  </_E.Col>
		  </_E.Row>

            <_E.Row>
            	<_E.Col><h1>&nbsp;</h1></_E.Col>
            </_E.Row>
            <_E.Row>

                <_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">&nbsp;</_E.Col>
                <_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4"><_E.Button type="primary" size="lg" onClick={() => { browserHistory.push('/Storefront') }}>{Translate.translate('ShoppingCart','Shop_More')}</_E.Button></_E.Col>
                <_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4"><_E.Button type="danger" size="lg" onClick={this.cancel.bind(this)}><_E.Glyph icon="circle-slash" />{Translate.translate('ShoppingCart','Cancel')}</_E.Button></_E.Col>
                <_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">&nbsp;</_E.Col>

            </_E.Row>

		  {/*<_E.Row>
			  <_E.Col>
				  <img src={Translate.localizedImage('cancel.png')} onClick={this.cancel} />
			  </_E.Col>
		  </_E.Row>*/}
      </_E.Col>
      </_E.Row>
    );
    /*
    return (
      <div className="CashCard">
      <h2>{Translate.translate('CashCard', 'InstructionMessage')}</h2>

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
