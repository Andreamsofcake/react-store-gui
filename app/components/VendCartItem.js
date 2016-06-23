import React, { Component } from 'react'
import * as _E from 'elemental'
//import TsvService from '../../lib/TsvService'
import StorefrontStore from '../stores/StorefrontStore'

import { currencyFilter } from '../utils/TsvUtils'

class VendCartItem extends Component {

  render() {
	var prd = StorefrontStore.decorateProducts(this.props.data);
    return (
      <_E.Row className="shoppingCartItem">

			<_E.Col className="shopping-cart-list-image" sm="20%" md="20%" lg="20%" style={{textAlign: 'center'}}>

				{this.renderProductImage(prd)}

			</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="42%" sm="37%" md="50%" lg="50%">{ prd.name }</_E.Col>

			<_E.Col className="cart shopping-cart-table" xs="8%" sm="13%" md="10%" lg="10%" style={{textAlign: 'right'}}>${ currencyFilter(prd.price * prd.qtyInCart) }</_E.Col>

			<_E.Col xs="20%" sm="20%" md="20%" lg="20%" className="productQuantity" style={{textAlign: 'right'}}>

				&nbsp;{' '}{ prd.qtyInCart }{' '}&nbsp;

			</_E.Col>

		</_E.Row>
    );
  }

  renderProductImage(product) {
  	var images = StorefrontStore.getImagesForProduct(product);
  	if (images && images.length) {
		return (
			<img src={images[0].fileData} title={product.description} className="boxShadowed" />
		);
  	}
  	Big.log('hmmm no images found?');
  	Big.log(images);
  	return (
  		<img src="/gfx/ProductImageNotFound.png" title={product.description} className="boxShadowed" />
  	);
  }

}


export default VendCartItem
