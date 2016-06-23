import React, { Component } from 'react'
import * as _E from 'elemental'
import { browserHistory } from 'react-router'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'

class ShoppingCartMini extends Component {
	
	constructor(props, context) {
		super(props, context);
		this.state = {
			qty: this.getCartData(true)
		}
		
		this._onRootstoreChange = this._onRootstoreChange.bind(this);
	}
	
	// Add change listeners to stores
	componentDidMount() {
		TsvSettingsStore.addChangeListener(this._onRootstoreChange);
		// artificial delay due to TSV race conditions
		// let's see if new TsvSettingsStore fixes it?
		//setTimeout(() => {
			this.getCartData();
		//}, 1000);
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
	}

	_onRootstoreChange(event) {
		this.getCartData();
	}
	
	getCartData(returnData) {
		
		returnData = returnData || false;

		var qty = 0
			, cart = TsvSettingsStore.getCache('shoppingCart.detail')
			;

		if (cart) {
			for (let value of cart) {
				qty += value.qtyInCart;
			}
		}
		
		if (returnData) { return qty; }

		this.setState({
			qty: qty
		});
	}

	render() {
		var ITEMS = this.state.qty + ' item';
		if (this.state.qty == 0 || this.state.qty > 1) {
			ITEMS += 's';
		}
		return (
			<div className={this.props.className || ''}>
				<p>
					<a><img onClick={() => {browserHistory.push("/ShoppingCart")}} src="/gfx/shop.png" /></a>
					{' '}
					{ITEMS}
					{this.renderCheckoutButton()}
				</p>
			</div>
		);
	}
	
	renderCheckoutButton() {
		if (this.state.qty > 0) {
			var payLocation = '/CustomerCreditVending'; // '/ChooseCashCard'
			return (
				<_E.Button type="success" size="lg" style={{marginLeft:'0.5em'}} onClick={() => { browserHistory.push(payLocation) }}>{Translate.translate('ShoppingCart','Checkout')}</_E.Button>
			);
		}
		return null;
	}
	
}


export default ShoppingCartMini
