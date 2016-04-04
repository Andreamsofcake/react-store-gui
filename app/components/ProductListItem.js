import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'

class ProductListItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }


  render() {
    var product = this.props.data
    return (
      <_E.Col basis="25%" >

          <div className="product">

              <h4>{product.productName}</h4>

              <img src={product.imagePath} title={product.description} onClick={this.clickHandler.bind(this)} />

              <p className="prdPrice">${TsvService.currencyFilter(product.price)} </p>

          </div>

      </_E.Col>

    );

  }

}


export default ProductListItem
