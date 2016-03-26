import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'

class ProductListItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }


  render() {
    var product = this.props.data
    var key = this.props.key
    return (
      <_E.Col basis="25%" key={key} >

          <div className="product" id={"prdImg" + key} onClick={this.clickHandler.bind(this)}>

              <h4>{product.productName}</h4>

              <img src={product.imagePath} alt={product.description} title={product.description} />

              <p className="prdPrice">${TsvService.currencyFilter(product.price)} </p>

          </div>

      </_E.Col>

    );

  }

}


export default ProductListItem
