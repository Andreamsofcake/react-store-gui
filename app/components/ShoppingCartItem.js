import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'
import StorefrontActions from '../actions/StorefrontActions'

class ShoppingCartItem extends Component {

  minusQty() { // c
    StorefrontActions.minusQty( this.props.data ) // , prd.coilNumber
  }

  removeAllQty() { // c, q
    StorefrontActions.removeAllQty( this.props.data ) // , prd.coilNumber, prd.qtyInCart
  }

  addQty() { // c
    StorefrontActions.addQty( this.props.data ) // prd.coilNumber
  }
  
  productDetail() {
  	browserHistory.push('/Product_Detail/' + this.props.data.productID);
  }

  render() {
    var prd = this.props.data;
    return (
      <_E.Row className="shoppingCartItem">

			<_E.Col sm="7%" md="6%" lg="5%">
				<_E.Button type="danger" onClick={this.removeAllQty.bind(this)}><strong>X</strong></_E.Button>
			</_E.Col>

			<_E.Col className="shopping-cart-list-image" sm="18%" md="19%" lg="20%" onClick={this.productDetail.bind(this)} style={{textAlign: 'center'}}>

				<img className="boxShadowed" src={prd.imagePath} /> {/*err-src="../Images/ProductImageNotFound.png"*/}

			</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="42%" sm="37%" md="39%" lg="42%" onClick={this.productDetail.bind(this)}>{ prd.productName }</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="8%" sm="13%" md="13%" lg="13%" style={{textAlign: 'right'}}>${ TsvService.currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

			<_E.Col xs="20%" sm="25%" md="23%" lg="20%" className="productQuantity" style={{textAlign: 'right'}}>

				<_E.Button type="primary" size="sm" onClick={this.minusQty.bind(this)}><_E.Glyph icon="dash" /></_E.Button>
				&nbsp;{' '}{ prd.qtyInCart }{' '}&nbsp;
				<_E.Button  type="primary" size="sm" onClick={this.addQty.bind(this)}><_E.Glyph icon="plus" /></_E.Button>

			</_E.Col>

		</_E.Row>
    );
  }

}


export default ShoppingCartItem
