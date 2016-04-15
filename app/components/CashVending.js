import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import VendCartItem from './VendCartItem'

class Cash_Vending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Cash_Vending');
    //RootscopeActions.setCache('currentLocation', '/Cash_Vending');
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.updateCredit();
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH", () => {});

    this.state = {
      insertedAmount: RootscopeStore.getSession('creditBalance'),
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      hintMsg: Translate.translate('Cash_Vending', 'HintMessageInsertCash'),
      // only in cash.js:
      //salesTaxAmount: RootscopeStore.getCache('shoppingCart.summary.salesTaxAmount'),
      showCancelBtnCash: true,
      cart: RootscopeStore.getCache('shoppingCart.detail'),
      // only in cash.js:
      //item: RootscopeStore.getCache('shoppingCart.detail')[0]
    };

    TsvService.resetPaymentTimer();

    // KENT note: this session var I believe is not used in Shopping Cart regime, and checkBalance only returns a boolean
    RootscopeActions.setSession('bVendedOldCredit', this.checkBalance());

    if (RootscopeStore.getSession('bVendingInProcess')) {

        TsvService.stopPaymentTimer();

        this.state.showSpinner = true;
        this.state.hintMsg = Translate.translate('Cash_Vending','HintMessageVending');
        this.state.showCancelBtnCash = false;

      } else {
      	TsvService.startPaymentTimer();
      }

  }

  cancel(){
  	// only in cash.js:
    //RootscopeActions.setSession('insertedAmount', 0);
    TsvService.emptyCart();
    TsvService.stopPaymentTimer();
  	// only in cash.js:
    //browserHistory.push("/View1");
    TsvService.gotoDefaultIdlePage();
  }

  checkBalance(){
	  var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice')
	  	, cart_detail = RootscopeStore.getCache('shoppingCart.detail') || []
	  	, balance = RootscopeStore.getSession('creditBalance')
	  	;

	  // cash.js logic:
	  //if ((this.insertedAmount * 100) >= (total * 100) && RootscopeStore.getCache('shoppingCart.detail', []).length > 0){
	  if (balance >= total && cart_detail.length > 0) {

		  TsvService.disablePaymentDevice(null, () => {});

		  if(!RootscopeStore.getSession('bVendingInProcess')){
			  // only in cash.js:
			  RootscopeActions.setSession('bVendingInProcess', true);
			  TsvService.startVend(null, () => {});

			  this.setState({
				  hintMsg: Translate.translate('Cash_Vending','HintMessageVending'),
				  showCancelBtnCash: false,
				  showSpinner: true
			  });
		  }
		  console.warn('checkBalance() returning false [1]');
		  return false;
	  }
	  console.warn('checkBalance() returning false [2]');
	  console.log([cart_detail, balance]);
	  return false;
  }

  // Add change listeners to stores
  componentDidMount() {

    TsvService.subscribe("creditBalanceChanged", (ins, balance) => {
    	// only in cash.js:
        //if (RootscopeStore.getSession('currentView') != "Cash") return;

        RootscopeActions.setSession('creditBalance', balance/100.00);
        // only in cash.js:
        //RootscopeActions.setSession('creditBalance', this.state.summary.TotalPrice - balance/100.00);

        var state = {
        	insertedAmount: balance/100.00
        };

        if (!RootscopeStore.getSession('bVendingInProcess')) {
        	state.hintMsg = Translate.translate('Cash_Vending','HintMessageVending');
        	state.showSpinner = true;
        	state.showCancelBtnCash = false;
        }

        // only in cash.js:
        this.checkBalance();

        TsvService.resetPaymentTimer();
        this.setState(state);
    }, 'app.cashVending');

    TsvService.subscribe("cardTransactionRespose", (level) => {
        if(!RootscopeStore.getSession('bVendingInProcess')) {

            if (RootscopeStore.getCache('currentLocation') != "/Card_Vending"){
                browserHistory.push("/Card_Vending");
            }

            TsvService.cardTransaction(level);
        }
    }, 'app.cashVending');

    TsvService.subscribe("vendResponse",(processStatus) =>{
      TsvService.vendResponse(processStatus);
      TsvService.stopPaymentTimer();

    }, 'app.cashVending');
    
    // let's check the balance at module load:
    this.checkBalance();
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.cashVending")
    TsvService.unsubscribe("creditBalanceChanged", "app.cashVending");
    TsvService.unsubscribe("vendResponse", "app.cashVending")
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
			<p style={{fontSize:'1.5em'}}>{Translate.translate('Cash_Vending', 'TotalAmountLabel')} Total: <strong>{ TsvService.currencyFilter(this.state.summary.TotalPrice) }</strong></p>
		</_E.Col>
		<_E.Col sm="1/2">
			<p style={{fontSize:'1.5em'}}>{Translate.translate('Cash_Vending', 'InsertedAmountLabel')} <strong>${ this.state.insertedAmount ? TsvService.currencyFilter(this.state.insertedAmount) : '0.00' }</strong></p>
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

export default Cash_Vending
