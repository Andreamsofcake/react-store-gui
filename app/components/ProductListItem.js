import React, { Component } from 'react'
import * as _E from 'elemental'
//import TsvService from '../../lib/TsvService'
import { browserHistory } from 'react-router'

import StorefrontStore from '../stores/StorefrontStore'
import Log from '../utils/BigLogger'
var Big = new Log('ProductListItem');

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
				<h3>{product.name}</h3>
              </div>
              <div onClick={this.viewProduct.bind(this)} className="image-container">
				  {this.renderProductImage(product)}
              </div>
              <div className="product-list-item-add-to-cart clearfix">
              	<div>
              		{this.renderAddToCart()}
					<p className="prdPrice">${currencyFilter(product.price)} <em>({product.stockCount})</em></p>
                </div>
              </div>
          </div>

    );

  }
  
  renderProductImage(product) {
  	var images = StorefrontStore.getImagesForProduct(product);
  	if (images && images.length) {
		return (
			<img src={images[0].fileData} title={product.description} className="boxShadowed" />
		);
  	}
  	return (
  		<img src="/gfx/ProductImageNotFound.png" title={product.description} className="boxShadowed" />
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
