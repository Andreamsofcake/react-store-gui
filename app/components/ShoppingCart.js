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
      bShowCgryNav: true,
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      bShowTax: false,
      bShowCouponBtn: false
    };

    RootscopeActions.setConfig('summary', this.state.summary);

    if (this.state.salesTaxAmount > 0) {
		this.state.bShowTax = true;
    };

    if (RootscopeStore.getCache('custommachinesettings.bHasCouponCodes')) {
        this.state.bShowCouponBtn = true;
    }

  }

  back() {
      browserHistory.push("/view2");
  }

  cancel(){
    TsvService.emptyCart();
    RootscopeActions.setConfig('itemsInCart', 0);
    TsvService.gotoDefaultIdlePage();

  }
  shopmore() {
    TsvService.gotoDefaultIdlePage();
  }

  minusQty(coil) {
	TsvService.removeFromCartByCoilNo(coil, (err, ok) {
		if (err) throw err;
		TsvService.fetchShoppingCart2(null, (err, data) => {

			if (err) throw err;
			RootscopeActions.setCache('shoppingCart', data);

			if (!data.detail || !data.detail.length) {
				TsvService.gotoDefaultIdlePage();
			} else {
				this.setState({
					cart: data.detail,
					totalPrice: data.summary.TotalPrice,
					emptyCart: data.detail.length <= 0
				});
			}

		});
	});
  }

  addQty(coil) {
	TsvService.addToCartByCoil(coil, (err, ok) {
		if (err) throw err;
		TsvService.fetchShoppingCart2(null, (err, data) => {

			if (err) throw err;
			RootscopeActions.setCache('shoppingCart', data);

			this.setState({
				cart: data.detail,
				totalPrice: data.summary.TotalPrice
			});

		});
	});
	/*
	TsvService.addToCartByCoilAsync(coil)
	.then( ok => {
		TsvService.fetchShoppingCart2Async()
	})
	.then( data => {
		RootscopeActions.setCache('shoppingCart', data);
		this.setState({
			cart: data.detail,
			totalPrice: data.summary.TotalPrice
		});
	})
	.catch( (e) => {
		throw e
	})
	*/
  }

  removeAllQty(coil, qty) {
	TsvService.fetchShoppingCart2(null, (err, data) => {

		if (err) throw err;
		RootscopeActions.setCache('shoppingCart', data);

		function removeQty(qty) {
			if (qty > 0) {
				qty -= 1;
				TsvService.removeFromCartByCoilNo(coil, (err, ok) => {
					if (err) throw err;
					TsvService.fetchShoppingCart2(null, (err, data) => {
						if (err) throw err;
						RootscopeActions.setCache('shoppingCart', data);
						removeQty(qty);
					});
				});
			} else {
				TsvService.fetchShoppingCart2(null, (err, data) => {
					if (err) throw err;
					RootscopeActions.setCache('shoppingCart', data);

					if (!data.detail || !data.detail.length) {
						TsvService.gotoDefaultIdlePage();
					} else {
						this.setState({
							cart: data.detail,
							totalPrice: data.summary.TotalPrice,
							emptyCart: data.detail.length <= 0
						});
					}

				});
			}
		}
  }

  cardTransactionHandler(level) {
    if(!RootscopeStore.getSession.bVendingInProcess){
      if(RootscopeStore.getCache('currentLocation') != "/Card_Vending") {
        browserHistory.push( "/Card_Vending" );
      }
      TsvService.cardTransaction(level);
    }
  }

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
