import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import StorefrontActions from '../actions/StorefrontActions'
import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory } from 'react-router'
import ShoppingCartMini from './ShoppingCartIcon'
import * as _E from 'elemental'

 class Product_Detail extends Component {

   constructor(props, context) {
     // MUST call super() before any this.*
     super(props, context);
     this.state = {
       product : {}
     }
     this._onStoreFrontChange = this._onStoreFrontChange.bind(this);
   };

   // Add change listeners to stores
   componentDidMount() {
     StorefrontStore.addChangeListener(this._onStoreFrontChange);
     this.setState({
       product: StorefrontStore.getProductById(this.props.params.productID)
     })
   }

   // Remove change listers from stores
   componentWillUnmount() {
     StorefrontStore.removeChangeListener(this._onStoreFrontChange);
   }

   setPrdSelected(product, e) {
     StorefrontActions.addToCart(product, e)
   }
   _onStoreFrontChange() {

   }

   render() {
     return (
       <_E.Row >
         <_E.Col>
          <ShoppingCartMini style={{float: 'right'}} />
           <h2>Product Details</h2>
         </_E.Col>
         <_E.Col>
           <div className="product" >
               <div className="product_name">
                 <h4>{this.state.product.productName}</h4>
                 <p>Discription: {this.state.product.description}</p>
               </div>
               <_E.Row>
                 <_E.Col basis="50%" id="product-preview">
                   <img src={this.state.product.imagePath} title={this.state.product.description}/>
                 </_E.Col>
                 <_E.Col basis="50%">
                   <p className="prdPrice">Price ${TsvService.currencyFilter(this.state.product.price)} </p>
                   <_E.Button id="product-button" onClick={this.setPrdSelected.bind(this)}>Add to cart</_E.Button>
                 </_E.Col>
               </_E.Row>
           </div>
         </_E.Col>
       </_E.Row>
     );
   }

 }

export default Product_Detail
