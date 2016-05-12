import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import Slider from 'react-slick';
import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import ProductListItem from './ProductListItem'
import ShoppingCartMini from './ShoppingCartMini'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

class Storefront extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
      categoryIdFilter:[],
      products: [],
      categories: [],
      quantity: 0
    }

    this._onRootstoreChange = this._onRootstoreChange.bind(this);
    this._onStoreFrontChange = this._onStoreFrontChange.bind(this);

  }

  // Add change listeners to stores
  componentDidMount() {
  	//console.log(' >>>>>>>>>>>>>> STOREFRONT mounted... route: '+this.props.location.pathname + ' <<<<<<<<<<<<<<<<<');
  	startGeneralIdleTimer(this.props.location.pathname);

    RootscopeStore.addChangeListener(this._onRootstoreChange);
    StorefrontStore.addChangeListener(this._onStoreFrontChange);

    TsvActions.apiCall('fetchProduct', (err, data) => {
      if (err) throw err;
      RootscopeActions.setSession('products', data)
    });

    TsvActions.apiCall('fetchProductCategoriesByParentCategoryID', 0, (err, data) => {
    	if (err) throw err;
    	console.log('fetchProductCategoriesByParentCategoryID');
    	console.log(err);
    	console.log(data);
    	RootscopeActions.setConfig('categories', data);
    });

	TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
		if (err) throw err;
		RootscopeActions.setCache('shoppingCart', data);
	});
  }

  // Remove change listers from stores
  componentWillUnmount() {
    RootscopeStore.removeChangeListener(this._onRootstoreChange);
    StorefrontStore.removeChangeListener(this._onStoreFrontChange);
  }

  _onRootstoreChange(event) {
  	// if (event && event.type == 'config' && event.path == 'categories') {
		// console.log('[_onRootstoreChange]');
		// console.log(event);
		// console.log(RootscopeStore.getConfig('categories'));
		this.setState({
			categories: RootscopeStore.getConfig('categories') || [],
			products: RootscopeStore.getSession('products') || [],
		});

  	// }
  }

  _onStoreFrontChange() {
    this.setState({
      categoryIdFilter: StorefrontStore.getCategoryFilter()
    })
  }

  categoryClick(categoryID) {
  	startGeneralIdleTimer(this.props.location.pathname);
    if (categoryID) {
      return StorefrontActions.toggleIDtoCategoryFilter(categoryID)
    }
    StorefrontActions.clearCategoryFilter()
  }

  addToCart(product, e) {
  	startGeneralIdleTimer(this.props.location.pathname);
    StorefrontActions.addToCart(product, e)
  }

  render() {

    let allType = !this.state.categoryIdFilter.length ? "primary": "hollow-primary"
    return (
      <_E.Row >
        <_E.Col>
		        <ShoppingCartMini className="scart-mini" />
          <_E.Row>
              <h2>Storefront</h2>
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
      </_E.Row>
    );
  }

	renderCategories() {
		if (this.state.categories && this.state.categories.length) {
			return (
				<_E.ButtonGroup>
				{this.state.categories.map((category, $index) => {
					let type=this.state.categoryIdFilter.indexOf(category.categoryID) > -1 ? "primary": "hollow-primary"
					return (
					  <_E.Button style={{backgroundColor: '#fff'}} key={$index} type={type} onClick={this.categoryClick.bind(this, category.categoryID)} >{category.categoryName}</_E.Button>
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
        if (this.state.categoryIdFilter.indexOf(P.productCategoryID) > -1) {
          //show = false;
          prods.push(P)
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
