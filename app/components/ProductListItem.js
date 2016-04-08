import React, { Component } from 'react'
import * as _E from 'elemental'
import TsvService from '../../lib/TsvService'

class ProductListItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }

  veiwProduct(){

  }


  render() {
    var product = this.props.data
    return (

          <div className="product">
              <div className="product_name" >
                <h4>{product.productName}</h4>
              </div>
              <div id="image-container">

              <img src={product.imagePath} title={product.description}/>

              </div>
              <_E.Row>
                <_E.Col sm="1/3">
                  <p className="prdPrice">${TsvService.currencyFilter(product.price)} </p>
                </_E.Col>
                <_E.Col sm="1/3">
                  <_E.Button type="inactive" id="product-button" onClick={this.viewProduct}>View</_E.Button>
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
