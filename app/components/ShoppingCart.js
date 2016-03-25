import React, { Component } from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Shopping_Cart extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    RootscopeActions.setConfig("bDisplayCgryNavigation2", RootscopeStore.getConfig('bDisplayCgryNavigation'));
    RootscopeActions.updateCredit();
    RootscopeActions.setSession('currentView', 'Shopping_Cart');
    RootscopeActions.setCache('currentLocation', '/Shopping_Cart');

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
      browserHistory.push("/View2");
  }

  cancel(){
    TsvService.emptyCart();
    RootscopeActions.setConfig('itemsInCart', 0);
    TsvService.gotoDefaultIdlePage();

  }

  shopmore() {
    TsvService.gotoDefaultIdlePage();
  }

  checkout() {
  	console.warn('sanity check');
  	console.log(browserHistory);
    browserHistory.push("/Cash_Card");
  }

  minusQty(coil) {
	TsvService.removeFromCartByCoilNo(coil, (err, ok) => {
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
	TsvService.addToCartByCoil(coil, (err, ok) => {
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
	});
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("cardTransactionResponse", (level) => {
      if(!RootscopeStore.getSession('bVendingInProcess')){
        if(RootscopeStore.getCache('currentLocation') != "/Card_Vending") {
          browserHistory.push( "/Card_Vending" );
        }
        TsvService.cardTransaction(level);
      }
    }, "app.shoppingCart");
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("cardTransactionResponse", "app.shoppingCart");
  }

  render() {

    return (

      <_E.Row className="Shopping_Cart" >
        <h2>{Translate.translate('Shopping_Cart', 'ShoppingCart')}</h2>
        <_E.Col id="wrapper">
                <_E.Row className="cart">
                	{/*
                	<th></th>
                	<th></th>
                	<th className="cart">{Translate.translate('Shopping_Cart','Price')}</th>
                	<th className="cart">{Translate.translate('Shopping_Cart','Qty')}</th>
                	<th></th>
                	*/}
                	<_E.Col md="40%" lg="40%">{Translate.translate('Shopping_Cart','Product')}</_E.Col>
                	<_E.Col md="8%" lg="8%">{Translate.translate('Shopping_Cart','Price')}</_E.Col>
                	<_E.Col md="37%" lg="37%">{Translate.translate('Shopping_Cart','Qty')}</_E.Col>
                	<_E.Col md="15%" lg="15%"></_E.Col>
                </_E.Row>

                {this.renderShoppingCart()}

            <_E.Row id="additionalInfo">

                { this.state.bShowTax ? this.renderShowTax() : null }

                <p>{Translate.translate('Shopping_Cart','TotalPrice')}: { TsvService.currencyFilter(this.state.totalPrice) }</p>

            </_E.Row>
{/*
                <_E.Col basis="1/4"><img className="regularBtn" alt="ShopMore" id="shopMoreImg" src={Translate.localizedImage('ShopMore.png')} onClick={this.shopmore()}/></_E.Col>
                <_E.Col basis="1/4"><img className="regularBtn" alt="Check Out" id="checkoutImg" src={Translate.localizedImage('checkout.png')} onClick={this.checkout()}/></_E.Col>
*/}
                <_E.Col basis="1/4"><_E.Button type="primary" onClick={this.shopmore}>{Translate.translate('Shopping_Cart','Shop More')}</_E.Button></_E.Col>
                <_E.Col basis="1/4"><_E.Button type="success" onClick={this.checkout}>{Translate.translate('Shopping_Cart','Checkout')}</_E.Button></_E.Col>
                <_E.Col basis="1/4"><_E.Button type="warning" onClick={this.cancel}>{Translate.translate('Shopping_Cart','Cancel')}</_E.Button></_E.Col>

                { this.state.bShowCouponBtn ? this.renderCouponButton() : null }

            </_E.Col>

      </_E.Row>
    );

    /*
    <div className="Shopping_Cart" >
      <h2>{Translate.translate('Shopping_Cart', 'ShoppingCart')}</h2>
      <div id="wrapper">

          <table className="cart">

              <tr className="cart"><th></th><th></th><th className="cart">{Translate.translate('Shopping_Cart','Price')}</th><th className="cart">{Translate.translate('Shopping_Cart','Qty')}</th><th></th></tr>

              {cart.map((prd, $index) => {
                  return (
                    <tr key={$index} className="cart" className="shoppingCart">
                      <td className="cart">

                          <img id="prdImg" src={prd.imagePath} /> {/*err-src="../Images/ProductImageNotFound.png"}

                      </td>

                      <td className="cart">{ prd.productName }</td>

                      <td className="cart">{ TsvService.currencyFilter(prd.price*prd.qtyInCart) }</td>

                      <td className="cart">

                          <table className="qty">

                              <tr>

                                  <td><img className="smallImg" src="../Images/minus.png" onClick={this.minusQty.bind(this, prd.coilNumber)}></td>

                                  <td id="qty">{ prd.qtyInCart}</td>

                                  <td><img className="smallImg" src="../Images/add.png" onClick={this.addQty.bind(this, prd.coilNumber)}></td>

                              </tr>

                          </table>

                      </td>

                      <td className="cart"><img className="smallImg" src="../Images/remove.png" onClick={this.removeAllQty.bind(this, prd.coilNumber, prd.qtyInCart)}></td>
                    </tr>
                  );
                }
              )}



          </table>
          <div id="additionalInfo">

              { if (this.state.bShowTax) { this.renderShowTax() } }

              <p>{Translate.translate('Shopping_Cart','TotalPrice')}: { TsvService.currencyFilter(totalPrice) }</p>

          </div>

          <img className="regularBtn" alt="ShopMore" id="shopMoreImg" src={Translate.localizedImage('ShopMore.png')} onClick={this.shopmore()}/> {/*err-src="../Images/ShopMore.png"}

          <img className="regularBtn" alt="Check Out" id="checkoutImg" src={Translate.localizedImage('checkout.png')} onClick={this.checkout()}/> {/*err-src="../Images/checkout.png"}

          <p><img className="regularBtn" alt="Cancel" id="cancelImg" src={Translate.localizedImage('cancel.png')} onClick={this.cancel()}></p> {/*err-src=""../Images/cancel.png"}

          { if (this.state.bShowCouponBtn) { this.renderCouponButton() } }

      </div>

    </div>

    */
  }
  
  renderShoppingCart() {
  	if (!this.state.cart || !this.state.cart.length) {
  		return null;
  	}

	return this.state.cart.map((prd, $index) => {
		return (
		  <_E.Row key={$index} className="cart" className="shoppingCart">
			<_E.Col md="15%" lg="15%" className="cart">

				<img id="prdImg" src={prd.imagePath} /> {/*err-src="../Images/ProductImageNotFound.png"*/}

			</_E.Col>

			<_E.Col md="25%" lg="25%" className="cart">{ prd.productName }</_E.Col>

			<_E.Col md="8%" lg="8%" className="cart">{ TsvService.currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

			<_E.Col md="37%" lg="37%" className="cart">


					<_E.Row>

						<_E.Col><_E.Button type="primary" onClick={this.minusQty.bind(this, prd.coilNumber)}><_E.Glyph icon="dash" /></_E.Button></_E.Col>
						{/*<img className="smallImg" src="../Images/minus.png" onClick={this.minusQty.bind(this, prd.coilNumber)}>*/}

						<_E.Col id="qty">{ prd.qtyInCart}</_E.Col>

						<_E.Col><_E.Button type="primary" onClick={this.addQty.bind(this, prd.coilNumber)}><_E.Glyph icon="plus" /></_E.Button></_E.Col>
						{/*<img className="smallImg" src="../Images/add.png" onClick={this.addQty.bind(this, prd.coilNumber)}>*/}

					</_E.Row>


			</_E.Col>

			<_E.Col md="15%" lg="15%" className="cart"><_E.Button type="danger" onClick={this.removeAllQty.bind(this, prd.coilNumber, prd.qtyInCart)}><_E.Glyph icon="circle-slash" /></_E.Button></_E.Col>
			{/*<img className="smallImg" src="../Images/remove.png" onClick={this.removeAllQty.bind(this, prd.coilNumber, prd.qtyInCart)}>*/}
		  </_E.Row>
		);
	  }
	)
  }

  renderCouponButton() {
    // <img className="regularBtn" id="couponImg" src={Translate.localizedImage('coupon.png')} onClick={this.coupon()} alt="Coupon"/>
    return (
        <_E.Col basis="1/4"><_E.Button type="primary" onClick={this.coupon}>{Translate.translate('Shopping_Cart','Coupon')}</_E.Button></_E.Col>
    )
  }

  renderShowTax() {
    return (
     <p>{Translate.translate('Shopping_Cart', 'Tax')}: { TsvService.currencyFilter(this.state.salesTaxAmount) }</p>
    )
  }
}

export default Shopping_Cart
