import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'
import Slider from 'react-slick';

import TsvSettingsStore from '../stores/TsvSettingsStore'
import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'

import SessionActions from '../actions/SessionActions'
import SessionStore from '../stores/SessionStore'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import ProductListItem from './ProductListItem'
import ShoppingCartMini from './ShoppingCartMini'

import appConstants from '../constants/appConstants'

import ModalCartMessageSingleProduct from './ModalCartMessageSingleProduct'

import CustomerStore from '../stores/CustomerStore'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	GuiTimer,
	KillGuiTimer
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('Storefront');
/*
// example of how to capture client logging to the server
Big.setOptions({
	api: [{ type: 'axios', config: {
		url: '/api/big-log',
		method: 'post',
		then: [(response) => {
			console.log('[BigLog] posted log request to API');
		}],
		catch: (error) => {
			console.error('[BigLog] error, did not log request post to api!');
			console.error(error);
		}
	
	}} ]
});
*/

class Storefront extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
      categoryIdFilter:[],
      products: [],
      categories: [],
      customer: CustomerStore.getCustomer()
    }

    this._onRootstoreChange = this._onRootstoreChange.bind(this);
    this._onStoreFrontChange = this._onStoreFrontChange.bind(this);
	this._onCLStoreChange = this._onCLStoreChange.bind(this);
    
    if (window) {
    	window.SFS = StorefrontStore;
    }

  }

  // Add change listeners to stores
	componentDidMount() {
		Big.log(' >>>>>>>>>>>>>> STOREFRONT mounted... route: '+this.props.location.pathname + ' <<<<<<<<<<<<<<<<<');
		GuiTimer();
  	
		TsvSettingsStore.addChangeListener(this._onRootstoreChange);
		StorefrontStore.addChangeListener(this._onStoreFrontChange);
		CustomerStore.addChangeListener(this._onCLStoreChange);

		TsvActions.apiCall('fetchProduct', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setSession('products', data)
		});

		if (SessionStore.getCurrentSession()) {
			SessionActions.addShopEvent({ event: 'LOAD_STOREFRONT' });
		}
		
		this.setState({
			machineInfo: TsvStore.getMachineInfo(),
			planogram: StorefrontStore.getStorefrontData('planogram') || {}
		});
	}

	// Remove change listers from stores
	componentWillUnmount() {
		TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
		StorefrontStore.removeChangeListener(this._onStoreFrontChange);
		CustomerStore.removeChangeListener(this._onCLStoreChange);
	}

	_onCLStoreChange(event) {
		this.setState({
			customer: CustomerStore.getCustomer()
			//customerCredit: CustomerStore.getCustomerCredit()
		});
	}
	
  _onRootstoreChange(event) {
  	// if (event && event.type == 'config' && event.path == 'categories') {
		// Big.log('[_onRootstoreChange]');
		// Big.log(event);
		// Big.log(TsvSettingsStore.getConfig('categories'));
		
		var products = TsvSettingsStore.getSession('products')
			, categories = StorefrontStore.getStorefrontData('categories')
			;
		
		this.setState({
			categories: categories || [],
			products: StorefrontStore.decorateProducts(products) || [],
		});

  	// }
  }

	_onStoreFrontChange(event) {
		switch (event.type) {
	
			case appConstants.PRODUCT_ADDED_TO_CART:
			//case appConstants.PRODUCT_REMOVED_FROM_CART:
			//case appConstants.PRODUCT_QUANTITY_INCREASED:
			//case appConstants.PRODUCT_QUANTITY_DECREASED:
				Big.warn('added to cart. event, then PID twice, then make event');
				Big.log(event);
				let PID = StorefrontStore.decorateProducts( event.product );
				Big.log(PID);
				if (PID && typeof PID === 'object') {
					PID = PID._id
				}
				Big.log(PID);
				Big.log({ event: event.type, product: PID });
				Big.log('---------------');
				SessionActions.addShopEvent({ event: event.type, product: PID });
				break;

			default: // TOGGLE_CATEGORY_ID_TO_FILTER, CLEAR_CATEGORY_FILTER
				this.setState({
					categoryIdFilter: StorefrontStore.getCategoryFilter(),
					categories: StorefrontStore.getStorefrontData('categories') || [],
					planogram: StorefrontStore.getStorefrontData('planogram') || {},
				})
				SessionActions.addShopEvent({ event: event.type, category: event.category });
				break;
		}
	}
	
	getStorefrontName() {
		return this.state.planogram && this.state.planogram.storefrontName || 'Storefront';
	}
  
  categoryClick(categoryID) {
  	GuiTimer();
    if (categoryID) {
      return StorefrontActions.toggleIDtoCategoryFilter(categoryID)
    }
    StorefrontActions.clearCategoryFilter()
  }

  addToCart(product, e) {
  	GuiTimer();
	StorefrontActions.addToCart(product, e)
  }
  
  renderPleaseLogin() {
  	return (
    	<div>
		  <_E.Row >
			<_E.Col style={{textAlign: 'center'}}>
			  <h1 className="mainHeaderText page-centered">You must login before you can shop</h1>
			  <p style={{fontSize: '1.3em', textAlign: 'center'}}><_E.Button size="lg" type="success" onClick={() => {browserHistory.push('/CustomerMembershipAccess')}}>Customer Login</_E.Button></p>
			</_E.Col>
		  </_E.Row>
    	</div>
  	);
  }

  render() {

	if (!this.state.customer) {
		return this.renderPleaseLogin();
	}
    
    let allType = !this.state.categoryIdFilter.length ? "primary": "hollow-primary"
    return (
      <_E.Row >
        <_E.Col>
		        <ShoppingCartMini className="scart-mini" />
          <_E.Row>
              <h2 className="mainHeaderText">{this.getStorefrontName()}</h2>
          </_E.Row>
          <_E.Row>
            <_E.Col>
            <span style={{fontWeight:'bold', textTransform: 'uppercase', fontSize: '1.2em'}}>Show:</span>{' '}
            <_E.Button style={{backgroundColor: '#fff'}} type={allType} onClick={this.categoryClick.bind(this, null)}>All</_E.Button>
            <span style={{width:'1em', display: 'inline-block'}}>{' '}</span>
            {this.renderCategories()}
            </_E.Col>
          </_E.Row>
              <div className="product-container">
                	{this.renderProducts()}
              </div>
       </_E.Col>
       
       <ModalCartMessageSingleProduct />

      </_E.Row>
    );
  }

	renderCategories() {
		if (this.state.categories && this.state.categories.length) {
			return (
				<_E.ButtonGroup>
				{this.state.categories.map((category, $index) => {
					let type=this.state.categoryIdFilter.indexOf(category._id) > -1 ? "primary": "hollow-primary"
					return (
					  <_E.Button style={{backgroundColor: '#fff'}} key={$index} type={type} onClick={this.categoryClick.bind(this, category._id)} >{category.label}</_E.Button>
					)
				  }
				)}
				</_E.ButtonGroup>
			);
		}
		return null;
	}

  renderProducts(){

    var settings = {
    	dots: true,
    	adaptiveHeight: false,
    	arrows: true,
    	//fade: true,
    	infinite: false,
    	swipeToSlide: true,
    }

    var products_per_page = 12;
    // for each item that is shown
    if (!this.state.products.length) {
      return null;
    }

    var prods = [];

    this.state.products.map( (P, $index) => {
      //let show = true;
      if (this.state.categoryIdFilter.length) {
      	if (P.categories) {
      		// handle new structure!
      		var contains = P.categories.some( v => { return this.state.categoryIdFilter.indexOf(v) >= 0; } )
      		if (contains) prods.push(P);
		}
      } else {
      	prods.push(P)
      }
    })

    // testing, skip the <Slider />:
    //prods = prods.slice(0,products_per_page);
    
    if (!prods || !prods.length) {
    	if (this.state.categoryIdFilter.length) {
    		return (
    			<div>
    			<h2 style={{margin: '40px auto'}}>No products found, looks like you chose an empty category.</h2>
    			<p><em><strong>HINT:</strong> Press the <strong style={{color:'#0A6BE2'}}>"All"</strong> button in the top left corner</em></p>
    			</div>
    		);
    	}
    	return (
    		<h2 style={{margin: '40px auto'}}>No products found in this machine at this time, please try again later.</h2>
    	);
    }

    if (prods <= products_per_page) {
      return (
        <div className="storefront-product-carousel-group">
      	 {prods}
        </div>
      )
    } else {
      var stack = []
      	, renderKey = 0
      	;
      while(prods.length) {
        let prodslice = prods.splice(0, products_per_page)
        stack.push((
        	<div key={renderKey} className="storefront-product-carousel-group">
              {this.renderProductGroup(prodslice)}
            </div>
        ));
        renderKey += 1;
      }
      return (
        <Slider {...settings}>
          {stack}
        </Slider>
      )
    }
  }

  renderProductGroup(products){
    return products.map((prd, idx) => {
      return (
        <ProductListItem
        	key={idx}
			onClick={this.addToCart.bind(this)}
			data={prd}
		/>
      );
    })
  }

}
export default Storefront
