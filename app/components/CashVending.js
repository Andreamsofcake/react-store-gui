import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Cash_Vending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Cash_Vending');
    RootscopeActions.updateCredit();
    TsvService.enablePaymentDevice();
    this.state = {
      insertedAmount: RootscopeStore.getSession('creditBalance')
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      hintMsg: Translate.translate('Cash_Vending', 'HintMessageInsertCash'),
      salesTaxAmount: RootscopeStore.getCache('shoppingCart.summary.salesTaxAmount'),
      showCancelBtnCash: true,
      cart: RootscopeStore.getCache('shoppingCart.detail'),
      item: RootscopeStore.getCache('shoppingCart.detail')[0]
    };

    TsvService.resetPaymentTimer();
    RootscopeActions.setSession


    if(RootscopeStore.getSession('bVendingInProcess')){

        TSVService.stopPaymentTimer();

        this.state.showSpinner = true;
        this.state.hintMsg = Translate.translate('Cash_Vending','HintMessageVending');
        this.state.showCancelBtnCash = false;
      } else {
      	TsvService.startPaymentTimer();
      }

  }


  cancel(){
    RootscopeActions.setSession('insertedAmount', 0);
    TsvService.emptyCart();
    TsvService.stopPaymentTimer();
    browserHistory.push("/view1");
  }

  checkBalance(){
      var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice');

      if((this.insertedAmount * 100) >= (total * 100) && RootscopeStore.getCache('shoppingCart.detail', []).length > 0){
          TSVService.disablePaymentDevice();
          if(!RootscopeStore.getSession('bVendingInProcess')){
              RootscopeActions.setSession('bVendingInProcess', true);
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
        if(RootscopeStore.getSession('currentView') != "Cash")    return;

        RootscopeActions.setSession('inserted', balance/100.00);
        RootscopeActions.setSession('creditBalance', this.state.summary.TotalPrice - balance/100.00);

        TsvService.resetPaymentTimer();

        this.checkBalance();
        this.setState({
            insertedAmount: balance/100.00
        });
    });

    TsvService.subscribe("cardTransactionRespose", (level) => {
        if(!TsvService.getSession('bVendingInProcess') {
            if(browserHistory.push() != "/Card_Vending"){
                browserHistory.push("/Card_Vending");
            }

            TsvService.cardTransaction(level);
        }
    }

    TsvService.subscribe("vendResponse",(processStatus) =>{
      TsvService.vendResponse(processStatus);
      TsvService.stopPaymentTimer();

    });
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.cashVending")
    TsvService.unsubscribe("creditBalanceChanged", "app.cashVending");
    TsvService.unsubscribe("vendResponse", "app.cashVending")
  }

  render() {
    return (
      <div className="Cash" >

      {cart.map((prd, $index) => {
          return (
        <img key={$index} id="prdImg" src={ prd.imagePath} alt="productImage" />
        )}
      }

      <div id = "cashMsg">
            <p>{Translate.translate('Cash_Vending', 'TotalAmountLabel')} Total: { TsvService.currencyFilter(summary.TotalPrice) }</p>

            <p>{Translate.translate('Cash_Vending', 'InsertedAmountLabel')} {TsvService.currencyFilter(this.insertedAmount) }</p>
        </div>

        <p id="hint">{ this.hintMsg }</p>


        { if (this.state.showCancelBtnCash) { this.renderCancelBtnCash()} }

        { if (this.state.showSpinner) { this.renderSpinner()} }

      </div>
    );
  }

  renderCancelBtnCash(){
    return(
      <img id="cancelImg" src="../Images/cancel.png" onClick={this.cancel()} />
    )
  }

  renderSpinner(){
    return(
      <_E.Spinner size="md" type="inverted"   />
    )
  }

}

export default Cash_Vending
