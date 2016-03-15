import React from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../lib/TsvService'
import Translate from '../lib/Translate'
import RootscopeStore from '../store/RootscopeStore'

class Shopping_Cart extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    RootscopeActions.setConfig("bDisplayCgryNavigation2", RootscopeStore.getConfig('bDisplayCgryNavigation'));
    RootscopeActions.updateCredit();
    RootscopeActions.setSession('currentView', 'Shopping_Cart');

    this.state = {
      totalPrice: RootscopeStore.getCache('shoppingCart.summary.TotalPrice'),
      cart: RootscopeStore.getCache('shoppingCart.detail'),
      salesTaxAmount: RootscopeStore.getCache('shoppingCart.summary.salesTaxAmount'),
      emptyCart: false,
      bShowCgryNav: true
    };

    RootscopeActions.setState('summary', 'this.state.summary') {/* What?*/}

    if (this.state.salesTaxAmount > 0) {
      bShowTax: true;
    };

    if ( RootscopeStore.getCache('custommachinesettings.bHasCouponCodes' ){
        if(RootscopeStore.getCache('custommachinesettings.bHasCouponCodes.toLowerCase()' === true){
            this.state = {
              bShowCouponBtn: true
            }
       }
    };

  }

  back() {
      browserHistory.push("/view2");
  }

  cancel(){
    RootscopeActions.emptyCart();
    RootscopeActions.setConfig('itemsInCart', 0)
    RootscopeActions.gotoDefaultIdlePage();

  }
  shopmore(){}
  minusQty(coil){}
  addQty(coil){}
  removeAllQty(coil, qty){}


  {/* Add change listeners to stores*/}
  componentDidMount() {
  }

  {/* Remove change listers from stores*/}
  componentWillUnmount() {
  }

  render() {

    return (

      <div className="Shopping_Cart" >
        <h2>{Translate.translate('Shopping_Cart', 'ShoppingCart')}</h2>
      </div>
    );
  }

export default Shopping_Cart
