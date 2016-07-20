import React, { Component } from 'react'
//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import * as Translate from '../../lib/Translate'
import ProductListItem from './ProductListItem'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import { Link } from 'react-router'

import TsvActions from '../actions/TsvActions'

import Log from '../utils/BigLogger'
var Big = new Log('ProductSearch');

class ProductSearch extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    this.state = {
      bShowBackBtn: TsvSettingsStore.getCache('custommachinesettings.bCategoryView'),
      products: [],
      _Index: 0
    }

    TsvSettingsStore.setConfig('bDisplayCgry', false);
    updateCredit();
    TsvSettingsStore.setConfig('credit', TsvSettingsStore.getSession('creditBalance'))
    //TsvSettingsStore.setSession('currentView', 'ProductSearch');
    //TsvSettingsStore.setCache('currentLocation', '/ProductSearch');

    //if (typeof window !== 'undefined') {
    	//window.RootscopeStore = RootscopeStore;
    //}

  }

  componentDidMount() {
	TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
		if (err) Big.throw(err);
		TsvSettingsStore.setCache('shoppingCart', data);
	});

    let state = {
    	products: TsvSettingsStore.getConfig('products'),
    	bShowBackBtn: TsvSettingsStore.getCache('custommachinesettings.bCategoryView')
    }

    this.setState(state);

    if (!state.products) {
		Big.warn('have to go fetch all products! (fix in refactor, but ProductSearch is not long-term used anyway ... just old code for testing');
		//Big.log(TsvSettingsStore.getConfig('products'));
		TsvActions.apiCall('fetchProduct', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setConfig('products', data);
			this.setState({
				products: data
			});
		});
    }

  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  setOpacity(count) {
    return count == 0 ? 0.4 : 1
  }

  isActive(index) {
    return this.state._Index === index;
  }

  showPrev() {
    this.state._Index = (this.state._Index > 0) ? --this.state._Index : this.state.products.length - 1;
  }

  showNext() {

  }

  setPrdSelected(product, e) {
    if(product.stockCount > 0){
    	TsvActions.apiCall('addToCartByProductID', product.productID, (err, response) => {
    		if (err) Big.throw(err);
	      TsvSettingsStore.setConfig('pvr', response);

	      TsvActions.apiCall('fetchShoppingCart2', (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setCache('shoppingCart', data);
	      });

	      // this will throw it to the simple checkout page, don't want to do that we want to shop!
	      // browserHistory.push("/View2");
      	});
    }
  }

  logoClicked() {
    TsvSettingsStore.gotoDefaultIdlePage();
  }

  updateCategory(categoryID) {
  	TsvActions.apiCall('fetchProductByCategory', categoryID, (err, data) => {
		if (err) Big.throw(err);
		TsvSettingsStore.setConfig('products', data);
		this.setState({
			products: data
		});
  	});
  }

  back() {
      browserHistory.push("/CategorySearch");
  }

  render() {
    var products = this.state.products;
    if (!products || !products.length) {
    	return (
		  <_E.Row className="ProductSearch" >

			<_E.Col>

			<h2>{Translate.translate('ProductSearch','OneMomentPlease')}</h2>

			</_E.Col>
    		</_E.Row>
    	);
    }

    return (

      <_E.Row className="ProductSearch" >

        <_E.Col>
        	<_E.Button style={{float:'right'}} type="primary" component={(<Link to="/ShoppingCart">TEST: go to shopping cart page</Link>)} />
          { this.state.bDisplayCgry ? this.renderCategoryTable() : null }
	        <h2>{Translate.translate('ProductSearch','SelectProduct')}</h2>
        </_E.Col>

        {/* slider container*/}
        <_E.Row gutter={0} className="container_slider">
              {/* enumerate all photos
              { this.renderImageSlider(products)}

              prev / next controls
              <div className="arrow prev" href="#" onClick=(this.showPrev()}></div>
              <div className="arrow next" href="#" onClick=(this.showNext()}></div>

              extra navigation controls*/}

      {this.state.products ? this.state.products.map((product, $index) => {
                  /*
                  if (/ProductImageNotFound/.test(product.imagePath)) {
                  	return null;
                  }
                  */
                    return (
						<_E.Col basis="25%" key={$index} style={{ opacity: this.setOpacity(product.stockCount) }}>
						  <ProductListItem
							 onClick={this.setPrdSelected.bind(this)}
							 data={product}
						  />
            </_E.Col>
                    )
                  }
                ):null}

          </_E.Row>

          {this.renderBackBtn()}

      </_E.Row>
    );


  }

  renderBackBtn() {
    if (this.state.bShowBackButton) {
      <img className="regularBtn" id="back" src={Translate.localizedImage('back.png')} alt="back" onClick={this.back} />
    }
  }

  renderCategoryTable() {
    var categories = TsvSettingsStore.getProductCategories();
    return (
        <_E.Row>

             {categories.map( (category, $index) => {
              return (
                <_E.Col basis="33%" key={$index} className={'gallery'+ (this.isActive($index) ? ' active' : '')}>

                    <img src={category.imagePath} alt={category.description} title={category.description} onClick={this.updateCategory.bind(this, category.categoryID)} />

                </_E.Col>
              )
            })}

        </_E.Row>
    )
  }
}


export default ProductSearch
