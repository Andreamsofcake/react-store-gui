import React, { Component } from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'
import ShoppingCartItem from './ShoppingCartItem'

class Shopping_Cart extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    RootscopeActions.setConfig("bDisplayCgryNavigation2", RootscopeStore.getConfig('bDisplayCgryNavigation'));
    RootscopeActions.updateCredit();
    //RootscopeActions.setSession('currentView', 'Shopping_Cart');
    //RootscopeActions.setCache('currentLocation', '/Shopping_Cart');

    this.state = {
      totalPrice: RootscopeStore.getCache('shoppingCart.summary.totalPrice'),
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
    this._onRootstoreChange = this._onRootstoreChange.bind(this);
  }

  back() {
      browserHistory.push("/View2");
  }

  cancel(){
    TsvService.emptyCart(null, () => {});
    RootscopeActions.setConfig('itemsInCart', 0);
    //TsvService.gotoDefaultIdlePage();
    browserHistory.push('/Storefront');

  }

  shopmore() {
    //TsvService.gotoDefaultIdlePage();
    browserHistory.push('/Storefront');
  }

  checkout() {
  	console.warn('sanity check');
  	console.log(browserHistory);
    browserHistory.push("/Cash_Card");
  }

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



  // Add change listeners to stores
  componentDidMount() {
    RootscopeStore.addChangeListener(this._onRootstoreChange);
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
    RootscopeStore.removeChangeListener(this._onRootstoreChange);
  }

  _onRootstoreChange() {
    var data = RootscopeStore.getCache('shoppingCart');
    if (!data.detail || !data.detail.length) {
      //TsvService.gotoDefaultIdlePage();
	    browserHistory.push('/Storefront');
    } else {
      this.setState({
        cart: data.detail,
        summary: data.summary
      })
    }
  }

// w00t

  render() {

    return (

      <_E.Row className="Shopping_Cart" >
        <h2>{Translate.translate('Shopping_Cart', 'ShoppingCart')}</h2>
        <_E.Col className="wrapper">
                <_E.Row className="row-border shopping-cart-table">
                	{/*
                	<th></th>
                	<th></th>
                	<th className="cart">{Translate.translate('Shopping_Cart','Price')}</th>
                	<th className="cart">{Translate.translate('Shopping_Cart','Qty')}</th>
                	<th></th>
                	* /}
                	<_E.Col xs="40%" sm="40%" md="40%" lg="40%" className="columnHeader">Items</_E.Col>
                	<_E.Col xs="8%" sm="8%" md="8%" lg="8%" className="columnHeader">{Translate.translate('Shopping_Cart','Price')}</_E.Col>
                	<_E.Col xs="20%" sm="20%" md="20%" lg="20%" className="columnHeader">{Translate.translate('Shopping_Cart','Qty')}</_E.Col>
                	<_E.Col xs="20%" sm="20%" md="20%" lg="20%" className="columnHeader">Remove</_E.Col>
                	*/}
                </_E.Row>

                {this.renderShoppingCart()}

            <_E.Row className="row-border shopping-cart-table">

                { this.state.bShowTax ? this.renderShowTax() : null }

                <p>{Translate.translate('Shopping_Cart','TotalPrice')}: { this.state.totalPrice ? TsvService.currencyFilter(this.state.totalPrice) : 0.00 }</p>

            </_E.Row>
            <_E.Row>
{/*
                <_E.Col basis="1/4"><img className="regularBtn" alt="ShopMore" id="shopMoreImg" src={Translate.localizedImage('ShopMore.png')} onClick={this.shopmore()}/></_E.Col>
                <_E.Col basis="1/4"><img className="regularBtn" alt="Check Out" id="checkoutImg" src={Translate.localizedImage('checkout.png')} onClick={this.checkout()}/></_E.Col>
*/}
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3"><_E.Button type="primary" size="lg" onClick={this.shopmore.bind(this)}>{Translate.translate('Shopping_Cart','Shop_More')}</_E.Button></_E.Col>
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3">{this.renderCheckoutButton()}</_E.Col>
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3"><_E.Button type="danger" onClick={this.cancel.bind(this)}><_E.Glyph icon="circle-slash" />{Translate.translate('Shopping_Cart','Cancel')}</_E.Button></_E.Col>
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3" style={{marginTop:'4em'}}>{ this.state.bShowCouponBtn ? this.renderCouponButton() : null }</_E.Col>

{/*
                <_E.Col basis="25%"><_E.Button type="danger" component={(<Link to="/Product_Search">TEST: go to product search page</Link>)} /></_E.Col>
                <_E.Col basis="25%"><_E.Button type="danger" component={(<Link to="/Category_Search">TEST: go to category search page</Link>)} /></_E.Col>
*/}

            </_E.Row>

            </_E.Col>

      </_E.Row>
    );

  }

  renderShoppingCart() {
  	if (!this.state.cart || !this.state.cart.length) {
  		return null;
  	}

	return this.state.cart.map((prd, $index) => {
		return (
  		  <ShoppingCartItem
  			 key={$index}
  			 data={prd}
  		  />
  		);
  	  })
  }
  
  renderCheckoutButton() {
  	if (this.state.cart && this.state.cart.length) {
  		return (
			<_E.Button type="success" size="lg" onClick={this.checkout.bind(this)}>{Translate.translate('Shopping_Cart','Checkout')}</_E.Button>
  		);
  	}
  	return null;
  }

  renderCouponButton() {
    // <img className="regularBtn" id="couponImg" src={Translate.localizedImage('coupon.png')} onClick={this.coupon()} alt="Coupon"/>
    return (
        <_E.Button type="primary" onClick={this.coupon}>{Translate.translate('Shopping_Cart','Coupon')}</_E.Button>
    )
  }

  renderShowTax() {
    return (
     <p>{Translate.translate('Shopping_Cart', 'Tax')}: { TsvService.currencyFilter(this.state.salesTaxAmount) }</p>
    )
  }
}

export default Shopping_Cart
