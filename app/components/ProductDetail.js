import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'
import StorefrontActions from '../actions/StorefrontActions'
import TsvSettingsStore from '../stores/TsvSettingsStore'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory, Link } from 'react-router'
import ShoppingCartMini from './ShoppingCartMini'
import * as _E from 'elemental'

import SessionActions from '../actions/SessionActions'

import Log from '../utils/BigLogger'
var Big = new Log('ProductDetail');

import {
	currencyFilter,
	GuiTimer,
} from '../utils/TsvUtils'

class ProductDetail extends Component {

   constructor(props, context) {
     // MUST call super() before any this.*
     super(props, context);
     this.state = {
		loadedAtLeastOnce: false,
		modaIsOpen: false,
		product : {}
     }
     this._onStoreFrontChange = this._onStoreFrontChange.bind(this);
   };

   // Add change listeners to stores
	componentDidMount() {
		StorefrontStore.addChangeListener(this._onStoreFrontChange);
		GuiTimer();
		let PRODUCT = StorefrontStore.decorateProducts( StorefrontStore.getProductById(this.props.params.productID) );
		if (PRODUCT) {
			SessionActions.addShopEvent({ event: 'VIEW_PRODUCT', product: this.props.params.productID });
		}
		this.setState({
			loadedAtLeastOnce: true,
			product: PRODUCT
		})
	}

   // Remove change listers from stores
   componentWillUnmount() {
     StorefrontStore.removeChangeListener(this._onStoreFrontChange);
   }

   addToCart(e) {
   		GuiTimer();
		if (this.state.product) {
			StorefrontActions.addToCart(this.state.product);
		}
   }

	 _onStoreFrontChange(event) {
		switch (event.type) {
	
			case appConstants.PRODUCT_ADDED_TO_CART:
			//case appConstants.PRODUCT_REMOVED_FROM_CART:
			//case appConstants.PRODUCT_QUANTITY_INCREASED:
			//case appConstants.PRODUCT_QUANTITY_DECREASED:
				let PID = event.product;
				if (typeof PID === 'object') {
					PID = PID._id
				}
				SessionActions.addShopEvent({ event: event.type, product: PID });
				break;

		}
	}
   
   toggleModal() {
   	GuiTimer();
	this.setState({
		modaIsOpen: !(this.state.modaIsOpen)
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
			   <h2 style={{marginBottom:0,marginTop:'1em',fontSize:'2.7em'}}>{prod.name}</h2>
            	<p>{prod.description}</p>
            	<p style={{fontSize:'1.25em'}}>Quantity in stock: {prod.stockCount}</p>
			 </_E.Col>
          </_E.Row>
         </_E.Col>
         <_E.Col>
           <div className="productDetailBody">
               <_E.Row>
                 <_E.Col basis="50%" className="product-preview">
                   {this.renderProductImage(prod)}
                 </_E.Col>
                 <_E.Col basis="50%">
                   <p className="prdPrice">Price ${currencyFilter(prod.price)} </p>
                   {this.renderAddToCart()}
                   <hr style={{margin: '20px auto', height: '2px'}} />
                   <_E.Button size="lg" type="success" component={(<Link to="/Storefront">{Translate.translate('ShoppingCart','Shop_More')}</Link>)} />
                 </_E.Col>
               </_E.Row>
           </div>
         </_E.Col>
         {prod.imagePath ? (
         	<_E.Modal isOpen={this.state.modaIsOpen} backdropClosesModal={true}>
         		<_E.ModalHeader text="Image Detail" showCloseButton={true} onClose={this.toggleModal.bind(this)} />
         		<_E.ModalBody>
	         		<img src={prod.imagePath} title={prod.description} className="productImageModalDetailView" />
         		</_E.ModalBody>
         	</_E.Modal>         	
         ) : null}
       </_E.Row>
     );
   }
   
   renderProductImage(product) {
  	var images = StorefrontStore.getImagesForProduct(product);
  	if (images && images.length) {
		return (
			<img src={images[0].fileData} title={product.description} className="boxShadowed" onClick={this.toggleModal.bind(this)} />
		);
  	}
  	Big.log('hmmm no images found?');
  	Big.log(images);
  	return (
  		<img src="/gfx/ProductImageNotFound.png" title={product.description} className="boxShadowed" onClick={this.toggleModal.bind(this)} />
  	);
   }

	renderAddToCart() {
		if (this.state.product.stockCount > 0) {
			return (
				<_E.Button className="product-button" onClick={this.addToCart.bind(this)}>Add to cart</_E.Button>
			);
		}
		return (
			<span style={{fontSize: '1.1em', textTransform: 'uppercase', textAlign: 'center', display: 'block', float: 'right'}}>out of stock</span>
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
