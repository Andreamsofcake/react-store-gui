import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Cash extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Cash');
    TsvService.enablePaymentDevice()
    this.state = {
      insertedAmount: RootscopeStore.getSession('inserted')
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      hintMsg: "Insert Cash Now....",
      salesTaxAmount: RootscopeStore.getCache('shoppingCart.summary.salesTaxAmount'),
      showCancelBtnCash: true,
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      item: RootscopeStore.getCache('shoppingCart.detail')[0]
    };
      TsvService.startPaymentTimer();

    if(RootscopeStore.getSession('bVendingInProcess')){

        this.state.showSpinner = true;
        TSVService.stopPaymentTimer();
        this.state.hintMsg = "Vending...";
        this.state.showCancelBtnCash = false;
      }

  }


  cancel(){
    TsvService.emptyCart();
    this.insertedAmount = 0;
    stopPaymentTimer();
    browserHistory.push("/view1");
  }

  checkBalance(){
      var total = RootscopeStore.getCache('shoppingCart.summary.TotalPrice');

      if((this.insertedAmount * 100) >= (total * 100) && RootscopeStore.getCache('shoppingCart.detail').length > 0){
          TSVService.disablePaymentDevice();
          if(!RootscopeStore.getSession('bVendingInProcess')){
              TsvService.startVend();
              RootscopeActions.setSession('bVendingInProcess', true);

              this.setState({
                hintMsg: "Vending...",
                showCancelBtnCash: false,
                showSpinner: true
              });
          }
          return 1;
      }
      return -1;
  }

  // Add change listeners to stores
  componentDidMount() {

    TvsService.subscribe("creditBalanceChanged", (ins, balance) => {
        if(RootscopeStore.getSession('currentView') != "Cash")    return;

        RootscopeActions.setSession('inserted', balance/100.00);
        RootscopeActions.setSession('creditBalance', this.state.summary.TotalPrice - balance/100.00);

        this.checkBalance();
        TsvService.resetPaymentTimer();
        this.setState({
            insertedAmount: balance/100.00
        });
    });
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Cash" >

        <img id="prdImg" src={ item.imagePath} alt="productImage" />

        <div id = "cashMsg">
            <p>Total: { summary.TotalPrice }</p>

            <p>Inserted: {this.insertedAmount }</p>
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

export default Cash
