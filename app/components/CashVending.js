import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Cash_Vending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Cash_Vending');
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.updateCredit();
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");

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

        TSVService.stopPaymentTimer();

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
    //browserHistory.push("/view1");
    TsvService.gotoDefaultIdlePage();
  }

  checkBalance(){
	  var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice');

	  // cash.js logic:
	  //if ((this.insertedAmount * 100) >= (total * 100) && RootscopeStore.getCache('shoppingCart.detail', []).length > 0){
	  if (RootscopeStore.getCache('creditBalance') >= total && RootscopeStore.getCache('shoppingCart.detail', []).length > 0) {

		  TsvService.disablePaymentDevice();

		  if(!RootscopeStore.getSession('bVendingInProcess')){
			  // only in cash.js:
			  //RootscopeActions.setSession('bVendingInProcess', true);
			  TsvService.startVend();

			  this.setState({
				  hintMsg: Translate.translate('Cash_Vending','HintMessageVending'),
				  showCancelBtnCash: false,
				  showSpinner: true
			  });
		  }
		  return false;
	  }
	  return false;
  }

  // Add change listeners to stores
  componentDidMount() {

    TvsService.subscribe("creditBalanceChanged", (ins, balance) => {
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
        //this.checkBalance();

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
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.cashVending")
    TsvService.unsubscribe("creditBalanceChanged", "app.cashVending");
    TsvService.unsubscribe("vendResponse", "app.cashVending")
  }

  render() {
    return (
      <_E.Row className="Cash_Vending" >
        <_E.Col>

              <_E.Row>
            {cart.map( (prd, $index) => {
                return (
              	<_E.Col basic="33%" key={$index}>
                  <img id={"prdImg"+$index} src={ prd.imagePath} alt="productImage" />
                </_E.Col>
                )
              })
            }
              </_E.Row>

        </_E.Col>
      <_E.Row id = "cashMsg">
            <p>{Translate.translate('Cash_Vending', 'TotalAmountLabel')} Total: { TsvService.currencyFilter(this.state.summary.TotalPrice) }</p>

            <p>{Translate.translate('Cash_Vending', 'InsertedAmountLabel')} {TsvService.currencyFilter(this.state.insertedAmount) }</p>
        </_E.Row>

        <p id="hint">{ this.hintMsg }</p>


        { this.state.showCancelBtnCash ? this.renderCancelBtnCash() : null }

        { this.state.showSpinner ? this.renderSpinner() : null }

      </_E.Row>
    );

    /*
      <div className="Cash_Vending" >

        <table class="cart">
            <tr>
          {cart.map( (prd, $index) => {
              return (
              <td key={$index}><img id={"prdImg"+$index} src={ prd.imagePath} alt="productImage" /></td>
              )
            })
          }
            </tr>
        </table>

          <div id = "cashMsg">
                <p>{Translate.translate('Cash_Vending', 'TotalAmountLabel')} Total: { TsvService.currencyFilter(this.state.summary.TotalPrice) }</p>

                <p>{Translate.translate('Cash_Vending', 'InsertedAmountLabel')} {TsvService.currencyFilter(this.state.insertedAmount) }</p>
            </div>

            <p id="hint">{ this.hintMsg }</p>


            { if (this.state.showCancelBtnCash) { this.renderCancelBtnCash()} }

            { if (this.state.showSpinner) { this.renderSpinner()} }

      </div>

    */
  }

  renderCancelBtnCash(){
    // <img id="cancelImg" src="../Images/cancel.png" onClick={this.cancel.bind(this)} />
    return(
      <_E.Button type="warning" id="cancelImg" onClick={this.cancel.bind(this)}><_E.Glyph icon="cancel-slash" /></_E.Button>
    )
  }

  renderSpinner(){
    return(
      <_E.Spinner size="md" type="inverted" />
    )
  }

}

export default Cash_Vending
