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


  {/* Add change listeners to stores*/}
  componentDidMount() {
    var cardTransactionHandler = function(level) {
      if(!RootscopeStore.getSession('bVendingInProcess')){
        if(RootscopeStore.getCache('currentLocation') != "/Card_Vending") {
          browserHistory.push( "/Card_Vending" );
        }
        TsvService.cardTransaction(level);
      }
    };

    TsvService.subscribe("cardTransactionResponse", cardTransactionHandler, "app.shoppingCart");
  }

  {/* Remove change listers from stores*/}
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.shoppingCart");
  }

  render() {

    return (

      <div className="Shopping_Cart" >
        <h2>{Translate.translate('Shopping_Cart', 'ShoppingCart')}</h2>
        <div id="wrapper">

            <table className="cart">

                <tr className="cart"><th></th><th></th><th className="cart">{Translate.translate('Price','Price')}</th><th className="cart">{Translate.translate('Qty','Qty')}</th><th></th></tr>

                <tr className="cart" ng-repeat="prd in cart" className="shoppingCart">

                    <td className="cart">

                        <img id="prdImg" src={prd.imagePath} /> {/*<div id="additionalInfo">*/}

                            <p ng-show="bShowTax">{Translate.translate('Tax','Tax')}: { currencyFilter(salesTaxAmount) }</p>

                            <p>{{translate('TotalPrice')}}: {{ currencyFilter(totalPrice) }}</p>

                        </div>

                        <img class="regularBtn" alt="ShopMore" id="shopMoreImg" ng-src="{{localizedImage('ShopMore.png')}}" err-src="../Images/ShopMore.png" ng-click="shopmore()">

                        <img class="regularBtn" alt="Check Out" id="checkoutImg" ng-src="{{localizedImage('checkout.png')}}" err-src="../Images/checkout.png" ng-click="checkout()">

                        <p><img class="regularBtn" alt="Cancel" id="cancelImg" ng-src="{{localizedImage('cancel.png')}}" err-src="../Images/cancel.png" ng-click="cancel()"></p>

                        <img ng-if="bShowCouponBtn" class="regularBtn" id="couponImg" ng-src="{{localizedImage('coupon.png')}}" err-src="../Images/coupon.png" ng-click="coupon()" alt="Coupon">}

                    </td>

                    <td className="cart">{{ prd.productName }}</td>

                    <td className="cart">{{ currencyFilter(prd.price*prd.qtyInCart) }}</td>

                    <td className="cart">

                        <table className="qty">

                            <tr>

                                <td><img className="smallImg" ng-src="../Images/minus.png" ng-click="minusQty(prd.coilNumber)"></td>

                                <td id="qty">{{ prd.qtyInCart}}</td>

                                <td><img className="smallImg" ng-src="../Images/add.png" ng-click="addQty(prd.coilNumber)"></td>

                            </tr>

                        </table>

                    </td>

                    <td className="cart"><img className="smallImg" ng-src="../Images/remove.png" ng-click="removeAllQty(prd.coilNumber, prd.qtyInCart)"></td>

                </tr>

            </table>
            <div id="additionalInfo">

                <p ng-show="bShowTax">{{translate('Tax')}}: {{ currencyFilter(salesTaxAmount) }}</p>

                <p>{{translate('TotalPrice')}}: {{ currencyFilter(totalPrice) }}</p>

            </div>

            <img className="regularBtn" alt="ShopMore" id="shopMoreImg" ng-src="{{localizedImage('ShopMore.png')}}" err-src="../Images/ShopMore.png" ng-click="shopmore()">

            <img className="regularBtn" alt="Check Out" id="checkoutImg" ng-src="{{localizedImage('checkout.png')}}" err-src="../Images/checkout.png" ng-click="checkout()">

            <p><img className="regularBtn" alt="Cancel" id="cancelImg" ng-src="{{localizedImage('cancel.png')}}" err-src="../Images/cancel.png" ng-click="cancel()"></p>

            <img ng-if="bShowCouponBtn" className="regularBtn" id="couponImg" ng-src="{{localizedImage('coupon.png')}}" err-src="../Images/coupon.png" ng-click="coupon()" alt="Coupon">
        </div>

      </div>
    );
  }

export default Shopping_Cart
