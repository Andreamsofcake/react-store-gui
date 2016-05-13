import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
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

    //RootscopeActions.setSession('currentView', 'CashVending');
    //RootscopeActions.setCache('currentLocation', '/CashVending');
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    updateCredit();
    TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");

    this.state = {
      insertedAmount: RootscopeStore.getSession('creditBalance'),
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      hintMsg: Translate.translate('CashVending', 'HintMessageInsertCash'),
      // only in cash.js:
      //salesTaxAmount: RootscopeStore.getCache('shoppingCart.summary.salesTaxAmount'),
      showCancelBtnCash: true,
      cart: RootscopeStore.getCache('shoppingCart.detail'),
      // only in cash.js:
      //item: RootscopeStore.getCache('shoppingCart.detail')[0]
    };

    resetPaymentTimer();

    // KENT note: this session var I believe is not used in Shopping Cart regime, and checkBalance only returns a boolean
    RootscopeActions.setSession('bVendedOldCredit', this.checkBalance.bind(this));

    if (RootscopeStore.getSession('bVendingInProcess')) {

        stopPaymentTimer();

        this.state.showSpinner = true;
        this.state.hintMsg = Translate.translate('CashVending','HintMessageVending');
        this.state.showCancelBtnCash = false;

      } else {
      	startPaymentTimer();
      }
      
      this._onRootstoreChange = this._onRootstoreChange.bind(this);
      this._onTsvChange = this._onTsvChange.bind(this);

  }

  cancel(){
  	// only in cash.js:
    //RootscopeActions.setSession('insertedAmount', 0);
    TsvActions.apiCall('disablePaymentDevice');
    killTimers('paymentTimer');
    emptyCart();
  	// only in cash.js:
    //browserHistory.push("/View1");
    gotoDefaultIdlePage();
  }

  checkBalance(calculatedBalance){
	  var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
	  	, cart_detail = RootscopeStore.getCache('shoppingCart.detail') || []
	  	, balance = calculatedBalance || RootscopeStore.getSession('creditBalance')
	  	;
	  
	  Big.log('checkBalance, 3 things:');
	  Big.log([total, cart_detail, balance]);

	  // cash.js logic:
	  //if ((this.insertedAmount * 100) >= (total * 100) && RootscopeStore.getCache('shoppingCart.detail', []).length > 0){
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
			  if(!RootscopeStore.getSession('bVendingInProcess')){
				  Big.log('... vending was not in process, so vend away...!!!!!');
				  // only in cash.js:
				  RootscopeActions.setSession('bVendingInProcess', true);
				  TsvActions.apiCall('startVend');
				  Big.log('... start vend has been called');
				  this.setState({
					  hintMsg: Translate.translate('CashVending','HintMessageVending'),
					  showCancelBtnCash: false,
					  showSpinner: true
				  });
			  } else {
				  Big.log('... vending WAS IN process, error maybe?');
			  }
		  });
		  if (!RootscopeStore.getSession('bVendingInProcess')) {
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
		RootscopeStore.addChangeListener(this._onRootstoreChange);
		// let's check the balance at module load:
		this.checkBalance();
		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
			if (err) Big.throw(err);
			RootscopeActions.setCache('shoppingCart', data);
		});
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
		RootscopeStore.removeChangeListener(this._onRootstoreChange);
	}

  _onRootstoreChange() {
    var data = RootscopeStore.getCache('shoppingCart');
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
					//RootscopeActions.setSession('creditBalance', this.state.summary.TotalPrice - balance/100.00);

					var state = {
						insertedAmount: balance/100.00
					};

					if (!RootscopeStore.getSession('bVendingInProcess')) {
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
						RootscopeActions.setSession('creditBalance', state.insertedAmount);
						this.checkBalance(state.insertedAmount);
					}, 150);

					break;

				case 'cardTransactionRespose':
					if(!RootscopeStore.getSession('bVendingInProcess')) {
						cardTransaction(event.data[0]);
						browserHistory.push("/CardVending");
					}
					break;

				case 'vendResponse':
				  	vendResponse(event.data[0]);
				  	stopPaymentTimer();
					break;
			}
		}
	}

  render() {
  	if (!this.state.cart || !this.state.cart.length) {
  		//browserHistory.push('/Storefront');
  		return (
  			<div>
				<h1>Error: no cart items found to purchase!</h1>
				<pre>{ JSON.stringify(this.state.cart, null, 4) }</pre>
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

		<_E.Col sm="1/2">
			{ this.state.showCancelBtnCash ? this.renderCancelBtnCash() : null }
		</_E.Col>
		<_E.Col sm="1/2">
			{ this.state.showSpinner ? this.renderSpinner() : null }
		</_E.Col>

      </_E.Row>
    );

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
