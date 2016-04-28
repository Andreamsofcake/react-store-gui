import React, { Component } from 'react'
import * as _E from 'elemental'
//import TsvService from '../../lib/TsvService'
import { browserHistory } from 'react-router'

import { currencyFilter } from '../utils/TsvUtils'

class ProductListItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }

  viewProduct(){
    browserHistory.push("/ProductDetail/" + this.props.data.productID)
  }

  render() {
    var product = this.props.data;

    return (

          <div className="product-list-item">
              <div onClick={this.viewProduct.bind(this)} className="product-name">
				<h3>{product.productName}</h3>
              </div>
              <div onClick={this.viewProduct.bind(this)} className="image-container">
				  <img src={product.imagePath} title={product.description} className="boxShadowed" />
              </div>
              <div className="product-list-item-add-to-cart clearfix">
              	<div>
                  <_E.Button className="product-button" onClick={this.clickHandler.bind(this)}>Add</_E.Button>
                  <p className="prdPrice">${currencyFilter(product.price)} </p>
                </div>
              </div>
          </div>

    );

  }

}


export default ProductListItem
