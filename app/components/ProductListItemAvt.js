import React, { Component } from 'react'
import * as _E from 'elemental'
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
              		{this.renderAddToCart()}
                  <p className="prdPrice">${currencyFilter(product.price)} </p>
                </div>
              </div>
          </div>

    );

  }
  
  renderAddToCart() {
  	if (this.props.data.stockCount > 0) {
  		return (
  			<_E.Button className="product-button" size="lg" type="success" onClick={this.clickHandler.bind(this)}>+ Add</_E.Button>
  		);
  	}
  	return (
  		<span style={{fontSize: '0.75em', textTransform: 'uppercase', textAlign: 'center', display: 'block', float: 'right'}}>out<br />of stock</span>
  	);
  }

}


export default ProductListItem
