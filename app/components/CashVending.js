import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { currencyFilter } from '../utils/TsvUtils'

import VendCartItem from './VendCartItem'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	resetPaymentTimer,
	vendResponse,
	killTimers,
	startPaymentTimer,
	gotoDefaultIdlePage,
	cardTransaction,
	updateCredit,
	emptyCart,
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CashVending');

class CashVending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'CashVending');
    //TsvSettingsStore.setCache('currentLocation', '/CashVending');
    TsvSettingsStore.setConfig('bDisplayCgryNavigation', false);
    updateCredit();
    TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");

    this.state = {
      insertedAmount: TsvSettingsStore.getSession('creditBalance'),
      summary: TsvSettingsStore.getCache('shoppingCart.summary'),
      hintMsg: Translate.translate('CashVending', 'HintMessageInsertCash'),
      // only in cash.js:
      //salesTaxAmount: TsvSettingsStore.getCache('shoppingCart.summary.salesTaxAmount'),
      showCancelBtnCash: true,
      cart: TsvSettingsStore.getCache('shoppingCart.detail'),
      // only in cash.js:
      //item: TsvSettingsStore.getCache('shoppingCart.detail')[0]
    };

    resetPaymentTimer();

    // KENT note: this session var I believe is not used in Shopping Cart regime, and checkBalance only returns a boolean
    TsvSettingsStore.setSession('bVendedOldCredit', this.checkBalance.bind(this));

    if (TsvSettingsStore.getSession('bVendingInProcess')) {

        stopPaymentTimer();

        this.state.showSpinner = true;
        this.state.hintMsg = Translate.translate('CashVending','HintMessageVending');
        this.state.showCancelBtnCash = false;

      } else {
      	startPaymentTimer();
      }
      
      this._onRootstoreChange = this._onRootstoreChange.bind(this);
      this._onTsvChange = this._onTsvChange.bind(this);
      this.storefrontTimeout = null;

  }

  cancel(){
  	// only in cash.js:
    //TsvSettingsStore.setSession('insertedAmount', 0);
    TsvActions.apiCall('disablePaymentDevice');
    killTimers('paymentTimer');
    emptyCart();
  	// only in cash.js:
    //browserHistory.push("/View1");
    gotoDefaultIdlePage();
  }

  checkBalance(calculatedBalance){
	  var total = TsvSettingsStore.getCache('shoppingCart.summary.TotalPrice')
	  	, cart_detail = TsvSettingsStore.getCache('shoppingCart.detail') || []
	  	, balance = calculatedBalance || TsvSettingsStore.getSession('creditBalance')
	  	;
	  
	  Big.log('checkBalance, 3 things:');
	  Big.log([total, cart_detail, balance]);

	  // cash.js logic:
	  //if ((this.insertedAmount * 100) >= (total * 100) && TsvSettingsStore.getCache('shoppingCart.detail', []).length > 0){
	  if (balance >= total && cart_detail.length > 0) {
	  	
		  Big.log('customer has inserted enough money!');
		  
	  	  var creditDue = balance - total;
	  	  if (creditDue) {
	  	  	// 1. clear the credit in Paylink
	  	  	// 2. push the credit to the customer
	  	  	// (logically those should reverse, we should make sure the credit is pushed before we clear....)
	  	  	// FIXME later
	  	  	TsvActions.apiCall('resetCreditBalance', () => {
	  	  		Big.log(' >>>>>>> customer should receive '+creditDue+' in credits to their account!');
	  	  	});
	  	  } else {
	  	  	Big.log(' >>>>>>> no credit due.');
	  	  }

		  TsvActions.apiCall('disablePaymentDevice', () => {
			  Big.log('... payment device disabled');
			  if(!TsvSettingsStore.getSession('bVendingInProcess')){
				  Big.log('... vending was not in process, so vend away...!!!!!');
				  // only in cash.js:
				  TsvSettingsStore.setSession('bVendingInProcess', true);
				  TsvActions.apiCall('startVend');
				  Big.log('... start vend has been called');
				  this.setState({
					  hintMsg: Translate.translate('CashVending','HintMessageVending'),
					  showCancelBtnCash: false,
					  showSpinner: true,
					  vendingItem: null
				  });
			  } else {
				  Big.log('... vending WAS IN process, error maybe?');
			  }
		  });
		  if (!TsvSettingsStore.getSession('bVendingInProcess')) {
			  Big.warn('checkBalance() returning true');
			  return true;
		  }
		  Big.warn('checkBalance() returning false [1]');
		  return false;
	  }
	  Big.warn('checkBalance() returning false [2]');
	  Big.log([cart_detail, balance]);
	  return false;
  }

  // Add change listeners to stores
	componentDidMount() {
		startGeneralIdleTimer(this.props.location.pathname);
		TsvStore.addChangeListener(this._onTsvChange);
		TsvSettingsStore.addChangeListener(this._onRootstoreChange);
		// let's check the balance at module load:
		this.checkBalance();
		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setCache('shoppingCart', data);
		});
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
		TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
	}

  _onRootstoreChange() {
    var data = TsvSettingsStore.getCache('shoppingCart');
/*
	if (this.state.loadedCartOnce && (!data.detail || !data.detail.length)) {
	  	//gotoDefaultIdlePage();
		browserHistory.push('/Storefront');

	} else {
	*/
	  this.setState({
		cart: data.detail,
		summary: data.summary,
		loadedCartOnce: true
	  })
	//}

  }
  
	_onTsvChange(event) {
		if (event && event.method) {
			if (!event.data.length) {
				Big.error('method "'+event.method+'", but no args or data???');
				Big.log(event);
				return;
			}
			switch (event.method) {
				case 'creditBalanceChanged':
					let ins = event.data[0];
					let balance = event.data[1];

					if (this.state.summary && this.state.summary.TotalPrice) {
						Big.warn('hmmmm maybe we need to fix the creditBalance calc? mine:['+(balance/100.00)+'], other:['+(this.state.summary.TotalPrice - (balance/100.00))+']' + "\n\n ... but maybe it gets taken care of local method 'checkBalance'");
					}
					// only in cash.js:
					//TsvSettingsStore.setSession('creditBalance', this.state.summary.TotalPrice - balance/100.00);

					var state = {
						insertedAmount: balance/100.00
					};

					if (!TsvSettingsStore.getSession('bVendingInProcess')) {
						state.hintMsg = Translate.translate('CashVending','HintMessageVending');
						state.showSpinner = true;
						state.showCancelBtnCash = false;
					}

					this.setState(state);

					// dreaded invariant dispatching in a dispatch error:
					// FIXME: must figure out a better way to track the state vars app-wide,
					// too many RootscopeAction => Store => dispatches
					setTimeout(() => {
						resetPaymentTimer();
						TsvSettingsStore.setSession('creditBalance', state.insertedAmount);
						this.checkBalance(state.insertedAmount);
					}, 150);

					break;

				case 'cardTransactionRespose':
					if(!TsvSettingsStore.getSession('bVendingInProcess')) {
						cardTransaction(event.data[0]);
						browserHistory.push("/CardVending");
					}
					break;

				case 'vendResponse':
				  	vendResponse(event.data[0]);
				  	stopPaymentTimer();
					break;
				
				case 'notifyVendingItem':
					//Big.log('vendingItem');
					//Big.log(event.data[0]);
					this.setState({
						vendingItem: event.data[0]
					});
					break;
				
				case 'notifyVmsEvent':
					Big.warn('notifyVmsEvent received, probably should start pushing these to the server!');
					Big.log(event.data);
					break;
			}
		}
	}

  render() {
  	if (this.storefrontTimeout) {
  		clearTimeout(this.storefrontTimeout);
  	}
  	if (this.state.vendingComplete) {
  		browserHistory.push('/ThankYouMsg');
  		return (
  			<div><h1>Vending complete!</h1></div>
  		);
  	}
  	if (!this.state.cart || !this.state.cart.length) {
  		this.storefrontTimeout = setTimeout(() => {
	  		browserHistory.push('/Storefront');
	  	}, 5000);
  		return (
  			<div>
				<h1>Error: no cart items found to purchase!</h1>
				{/*<pre>{ JSON.stringify(this.state.cart, null, 4) }</pre>*/}
				<_E.Button component={(<Link to="/Storefront">Storefront</Link>)} />
  			</div>
  		);
  	}
    return (
      <_E.Row>
		<_E.Col sm="100%" lg="100%">
		
		<h2>Insert cash to complete your purchase</h2>

			  <_E.Col>
			{this.state.cart.map( (prd, $index) => {
				return (
				  <VendCartItem
				   key={$index}
				   data={prd}
				  />
				)
			  })
			}
			  </_E.Col>

		</_E.Col>

        { this.hintMsg ? (<p id="hint">{this.hintMsg}</p>) : null }

		<_E.Col sm="1/2">
			<p style={{fontSize:'1.5em'}}>{Translate.translate('CashVending', 'TotalAmountLabel')} Total: <strong>{ currencyFilter(this.state.summary.TotalPrice) }</strong></p>
		</_E.Col>
		<_E.Col sm="1/2">
			<p style={{fontSize:'1.5em'}}>{Translate.translate('CashVending', 'InsertedAmountLabel')} <strong>${ this.state.insertedAmount ? currencyFilter(this.state.insertedAmount) : '0.00' }</strong></p>
		</_E.Col>

		{ this.state.showCancelBtnCash ? (
		<div>
			<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">&nbsp;</_E.Col>
			<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4"><_E.Button type="primary" size="lg" onClick={() => { browserHistory.push('/Storefront') }}>{Translate.translate('ShoppingCart','Shop_More')}</_E.Button></_E.Col>
			<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">{this.renderCancelBtnCash()}</_E.Col>
			<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">&nbsp;</_E.Col>
		</div>
		) : null }
		
		{this.renderVendingItem()}

		{/*<_E.Col sm="1/2">
			{ this.state.showSpinner ? this.renderSpinner() : null }
		</_E.Col>*/}

      </_E.Row>
    );

  }
  
  renderVendingItem() {
  	if (this.state.vendingItem) {
  		return (
			<_E.Col>
				<h1 style={{textAlign: 'center'}}>Vending item:<br /><strong>{this.state.vendingItem.productName}</strong></h1>
				{this.state.vendingItem.imagePath ? (
					<img src={this.state.vendingItem.imagePath} />
				) : null }
				<_E.Spinner size="md" type="inverted" />
			</_E.Col>
  		);
  	}
  	return null;
  }

  renderCancelBtnCash(){
    // <img src="../Images/cancel.png" onClick={this.cancel.bind(this)} />
    return(
      <_E.Button type="warning" onClick={this.cancel.bind(this)}><_E.Glyph icon="circle-slash" />Cancel Transaction</_E.Button>
    )
  }

  renderSpinner(){
    return(
      <_E.Spinner size="md" type="inverted" />
    )
  }

}

export default CashVending
