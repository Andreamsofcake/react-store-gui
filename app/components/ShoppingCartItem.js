import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'

class ShoppingCartItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }
  


  render() {
    var prd = this.props.data
    return (
      <_E.Row className="cart" className="shoppingCart">
			<_E.Col md="15%" lg="15%" className="cart">

				<img id="prdImg" src={prd.imagePath} /> {/*err-src="../Images/ProductImageNotFound.png"*/}

			</_E.Col>

			<_E.Col md="25%" lg="25%" className="cart">{ prd.productName }</_E.Col>

			<_E.Col md="8%" lg="8%" className="cart">{ TsvService.currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

			<_E.Col md="37%" lg="37%" className="cart">


					<_E.Row>

						<_E.Col><_E.Button type="primary" onClick={this.props.minusQty.bind(null, prd.coilNumber)}><_E.Glyph icon="dash" /></_E.Button></_E.Col>
						{/*<img className="smallImg" src="../Images/minus.png" onClick={this.minusQty.bind(this, prd.coilNumber)}>*/}

						<_E.Col id="qty">{ prd.qtyInCart}</_E.Col>

						<_E.Col><_E.Button type="primary" onClick={this.props.addQty.bind(null, prd.coilNumber)}><_E.Glyph icon="plus" /></_E.Button></_E.Col>
						{/*<img className="smallImg" src="../Images/add.png" onClick={this.addQty.bind(this, prd.coilNumber)}>*/}

					</_E.Row>


			</_E.Col>

			<_E.Col md="15%" lg="15%" className="cart"><_E.Button type="danger" onClick={this.props.removeAllQty.bind(null, prd.coilNumber, prd.qtyInCart)}><_E.Glyph icon="circle-slash" /></_E.Button></_E.Col>
			{/*<img className="smallImg" src="../Images/remove.png" onClick={this.removeAllQty.bind(this, prd.coilNumber, prd.qtyInCart)}>*/}
		  </_E.Row>
    );
  }

}


export default ShoppingCartItem
