
import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
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

class Storefront_Carousel extends Component {

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
    RootscopeStore.addChangeListener(this._onRootstoreChange);
    StorefrontStore.addChangeListener(this._onStoreFrontChange);

    TsvService.fetchProduct(null, (err, data) => {
      if (err) throw err;
      RootscopeActions.setSession('products', data)
    });

    TsvService.fetchProductCategoriesByParentCategoryID(0, (err, data) => {
    	if (err) throw err;
    	RootscopeActions.setConfig('categories', data);
    });

	TsvService.fetchShoppingCart2(null, (err, data) => {
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
    if (categoryID) {
      return StorefrontActions.toggleIDtoCategoryFilter(categoryID)
    }
    StorefrontActions.clearCategoryFilter()
  }

  setPrdSelected(product, e) {
    StorefrontActions.addToCart(product, e)
  }

  render() {
    var settings = {
    	dots: true
    }
    let allType = !this.state.categoryIdFilter.length ? "primary": "hollow-primary"
    return (
      <_E.Row >
        <_E.Col>
		        <ShoppingCartMini className="scart-mini" />
          <_E.Row>
              <h2>Storefront</h2>
          </_E.Row>
              <div className='container'>
                <Slider {...settings}>
                	{this.renderProducts()}
                </Slider>
             </div>
       </_E.Col>
      </_E.Row>
    );
  }

  renderProducts(){
    if (!this.state.products.length) {
      return null;
    }
    let prods = this.state.products.map( (P, idx) => {
    	let show = true;
    	if (this.state.categoryIdFilter.length) {
    		if (this.state.categoryIdFilter.indexOf(P.productCategoryID) === -1) {
    			show = false;
    		}
    	}
    	if (show) {
    		return (
			  <_E.Col key={idx} xs="1/2" sm="1/3" md="1/4" lg="1/4">
				<ProductListItem
				onClick={this.setPrdSelected.bind(this)}
				data={P} />
			  </_E.Col>
    		);
    	}
    	return null;
    })

    return (
      <_E.Row >
    	{prods}
      </_E.Row>
    );
  }

}
export default Storefront_Carousel
