import React, { Component } from 'react'
import * as _E from 'elemental'
import { browserHistory } from 'react-router'

class ProductListItem extends Component {

  shoppingCartLink() {
    browserHistory.push("/Shopping_Cart");
  }


  render() {
    var qty = this.props.data
    return (
      <_E.Col className="shopping-cart" sm="1/2">
        <a><img onClick={this.shoppingCartLink} src="/gfx/shop.png" /></a>
        <p>Quantity {qty}</p>
      </_E.Col>

    );

  }

}


export default ProductListItem
