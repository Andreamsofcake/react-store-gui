import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'
import StorefrontActions from '../actions/StorefrontActions'

class ShoppingCartItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }

  minusQty(c) {
    StorefrontActions.minusQty(c)
  }

  removeAllQty(c, q) {
    StorefrontActions.removeAllQty(c, q)
  }

  addQty(c) {
    StorefrontActions.addQty(c)
  }


  render() {
    var prd = this.props.data
    return (
      <_E.Row className="cart shoppingCart shoppingCartItem">
			<_E.Col className="cart shopping-cart-image" sm="25%" md="15%" lg="15%">

				<_E.Button type="danger" onClick={this.removeAllQty.bind(null, prd.coilNumber, prd.qtyInCart)}><_E.Glyph icon="circle-slash" /></_E.Button>
				<img src={prd.imagePath} /> {/*err-src="../Images/ProductImageNotFound.png"*/}

			</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="25%" sm="25%" md="25%" lg="25%">{ prd.productName }</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="8%" sm="8%" md="8%" lg="8%">{ TsvService.currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

			<_E.Col xs="20%" sm="20%" md="20%" lg="20%" className="cart">


					<_E.Row>

						<_E.Col sm="1/3" className="shopping-cart-item"><_E.Button  type="primary" onClick={this.addQty.bind(null, prd.coilNumber)}><_E.Glyph icon="plus" /></_E.Button></_E.Col>
						{/*<img className="smallImg" src="../Images/minus.png" onClick={this.minusQty.bind(this, prd.coilNumber)}>*/}

						<_E.Col className="shopping-cart-item" sm="1/3">{ prd.qtyInCart}</_E.Col>

						<_E.Col sm="1/3" className="shopping-cart-item"><_E.Button className="shopping-cart-button" type="primary" onClick={this.minusQty.bind(null, prd.coilNumber)}><_E.Glyph icon="dash" /></_E.Button></_E.Col>
						{/*<img className="smallImg" src="../Images/add.png" onClick={this.addQty.bind(this, prd.coilNumber)}>*/}

					</_E.Row>


			</_E.Col>

			<_E.Col xs="20%" sm="20%" md="20%" lg="20%" className="cart"><_E.Button type="danger" onClick={this.removeAllQty.bind(null, prd.coilNumber, prd.qtyInCart)}><_E.Glyph icon="circle-slash" /></_E.Button></_E.Col>
			{/*<img className="smallImg" src="../Images/remove.png" onClick={this.removeAllQty.bind(this, prd.coilNumber, prd.qtyInCart)}>*/}
		  </_E.Row>
    );
  }

}


export default ShoppingCartItem
