
import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import ProductListItem from './ProductListItem'
import ShoppingCartIcon from './ShoppingCartIcon'

class Storefront extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    RootscopeActions.setSession('currentView', 'Storefront');
    this.state = {
      categoryIdFilter:[],
      products: [],
      categories: [],
      shoppingCart: [],
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
    var qty = 0;
    for (let value of this.state.shoppingCart) {
        console.log('array')
        qty += value.qtyInCart;
        console.log(qty)
      }
		this.setState({
			categories: RootscopeStore.getConfig('categories') || [],
      products: RootscopeStore.getSession('products') || [],
      shoppingCart: RootscopeStore.getCache('shoppingCart.detail') || [],
      quantity: qty
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
    let allType = !this.state.categoryIdFilter.length ? "primary": "hollow-primary"
    return (
      <_E.Row >
        <_E.Col>
          <_E.Row>
            <_E.Col sm="1/2">
              <h2>Storefront</h2>
            </_E.Col>
            <ShoppingCartIcon
              data = {this.state.quantity}
            />
          </_E.Row>
          <_E.Row>
            <_E.Button type={allType} onClick={this.categoryClick.bind(this, null)}>All</_E.Button>
            {this.state.categories ? this.state.categories.map((category, $index) => {
                let type=this.state.categoryIdFilter.indexOf(category.categoryID) > -1 ? "primary": "hollow-primary"
                return (
                  <_E.Button key={$index} type={type} onClick={this.categoryClick.bind(this, category.categoryID)} >{category.categoryName}</_E.Button>
                )
              }
            ) : null}
          </_E.Row>
          <br />


                {this.renderProducts()}

        </_E.Col>
      </_E.Row>
    );
  }

  renderProducts(){
    if (!this.state.products.length) {
      return null
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

          <_E.Col key={idx} basis="25%">
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
export default Storefront
