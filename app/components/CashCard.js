import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class Cash_Card extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.setSession('currentView', 'Cash_Card');
    RootscopeActions.updateCredit();

  };

  cancel(){
    TsvService.emptyCart();
    TsvService.gotoDefaultIdlePage();
  }

  cash() {
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");
    browserHistory.push("/Cash_Vending");
  }

  card() {
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");
    browserHistory.push("/Card_Vending");
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("cardTransactionResponse",
      (level) => {
        if(!RootscopeStore.getSession('bVendingInProcess')) {
            if(browserHistory.push() != "/Card_Vending"){
                browserHistory.push("/Card_Vending");
            }

            TsvService.cardTransaction(level);
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
      <div className="Cash_Card">
      <h2>{Translate.translate('Cash_Card', 'InstructionMessage')}</h2>

      <div className="cashAndCards">

          <img className="paymentMethod" onClick={this.cash()} src={Translate.localizedImage('cash.png')} alt="cash">

          <img className="paymentMethod" onClick={this.card()} src={Translate.localizedImage('card.png')} alt="card">

      </div>

      <img id="cancelImg" src={Translate.localizedImage('cancel.png')} onClick={this.cancel()} />

      </div>
    );
  }

}

export default Cash_Card
