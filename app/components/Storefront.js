
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

class Storefront extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    RootscopeActions.setSession('currentView', 'Storefront');
    this.state = {
      _Index: 0,
      categories: RootscopeStore.getConfig('categories'),
      products: RootscopeStore.getSession('products')
    }

    if (!this.state.products) {
      TsvService.fetchProduct(null, (err, data) => {
        if (err) throw err;
        this.setState({
          products: data
        });
        console.log('products');
        console.log(this.state.products);
      });
    }

    TsvService.fetchProductCategoriesByParentCategoryID(0, (err, data) => {
    	if (err) throw err;
    	RootscopeActions.setConfig('categories', data);
    });
    this._onRootstoreChange = this._onRootstoreChange.bind(this);
  }

  fetchCategory(data) {
    var categoryID = data
  	TsvService.fetchProductCategoriesByParentCategoryID(categoryID, (err, data) => {
    	if (err) throw err;
    	RootscopeActions.setConfig('categories', data);
    	if (data.length === 0) {
    		TsvService.fetchProductByCategory(categoryID, (err, data) => {
		    	if (err) throw err;
		    	RootscopeActions.setConfig('products', data);
		    	browserHistory.push("/Product_Search");
		    });
    	}
    });

  }

  // Add change listeners to stores
  componentDidMount() {
    RootscopeStore.addChangeListener(this._onRootstoreChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
    RootscopeStore.removeChangeListener(this._onRootstoreChange);
  }

  _onRootstoreChange(event) {
  	if (event && event.type == 'config' && event.path == 'categories') {
		// console.log('[_onRootstoreChange]');
		// console.log(event);
		// console.log(RootscopeStore.getConfig('categories'));
		this.setState({
			categories: RootscopeStore.getConfig('categories')
		});
  	}
  }

  render() {
    return (
      <_E.Row >
        <_E.Col>
          <_E.Row>
            <_E.Col sm="1/2">
              <h2>Storefront</h2>
            </_E.Col>
            <_E.Col sm="1/2">

            </_E.Col>
          </_E.Row>
          <_E.Row>
            <_E.Button type="primary">All</_E.Button>
            {this.state.categories ? this.state.categories.map((category, $index) => {
                return (
                  <_E.Button key={$index} type="primary">{category.categoryName}</_E.Button>
                )
              }
            ) : null}
          </_E.Row>
          <br />
          <_E.Row>
            <_E.Col sm="2/3">
              <_E.Card>
              {this.state.products ? this.state.products.map((product, $index) => {
                            return (

                              <ProductListItem
                                 key={$index}
                                //  onClick={this.setPrdSelected.bind(this)}
                                 data={product}
                              />

                            )
                          }
                        ):null}
              </_E.Card>
            </_E.Col>
          </_E.Row>
        </_E.Col>
      </_E.Row>
    );
  }

}
export default Storefront
