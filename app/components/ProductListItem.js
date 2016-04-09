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
    var product = this.props.data
    return (

          <div className="product" >
              <div className="product_name">
                <h4>{product.productName}</h4>
              </div>
              <div onClick={this.viewProduct.bind(this)} id="image-container">

	              <img src={product.imagePath} title={product.description}/>

              </div>
              <_E.Row>
                <_E.Col sm="1/3">
                  <p className="prdPrice">${TsvService.currencyFilter(product.price)} </p>
                </_E.Col>
                <_E.Col sm="1/3">
                </_E.Col>
                <_E.Col sm="1/3">
                  <_E.Button id="product-button" onClick={this.clickHandler.bind(this)}>Add</_E.Button>
                </_E.Col>
              </_E.Row>
          </div>

    );

  }

}


export default ProductListItem
