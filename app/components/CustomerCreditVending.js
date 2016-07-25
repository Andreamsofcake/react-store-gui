import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { currencyFilter } from '../utils/TsvUtils'

import VendCartItem from './VendCartItem'
import StorefrontStore from '../stores/StorefrontStore'

import CustomerActions from '../actions/CustomerActions'
import CustomerStore from '../stores/CustomerStore'

import appConstants from '../constants/appConstants'

import SessionActions from '../actions/SessionActions'
import SessionStore from '../stores/SessionStore'

import TransactionActions from '../actions/TransactionActions'
import TransactionStore from '../stores/TransactionStore'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	resetPaymentTimer,
	vendResponse,
	startPaymentTimer,
	gotoDefaultIdlePage,
	cardTransaction,
	updateCredit,
	emptyCart,
	GuiTimer,
	KillGuiTimer
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CustomerCreditVending');

class CustomerCreditVending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'CashVending');
    //TsvSettingsStore.setCache('currentLocation', '/CashVending');
    TsvSettingsStore.setConfig('bDisplayCgryNavigation', false);
    updateCredit();
    //TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");

    this.state = {
      insertedAmount: TsvSettingsStore.getSession('creditBalance'),
      summary: TsvSettingsStore.getCache('shoppingCart.summary'),
      hintMsg: Translate.translate('CashVending', 'HintMessageInsertCash'),
      // only in cash.js:
      //salesTaxAmount: TsvSettingsStore.getCache('shoppingCart.summary.salesTaxAmount'),
      showCancelBtnCash: true,
      cart: TsvSettingsStore.getCache('shoppingCart.detail'),
      customer: CustomerStore.getCustomer(),
      customerCredit: CustomerStore.getCustomerCredit(),
      transactionComplete: false
      
      // only in cash.js:
      //item: TsvSettingsStore.getCache('shoppingCart.detail')[0]
    };

    resetPaymentTimer();

    // KENT note: this session var I believe is not used in Shopping Cart regime, and checkBalance only returns a boolean
    TsvSettingsStore.setSession('bVendedOldCredit', this.checkBalance.bind(this));

    if (TsvSettingsStore.getSession('bVendingInProcess')) {

        KillGuiTimer();

        this.state.showSpinner = true;
        this.state.hintMsg = Translate.translate('CashVending','HintMessageVending');
        this.state.showCancelBtnCash = false;

      } else {
      	startPaymentTimer();
      }
      
      this._onRootstoreChange = this._onRootstoreChange.bind(this);
      this._onTsvChange = this._onTsvChange.bind(this);
      this._onSessionStoreChange = this._onSessionStoreChange.bind(this);
      this.completeCreditPurchase = this.completeCreditPurchase.bind(this);
      this.storefrontTimeout = null;

  }

	cancel() {
		SessionActions.closeSessionTransaction({ event: 'CANCEL_TRANSACTION' });
		TsvActions.apiCall('disablePaymentDevice');
		KillGuiTimer();
		emptyCart();
		gotoDefaultIdlePage();
	}

	keepShopping() {
		SessionActions.addShopEvent({ event: 'KEEP_SHOPPING_FROM_CHECKOUT' });
		browserHistory.push('/Storefront');
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
	  	  /*
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
	  	  */

		  //TsvActions.apiCall('disablePaymentDevice', () => {
			  //Big.log('... payment device disabled');
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
		  //});
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
  
  _onSessionStoreChange(event) {
  
  }

  _onTransactionStoreChange(event) {
  	if (event && event.type === appConstants.CREDIT_PURCHASE_COMPLETED) {
		var state = {
			insertedAmount: this.state.summary.TotalPrice,
			transactionComplete: true
		};
		this.setState(state);
		
		Big.log('payFullWithCustomerCredit');
		Big.log(state);

		// let's not time out on a vend, yo!
		//resetPaymentTimer();
		//KillGuiTimer(); // <<<< this gets called down below on first (and thus every) notifyVend event.

		TsvSettingsStore.setSession('creditBalance', state.insertedAmount);
		this.checkBalance(state.insertedAmount);
		
		// FIXME: need a server method to refresh the credits, this is ok for now, as it passes through returned credit obj from API/PROXY
		// dang invariants
		setTimeout(() => {
			CustomerActions.updateCurrentCustomerCredit(event.customerCredit);
		}, 150);
  	}
  }
  
  completeCreditPurchase() {
  	if (this.state.summary.TotalPrice
  		&& this.state.customer
  		&& this.state.customerCredit
  		&& this.state.customerCredit.current_credit_cents
  		&& this.state.summary.TotalPrice * 100 <= this.state.customerCredit.current_credit_cents
  	) {
  		TransactionActions.spendCustomerCredit(this.state.customer._id, this.state.summary.TotalPrice * 100);

  	} else {
  		alert('Sorry, something happened there, you don\'t appear to have enough credits now.');
  	}
  }

  // Add change listeners to stores
	componentDidMount() {
		GuiTimer();
		TsvStore.addChangeListener(this._onTsvChange);
		TsvSettingsStore.addChangeListener(this._onRootstoreChange);
		SessionStore.addChangeListener(this._onSessionStoreChange);
		
		SessionActions.addShopEvent({ event: 'CREDITS_CHECKOUT_VIEW' });

		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setCache('shoppingCart', data);

			// let's check the balance at module load:
			//this.checkBalance();
			this.setState({
				insertedAmount: TsvSettingsStore.getSession('creditBalance'),
				summary: data.summary,
				cart: data.detail,
				customer: CustomerStore.getCustomer(),
				customerCredit: CustomerStore.getCustomerCredit(),
			}, () => this.checkBalance);
			
			// only create transactions for a non-empty cart
			if (data && data.detail && data.detail.length) {
				TransactionActions.createTransaction();
			}
		});
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
		TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
		SessionStore.removeChangeListener(this._onSessionStoreChange);
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
		loadedCartOnce: true,
		//vendingItem: data.detail && data.detail.length ? data.detail[0] : null
	  })
	//}

  }
  
	_onTsvChange(event) {
		if (event && event.method) {
			if (!event.data.length && event.method.toString() !== 'payFullWithCustomerCredit') {
				Big.error('method "'+event.method+'", but no args or data???');
				Big.log(event);
				return;
			}
			Big.log('_onTsvChange');
			Big.log(event);

			switch (event.method) {
				case 'payFullWithCustomerCredit':
					var state = {
						insertedAmount: this.state.summary.TotalPrice
					};
					this.setState(state);
					
					Big.log('payFullWithCustomerCredit');
					Big.log(state);

					resetPaymentTimer();
					TsvSettingsStore.setSession('creditBalance', state.insertedAmount);
					this.checkBalance(state.insertedAmount);
					break;

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

					resetPaymentTimer();
					TsvSettingsStore.setSession('creditBalance', state.insertedAmount);
					this.checkBalance(state.insertedAmount);
					break;

				case 'cardTransactionRespose':
					if(!TsvSettingsStore.getSession('bVendingInProcess')) {
						cardTransaction(event.data[0]);
						browserHistory.push("/CardVending");
					}
					break;

				case 'vendResponse':
				  	vendResponse(event.data[0]);
					break;
				
				case 'notifyVendingItem':
				  	KillGuiTimer();
					Big.log('vendingItem');
					var data = event.data[0]
						, productImages;
					if (data) {
						data = StorefrontStore.decorateProducts(data);
						productImages = StorefrontStore.getImagesForProduct(data);
					}
					this.setState({
						vendingItem: data,
						vendingProductImages: productImages
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
  		TsvSettingsStore.setSession('bVendingInProcess', false);
  		TsvSettingsStore.setSession('creditBalance', 0);
  		browserHistory.push('/ThankYouMsg');
  		return (
  			<div>
	  			<h1 className="mainHeaderText">Vending complete!</h1>
  			</div>
  		);
  	}

  	if (!this.state.cart || !this.state.cart.length) {
  		this.storefrontTimeout = setTimeout(() => {
	  		browserHistory.push('/Storefront');
	  	}, 5000);
  		return (
  			<div>
				<h1 className="mainHeaderText">Error: no cart items found to purchase, sorry!</h1>
				{/*<pre>{ JSON.stringify(this.state.cart, null, 4) }</pre>*/}
				<_E.Button component={(<Link to="/Storefront">Storefront</Link>)} />
  			</div>
  		);
  	}
	return (
		<_E.Row>
			<div className="CustomerCheckout">
			<_E.Col>
	 
				<h2 className="mainHeaderText">Use your Customer Credit to complete your purchase</h2>
				{/*<p> bVendingInProcess: {TsvSettingsStore.getSession('bVendingInProcess')}</p>*/}

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

			<_E.Col xs="1/6" sm="1/6" md="1/6" lg="1/6">&nbsp;</_E.Col>
			<_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3">
				<p style={{fontSize:'2em',textAlign:'center'}}>{Translate.translate('CashVending', 'TotalAmountLabel')} <strong>{ currencyFilter(this.state.summary.TotalPrice) }</strong></p>
			</_E.Col>
			<_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3">
				{this.renderPayCreditsOption()}
			</_E.Col>
			<_E.Col xs="1/6" sm="1/6" md="1/6" lg="1/6">&nbsp;</_E.Col>

			{ this.state.showCancelBtnCash ? (
			<_E.Col style={{marginTop: '3em'}}>
			<_E.Row>
				<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">&nbsp;</_E.Col>
				<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4"><_E.Button type="primary" size="lg" onClick={this.keepShopping.bind(this)}>{Translate.translate('ShoppingCart','Shop_More')}</_E.Button></_E.Col>
				<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4"><_E.Button type="danger" size="lg" onClick={this.cancel.bind(this)}><_E.Glyph icon="circle-slash" />Cancel Transaction</_E.Button></_E.Col>
				<_E.Col xs="1/4" sm="1/4" md="1/4" lg="1/4">&nbsp;</_E.Col>
			</_E.Row>
			</_E.Col>
			) : null }
	 
			{this.renderVendingItem()}

			{/*<_E.Col sm="1/2">
				{ this.state.showSpinner ? this.renderSpinner() : null }
			</_E.Col>*/}
			
			</div>

		</_E.Row>
	);

  }
  
  renderPayCreditsOption() {
  	if (this.state.transactionComplete) {
  		return (
  			<p style={{fontSize:'2em',textAlign:'center'}}>Payment complete, thanks!</p>
  		);
  	}
  	if (this.state.summary.TotalPrice
  		&& this.state.customer
  		&& this.state.customerCredit
  		&& this.state.customerCredit.current_credit_cents
  		&& this.state.summary.TotalPrice * 100 <= this.state.customerCredit.current_credit_cents
  	) {
  		return (
  			<_E.Button type="primary" size="lg" onClick={this.completeCreditPurchase}>Spend My Credits</_E.Button>
  		);
  	}
  	//<p style={{fontSize:'2em',textAlign:'center'}}>{Translate.translate('CashVending', 'InsertedAmountLabel')} <strong>${ this.state.insertedAmount ? currencyFilter(this.state.insertedAmount) : '0.00' }</strong></p>
  	return (
  		<p style={{fontSize:'2em',textAlign:'center'}}>Sorry, you don't have enough credit to make this purchase. Please add credits through Living On or remove some items from your cart.
  		<br />
  		<_E.Button type="primary" size="lg" onClick={() => { browserHistory.push('/ShoppingCart') }}>View My Cart</_E.Button>
  		</p>
  	);
  }
  
  renderVendingItem() {
  	if (this.state.vendingItem) {
  		return (
			<_E.Col>
				<h1 style={{textAlign: 'center'}}>Vending item:<br /><strong>{this.state.vendingItem.name || this.state.vendingItem.productName}</strong></h1>
				<div style={{textAlign: 'center'}}>
				<_E.Spinner size="lg" type="primary" />
					{this.renderVendImage()}
				</div>
			</_E.Col>
  		);
  	}
  	return null;
  }
  
  renderVendImage() {
  	/*
		{this.state.vendingItem.imagePath ? (
			<img src={this.state.vendingItem.imagePath} style={{maxWidth:'35%',display:'block', margin: '1em auto'}} />
		) : null }
	*/
	if (this.state.vendingProductImages && this.state.vendingProductImages.length) {
		return (
			<img src={this.state.vendingProductImages[0].fileData} style={{maxWidth:'50%',display:'block', margin: '1em auto'}} />
		);
	}
	return null;
  }

  renderSpinner(){
    return(
      <_E.Spinner size="md" type="inverted" />
    )
  }

}

export default CustomerCreditVending