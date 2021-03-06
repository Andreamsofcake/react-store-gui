
import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import ProductListItem from './ProductListItem'
import ShoppingCartMini from './ShoppingCartMini'

import TsvActions from '../actions/TsvActions'

import Log from '../utils/BigLogger'
var Big = new Log('Storefront_Static');

class Storefront_Static extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //TsvSettingsStore.setSession('currentView', 'Storefront');
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
    TsvSettingsStore.addChangeListener(this._onRootstoreChange);
    StorefrontStore.addChangeListener(this._onStoreFrontChange);

    TsvActions.apiCall('fetchProduct', (err, data) => {
      if (err) Big.throw(err);
      TsvSettingsStore.setSession('products', data)
    });

    TsvActions.apiCall('fetchProductCategoriesByParentCategoryID', 0, (err, data) => {
    	if (err) Big.throw(err);
    	TsvSettingsStore.setConfig('categories', data);
    });

	TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
		if (err) Big.throw(err);
		TsvSettingsStore.setCache('shoppingCart', data);
	});
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
    StorefrontStore.removeChangeListener(this._onStoreFrontChange);
  }

  _onRootstoreChange(event) {
  	// if (event && event.type == 'config' && event.path == 'categories') {
		// Big.log('[_onRootstoreChange]');
		// Big.log(event);
		// Big.log(TsvSettingsStore.getConfig('categories'));
		this.setState({
			categories: TsvSettingsStore.getConfig('categories') || [],
			products: TsvSettingsStore.getSession('products') || [],
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
		  <ShoppingCartMini className="scart-mini" />
          <_E.Row>
              <h2>Storefront</h2>
          </_E.Row>
          <_E.Row>
            <_E.Col>
            Categories:{' '}
            <_E.Button type={allType} onClick={this.categoryClick.bind(this, null)}>All</_E.Button>
            <span style={{width:'1em', display: 'inline-block'}}>{' '}</span>
            <_E.ButtonGroup>
            {this.state.categories ? this.state.categories.map((category, $index) => {
                let type=this.state.categoryIdFilter.indexOf(category.categoryID) > -1 ? "primary": "hollow-primary"
                return (
                  <_E.Button key={$index} type={type} onClick={this.categoryClick.bind(this, category.categoryID)} >{category.categoryName}</_E.Button>
                )
              }
            ) : null}
            </_E.ButtonGroup>
            </_E.Col>
          </_E.Row>
	      {this.renderProducts()}
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
export default Storefront_Static
