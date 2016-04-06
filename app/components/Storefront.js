
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
    this.state = {}

    this._onRootstoreChange = this._onRootstoreChange.bind(this);
  }

  // Add change listeners to stores
  componentDidMount() {
    RootscopeStore.addChangeListener(this._onRootstoreChange);

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
  }

  _onRootstoreChange(event) {
  	// if (event && event.type == 'config' && event.path == 'categories') {
		// console.log('[_onRootstoreChange]');
		// console.log(event);
		// console.log(RootscopeStore.getConfig('categories'));
		this.setState({
			categories: RootscopeStore.getConfig('categories'),
      products: RootscopeStore.getSession('products')
		});
  	// }
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
                {this.renderProducts()}
              </_E.Card>
            </_E.Col>
          </_E.Row>
        </_E.Col>
      </_E.Row>
    );
  }

  renderProducts(){
    return (
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
    )
  }

}
export default Storefront
