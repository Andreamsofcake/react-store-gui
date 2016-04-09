import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import StorefrontActions from '../actions/StorefrontActions'
import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory, Link } from 'react-router'
import ShoppingCartMini from './ShoppingCartMini'
import * as _E from 'elemental'

 class Product_Detail extends Component {

   constructor(props, context) {
     // MUST call super() before any this.*
     super(props, context);
     this.state = {
		loadedAtLeastOnce: false,
       product : {}
     }
     this._onStoreFrontChange = this._onStoreFrontChange.bind(this);
   };

   // Add change listeners to stores
   componentDidMount() {
     StorefrontStore.addChangeListener(this._onStoreFrontChange);
     this.setState({
     	loadedAtLeastOnce: true,
       product: StorefrontStore.getProductById(this.props.params.productID)
     })
   }

   // Remove change listers from stores
   componentWillUnmount() {
     StorefrontStore.removeChangeListener(this._onStoreFrontChange);
   }

   setPrdSelected(e) {
		if (this.state.product) {
			StorefrontActions.addToCart(this.state.product);
		}
   }
   _onStoreFrontChange() {

   }

   render() {
   	
   	if (!this.state.product) {
   		
   		if (this.state.loadedAtLeastOnce) {
   			return (
			   <_E.Row >
				 <_E.Col>
				 {this.renderMiniCart()}
				 <h2>Sorry, that product was not found.</h2>
				 <_E.Button size="lg" type="default-success" component={(<Link to="/Help">{Translate.translate('Shopping_Cart','Get_Some_Help')}</Link>)} />
				 {' '}
				 <_E.Button size="lg" type="success" component={(<Link to="/Storefront">{Translate.translate('Shopping_Cart','Shop_More')}</Link>)} />

				 </_E.Col>
			   </_E.Row>
   			);
   		}
   		
   		return (
			   <_E.Row >
				 <_E.Col>
				 {this.renderMiniCart()}
				 <h1>Searching, one moment please...</h1>
				 <_E.Spinner />
				 </_E.Col>
			   </_E.Row>
   		);
   		
   	}
   	
     return (
       <_E.Row >
         <_E.Col>
         {this.renderMiniCart()}
           <h2 style={{marginBottom:0,marginTop:'1em',fontSize:'2.7em'}}>{this.state.product.productName}</h2>
         </_E.Col>
         <_E.Col>
           <div className="product" >
               <div className="product_name" style={{maxWidth:'50%'}}>
                 {/*<h2 style={{marginTop:0}}>{this.state.product.productName}</h2>*/}
                 <p>{this.state.product.description}</p>
               </div>
               <_E.Row>
                 <_E.Col basis="50%" className="product-preview">
                   <img src={this.state.product.imagePath} title={this.state.product.description}/>
                 </_E.Col>
                 <_E.Col basis="50%">
                   <p className="prdPrice">Price ${TsvService.currencyFilter(this.state.product.price)} </p>
                   <_E.Button className="product-button" onClick={this.setPrdSelected.bind(this)}>Add to cart</_E.Button>
                 </_E.Col>
               </_E.Row>
           </div>
         </_E.Col>
       </_E.Row>
     );
   }
   
   renderMiniCart() {
	   /**** TODO: FIXME: this needs to be a css class, not embedded: ************/
	   /**** ALSO: FIXME: ShoppingCartMini has the same problem: ************/
   	return (
          <ShoppingCartMini className="scart-mini" />
		);
   }

 }

export default Product_Detail
