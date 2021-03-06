import React, { Component } from 'react'
import * as _E from 'elemental'
import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'
import SessionActions from '../actions/SessionActions'
import appConstants from '../constants/appConstants'

import { browserHistory } from 'react-router'

import Log from '../utils/BigLogger'
var Big = new Log('ShoppingCartItem');

import {
	currencyFilter,
	GuiTimer,
} from '../utils/TsvUtils'

class ShoppingCartItem extends Component {
	
	constructor(props) {
		super(props);
		this._onStoreFrontChange = this._onStoreFrontChange.bind(this);
	}
	
	componentDidMount() {
		StorefrontStore.addChangeListener(this._onStoreFrontChange);
	}

	componentWillUnmount() {
		StorefrontStore.removeChangeListener(this._onStoreFrontChange);
	}
	
	minusQty() {
		GuiTimer();
		StorefrontActions.minusQty( this.props.data ) // , prd.coilNumber
	}

	removeAllQty() {
		GuiTimer();
		StorefrontActions.removeAllQty( this.props.data ) // , prd.coilNumber, prd.qtyInCart
	}

	addQty() {
		GuiTimer();
		StorefrontActions.addQty( this.props.data ) // prd.coilNumber
	}

	productDetail() {
		browserHistory.push('/ProductDetail/' + this.props.data.productID);
	}

	 _onStoreFrontChange(event) {
		switch (event.type) {
	
			//case appConstants.PRODUCT_ADDED_TO_CART:
			case appConstants.PRODUCT_REMOVED_FROM_CART:
			case appConstants.PRODUCT_QUANTITY_INCREASED:
			case appConstants.PRODUCT_QUANTITY_DECREASED:
				let PID = event.product;
				if (typeof PID === 'object') {
					PID = PID._id
				}
				SessionActions.addShopEvent({ event: event.type, product: PID });
				break;

		}
	}

	render() {
		var prd = StorefrontStore.decorateProducts(this.props.data);
		return (
			<_E.Row className="shoppingCartItem">

				<_E.Col sm="7%" md="6%" lg="5%">
					<_E.Button type="danger" onClick={this.removeAllQty.bind(this)}><strong>X</strong></_E.Button>
				</_E.Col>

				<_E.Col className="shopping-cart-list-image" sm="18%" md="19%" lg="20%" onClick={this.productDetail.bind(this)} style={{textAlign: 'center'}}>

					{this.renderProductImage(prd)}

				</_E.Col>

				<_E.Col className="cart shopping-cart-table" xs="42%" sm="37%" md="39%" lg="42%" onClick={this.productDetail.bind(this)}>{ prd.name }</_E.Col>

				<_E.Col className="cart shopping-cart-table" xs="8%" sm="13%" md="13%" lg="13%" style={{textAlign: 'right'}}>${ currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

				<_E.Col xs="20%" sm="25%" md="23%" lg="20%" className="productQuantity" style={{textAlign: 'right'}}>

					<_E.Button type="primary" size="sm" onClick={this.minusQty.bind(this)}><_E.Glyph icon="dash" /></_E.Button>
					&nbsp;{' '}{ prd.qtyInCart }{' '}&nbsp;
					{/*<_E.Button  type="primary" size="sm" onClick={this.addQty.bind(this)}><_E.Glyph icon="plus" /></_E.Button>*/}

				</_E.Col>

			</_E.Row>
		);
	}

	renderProductImage(product) {
		var images = StorefrontStore.getImagesForProduct(product);
		if (images && images.length) {
			return (
				<img src={images[0].fileData} className="boxShadowed" />
			);
		}
		return (
			<img src="/gfx/ProductImageNotFound.png" className="boxShadowed" />
		);
	}
}


export default ShoppingCartItem
