import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import StorefrontActions from '../actions/StorefrontActions'
import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory, Link } from 'react-router'
import ShoppingCartMini from './ShoppingCartMini'
import * as _E from 'elemental'

import { currencyFilter } from '../utils/TsvUtils'

class ProductDetail extends Component {

   constructor(props, context) {
     // MUST call super() before any this.*
     super(props, context);
     this.state = {
		loadedAtLeastOnce: false,
		modalIsOpen: false,
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
   
   toggleModal() {
	this.setState({
		modalIsOpen: !(this.state.modalIsOpen)
	});
   }

   render() {

   	if (!this.state.product) {

   		if (this.state.loadedAtLeastOnce) {
   			return (
			   <_E.Row >
				 <_E.Col>
				 <ShoppingCartMini className="scart-mini" />
				 <h2>Sorry, that product was not found.</h2>
				 <_E.Button size="lg" type="default-success" component={(<Link to="/Help">{Translate.translate('ShoppingCart','Get_Some_Help')}</Link>)} />
				 {' '}
				 <_E.Button size="lg" type="success" component={(<Link to="/Storefront">{Translate.translate('ShoppingCart','Shop_More')}</Link>)} />

				 </_E.Col>
			   </_E.Row>
   			);
   		}

   		return (
			   <_E.Row >
				 <_E.Col>
				 <ShoppingCartMini className="scart-mini" />
				 <h1>Searching, one moment please...</h1>
				 <_E.Spinner />
				 </_E.Col>
			   </_E.Row>
   		);

   	}
   	
     let prod = this.state.product;
     return (
       <_E.Row >
        <_E.Col>
		  <ShoppingCartMini className="scart-mini" />
          <_E.Row>
			 <_E.Col className="productDetailHeader">
			   <h2 style={{marginBottom:0,marginTop:'1em',fontSize:'2.7em'}}>{prod.productName}</h2>
            	<p>{prod.description}</p>
			 </_E.Col>
          </_E.Row>
         </_E.Col>
         <_E.Col>
           <div className="productDetailBody">
               <_E.Row>
                 <_E.Col basis="50%" className="product-preview">
                   <img src={prod.imagePath} title={prod.description} className="boxShadowed" onClick={this.toggleModal.bind(this)} />
                 </_E.Col>
                 <_E.Col basis="50%">
                   <p className="prdPrice">Price ${currencyFilter(prod.price)} </p>
                   <_E.Button className="product-button" onClick={this.setPrdSelected.bind(this)}>Add to cart</_E.Button>
                   <hr style={{margin: '20px auto', height: '2px'}} />
                   <_E.Button size="lg" type="success" component={(<Link to="/Storefront">{Translate.translate('ShoppingCart','Shop_More')}</Link>)} />
                 </_E.Col>
               </_E.Row>
           </div>
         </_E.Col>
         {prod.imagePath ? (
         	<_E.Modal isOpen={this.state.modalIsOpen} backdropClosesModal={true}>
         		<_E.ModalHeader text="Image Detail" showCloseButton={true} onClose={this.toggleModal.bind(this)} />
         		<_E.ModalBody>
	         		<img src={prod.imagePath} title={prod.description} className="productImageModalDetailView" />
         		</_E.ModalBody>
         	</_E.Modal>         	
         ) : null}
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
   renderBack() {
     return (
       <_E.Row>
        <_E.Col>
          <_E.Button size="lg" type="success" component={(<Link to="/Storefront">{Translate.translate('ShoppingCart','Shop_More')}</Link>)} />
        </_E.Col>
       </_E.Row>
     );
   }

 }

export default ProductDetail
