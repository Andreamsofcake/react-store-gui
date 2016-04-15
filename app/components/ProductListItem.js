import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'
import { browserHistory } from 'react-router'

class ProductListItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }

  viewProduct(){
    browserHistory.push("/Product_Detail/" + this.props.data.productID)
  }

  render() {
    var product = this.props.data;

    return (

          <div className="product-list-item">
              <_E.Row onClick={this.viewProduct.bind(this)}>
              	<_E.Col className="product_name">
					<h3>{product.productName}</h3>
              	</_E.Col>
              </_E.Row>
              <_E.Row onClick={this.viewProduct.bind(this)}>
              	<_E.Col className="image-container">
					  <img src={product.imagePath} title={product.description} className="boxShadowed" />
              	</_E.Col>
              </_E.Row>
              <_E.Row className="product-list-item-add-to-cart">
                <_E.Col sm="1/2">
                  <p className="prdPrice">${TsvService.currencyFilter(product.price)} </p>
                </_E.Col>
                <_E.Col sm="1/2">
                  <_E.Button className="product-button" onClick={this.clickHandler.bind(this)}>Add</_E.Button>
                </_E.Col>
              </_E.Row>
          </div>

    );

  }

}


export default ProductListItem
