import React, { Component } from 'react'
import * as _E from 'elemental'
//import TsvService from '../../lib/TsvService'

import { currencyFilter } from '../utils/TsvUtils'

class VendCartItem extends Component {

  render() {
    var prd = this.props.data
    return (
      <_E.Row className="shoppingCartItem">

			<_E.Col className="shopping-cart-list-image" sm="20%" md="20%" lg="20%" style={{textAlign: 'center'}}>

				<img className="boxShadowed" src={prd.imagePath} /> {/*err-src="../Images/ProductImageNotFound.png"*/}

			</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="42%" sm="37%" md="50%" lg="50%">{ prd.productName }</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="8%" sm="13%" md="10%" lg="10%" style={{textAlign: 'right'}}>${ currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

			<_E.Col xs="20%" sm="20%" md="20%" lg="20%" className="productQuantity" style={{textAlign: 'right'}}>

				&nbsp;{' '}{ prd.qtyInCart }{' '}&nbsp;

			</_E.Col>

		</_E.Row>
    );
  }

}


export default VendCartItem
