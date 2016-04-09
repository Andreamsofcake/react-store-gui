import React, { Component } from 'react'
import * as _E from 'elemental'
import { browserHistory } from 'react-router'

import RootscopeStore from '../stores/RootscopeStore'

class ShoppingCartMini extends Component {
	
	constructor(props, context) {
		super(props, context);
		this.state = {
			qty: 0
		}
		
		this._onRootstoreChange = this._onRootstoreChange.bind(this);
	}
	
	// Add change listeners to stores
	componentDidMount() {
		RootscopeStore.addChangeListener(this._onRootstoreChange);
		// artificial delay due to TSV race conditions
		setTimeout(() => {
			this.getCartData();
		}, 1000);
	}

	// Remove change listers from stores
	componentWillUnmount() {
		RootscopeStore.removeChangeListener(this._onRootstoreChange);
	}

	_onRootstoreChange(event) {
		this.getCartData();
	}
	
	getCartData() {
		var qty = 0
			, cart = RootscopeStore.getCache('shoppingCart.detail')
			;

		if (cart) {
			for (let value of cart) {
				console.log('array')
				qty += value.qtyInCart;
				console.log(qty)
			}
		}

		this.setState({
			qty: qty
		});
	}

	render() {
		return (
			<div className="shopping-cart" style={this.props.style || {}}>
				<a><img onClick={() => {browserHistory.push("/Shopping_Cart")}} src="/gfx/shop.png" /></a>
				<p>Quantity {this.state.qty}</p>
			</div>
		);
	}

}


export default ShoppingCartMini
