import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Card_Vending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Card_Vending');
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.updateCredit();
    TsvService.enablePaymentDevice()
    this.state = {
      cart: RootscopeStore.getCache('shoppingCart.detail'),
      item: RootscopeStore.getCache('shoppingCart.detail')[0],
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      showCancelBtn: true
    };
      TsvService.resetPaymentTimer();

    if(RootscopeStore.getSession('cardMsg')!= Translate.translate('ProcessingMessage')
      && RootscopeStore.getSession('cardMsg')!= Translate.translate('VendingMessage')
      && RootscopeStore.getSession('cardMsg')!= Translate.translate('InstructionMessage')
      ){
        TsvService.startCardErrorTimer();
       }

  }


  cancel(){
    TsvService.stopPaymentTimer();
    TsvService.emptyCart();
    TsvService.gotoDefaultIdlePage();
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

  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Card_Vending" >
        <h2>{Translate.translate('Card_Vending', 'CardVending')}</h2>
      </div>
    );
  }

}

export default Card_Vending
