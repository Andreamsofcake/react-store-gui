import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'
//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'
import ShoppingCartItem from './ShoppingCartItem'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	currencyFilter,
	gotoDefaultIdlePage,
	cardTransaction,
	updateCredit,
	startGeneralIdleTimer,
	emptyCart
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('ShoppingCart');

class ShoppingCart extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    // bDisplayCgryNavigation2 is not used anywhere that I can see:
    //TsvSettingsStore.setConfig("bDisplayCgryNavigation2", TsvSettingsStore.getConfig('bDisplayCgryNavigation'));
    updateCredit();

    this.state = {
      totalPrice: TsvSettingsStore.getCache('shoppingCart.summary.TotalPrice'),
      cart: TsvSettingsStore.getCache('shoppingCart.detail'),
      salesTaxAmount: TsvSettingsStore.getCache('shoppingCart.summary.salesTaxAmount'),
      emptyCart: false,
      bShowCgryNav: true,
      summary: TsvSettingsStore.getCache('shoppingCart.summary'),
      bShowTax: false,
      bShowCouponBtn: false
    };

    //TsvSettingsStore.setConfig('summary', this.state.summary);

    if (this.state.salesTaxAmount > 0) {
		this.state.bShowTax = true;
    };

    if (TsvSettingsStore.getCache('custommachinesettings.bHasCouponCodes')) {
        this.state.bShowCouponBtn = true;
    }

    this._onRootstoreChange = this._onRootstoreChange.bind(this);
    this._onTsvChange = this._onTsvChange.bind(this);
  }

  cancel(){
    emptyCart();
    //TsvSettingsStore.setConfig('itemsInCart', 0);
    //gotoDefaultIdlePage();
    browserHistory.push('/Storefront');

  }

	componentDidMount() {
		TsvSettingsStore.addChangeListener(this._onRootstoreChange);
		TsvStore.addChangeListener(this._onTsvChange);
		TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setCache('shoppingCart', data);
		});
		startGeneralIdleTimer(this.props.location.pathname);
	}
	
	componentWillUnmount() {
		TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
		TsvStore.removeChangeListener(this._onTsvChange);
	}

	_onTsvChange(event) {
		if (event && event.method === 'cardTransactionResponse') {
			if (!TsvSettingsStore.getSession('bVendingInProcess')) {
				cardTransaction(event.data[0]);
				browserHistory.push( "/CardVending" );
			}
		}
	}
	
  _onRootstoreChange() {
    var data = TsvSettingsStore.getCache('shoppingCart');

	if (this.state.loadedCartOnce && (!data.detail || !data.detail.length)) {
	  	//gotoDefaultIdlePage();
		browserHistory.push('/Storefront');

	} else {
	  this.setState({
		cart: data.detail,
		totalPrice: data.summary.TotalPrice,
		summary: data.summary,
		loadedCartOnce: true
	  })
	}

  }

  render() {

    return (

      <_E.Row className="ShoppingCart" >
        <h2>{Translate.translate('ShoppingCart', 'ShoppingCart')}</h2>
        <_E.Col className="wrapper">

                {this.renderShoppingCart()}

                {this.state.cart && this.state.cart.length ? (

            <_E.Row className="row-border shopping-cart-table">

                { this.state.bShowTax ? this.renderShowTax() : null }

                <p>{Translate.translate('ShoppingCart','TotalPrice')}: {this.getTotalPrice()}</p>

            </_E.Row>
                ) : (<p style={{margin: '40px auto'}}>&nbsp;</p>)}

            <_E.Row>

                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3"><_E.Button type="primary" size="lg" onClick={() => { browserHistory.push('/Storefront') }}>{Translate.translate('ShoppingCart','Shop_More')}</_E.Button></_E.Col>
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3">{this.renderCheckoutButton()}</_E.Col>
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3"><_E.Button type="danger" onClick={this.cancel.bind(this)}><_E.Glyph icon="circle-slash" />{Translate.translate('ShoppingCart','Cancel')}</_E.Button></_E.Col>
                <_E.Col xs="1/3" sm="1/3" md="1/3" lg="1/3" style={{marginTop:'4em'}}>{ this.state.bShowCouponBtn ? this.renderCouponButton() : null }</_E.Col>

            </_E.Row>

            </_E.Col>

      </_E.Row>
    );

  }
  
  getTotalPrice() {
  	if (this.state.totalPrice) {
  		return currencyFilter(this.state.totalPrice);
  	}
  	if (this.state.summary.TotalPrice) {
  		return currencyFilter(this.state.summary.TotalPrice);
  	}
  	// ok, must calculate for some reason:
  	var total = 0;
  	this.state.cart.forEach( C => {
  		total += (C.price * C.qtyInCart);
  	});
  	return currencyFilter(total);
  }

  renderShoppingCart() {
  	if (!this.state.cart || !this.state.cart.length) {
  		return (
  			<div>
  				<h2 style={{margin: '40px auto'}}>You don't have any items in your cart</h2>
  			</div>
  		);
  	}
  	
  	Big.log('renderShoppingCart, check state');
  	Big.log(this.state);

	return this.state.cart.map((prd, $index) => {
		return (
  		  <ShoppingCartItem
  			 key={$index}
  			 data={prd}
  			 location={this.props.location}
  		  />
  		);
  	  })
  }
  
  renderCheckoutButton() {
  	if (this.state.cart && this.state.cart.length) {
  		var payLocation = '/CustomerCreditVending'; // '/ChooseCashCard'
  		return (
			<_E.Button type="success" size="lg" onClick={() => { browserHistory.push(payLocation) }}>{Translate.translate('ShoppingCart','Checkout')}</_E.Button>
  		);
  	}
  	return null;
  }

  renderCouponButton() {
    // <img className="regularBtn" id="couponImg" src={Translate.localizedImage('coupon.png')} onClick={this.coupon()} alt="Coupon"/>
    return (
        <_E.Button type="primary" onClick={this.coupon}>{Translate.translate('ShoppingCart','Coupon')}</_E.Button>
    )
  }

  renderShowTax() {
    return (
     <p>{Translate.translate('ShoppingCart', 'Tax')}: { currencyFilter(this.state.salesTaxAmount) }</p>
    )
  }
}

export default ShoppingCart
