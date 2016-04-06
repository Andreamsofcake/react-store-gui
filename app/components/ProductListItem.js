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

          <div className="product">

              <h4>{product.productName}</h4>

              <img src={product.imagePath} title={product.description}/>

              <p className="prdPrice">${TsvService.currencyFilter(product.price)} </p>

              <_E.Button onClick={this.clickHandler.bind(this)}>Add</_E.Button>

          </div>

    );

  }

}


export default ProductListItem
