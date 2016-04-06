import React, { Component } from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import RootscopeStore from '../stores/RootscopeStore'
import ProductListItem from './ProductListItem'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import { Link } from 'react-router'

class Product_Search extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    this.state = {
      bShowBackBtn: RootscopeStore.getCache('custommachinesettings.bCategoryView'),
      products: [],
      _Index: 0
    }

    RootscopeActions.setConfig('bDisplayCgry', false);
    RootscopeActions.updateCredit();
    RootscopeActions.setConfig('credit', RootscopeStore.getSession('creditBalance'))
    RootscopeActions.setSession('currentView', 'Product_Search');
    RootscopeActions.setCache('currentLocation', '/Product_Search');

    if (typeof window !== 'undefined') {
    	window.RootscopeStore = RootscopeStore;
    }
    
  }
  
  componentDidMount() {
	TsvService.fetchShoppingCart2(null, (err, data) => {
		if (err) throw err;
		RootscopeActions.setCache('shoppingCart', data);
	});

    let state = {
    	products: RootscopeStore.getConfig('products'),
    	bShowBackBtn: RootscopeStore.getCache('custommachinesettings.bCategoryView')
    }

    this.setState(state);
    
    if (!state.products) {
		console.warn('have to go fetch all products! (fix in refactor, but Product_Search is not long-term used anyway ... just old code for testing');
		//console.log(RootscopeStore.getConfig('products'));
		TsvService.fetchProduct(null, (err, data) => {
			if (err) throw err;
			RootscopeActions.setConfig('products', data);
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
    	TsvService.addToCartByProductID(product.productID, (err, response) => {
    		if (err) throw err;
	      RootscopeActions.setConfig('pvr', response);

	      TsvService.fetchShoppingCart2(null, (err, data) => {
			if (err) throw err;
			RootscopeActions.setCache('shoppingCart', data);
	      });

	      // this will throw it to the simple checkout page, don't want to do that we want to shop!
	      // browserHistory.push("/View2");
      	});
    }
  }

  logoClicked() {
    RootscopeActions.gotoDefaultIdlePage();
  }

  updateCategory(categoryID) {
  	TsvService.fetchProductByCategory(categoryID, (err, data) => {
		if (err) throw err;
		RootscopeActions.setConfig('products', data);
		this.setState({
			products: data
		});
  	});
  }

  back() {
      browserHistory.push("/Category_Search");
  }

  render() {
    var products = this.state.products;
    if (!products || !products.length) {
    	return (
		  <_E.Row className="Product_Search" >

			<_E.Col>

			<h2>{Translate.translate('Product_Search','OneMomentPlease')}</h2>

			</_E.Col>
    		</_E.Row>
    	);
    }

    return (

      <_E.Row className="Product_Search" >

        <_E.Col>
        	<_E.Button style={{float:'right'}} type="primary" component={(<Link to="/Shopping_Cart">TEST: go to shopping cart page</Link>)} />
          { this.state.bDisplayCgry ? this.renderCategoryTable() : null }
	        <h2>{Translate.translate('Product_Search','SelectProduct')}</h2>
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

    /*
    <div className="Product_Search" >
    { if (this.state.bDisplayCgry) { this.renderCategoryTable() } }

    <h2>{Translate.translate('Product_Search','SelectProduct')}</h2>

      {slider container}
      <div className="container_slider">

           enumerate all photos
          { this.renderImageSlider(products)}
          prev / next controls
          <div className="arrow prev" href="#" onClick=(this.showPrev()}></div>
          <div className="arrow next" href="#" onClick=(this.showNext()}></div>
          extra navigation controls

          <ul className="flex-container">
              {products.map((product, $index) => {
                return (
                  <li key={$index} className={'flex-item' + this.isActive($index) ? ' active'} style={{ opacity: this.setOpacity(stockCount) }}>

                      <figure id={"prdImg" + $index} onClick={this.setPrdSelected.bind(this, product)}>

                          <figcaption>{product.productName}</figcaption>

                          <img src={product.imagePath} alt={product.description} title={product.description} />

                          <p className="prdPrice"> {TsvService.currencyFilter(product.price) }</p>

                      </figure>

                  </li>
                )
              })}
          </ul>
        </div>

    */

  }

  /* renderImageSlider(products) {
    {Object.keys(products).map(function(product){
      return (
         <img className="slide" ng-swipe-right={showPrev()} ng-swipe-left={showNext()} ng-show="isActive($index)" src="{{product.imagePath}}" />
      )
    })}
  } */

  renderBackBtn() {
    if (this.state.bShowBackButton) {
      <img className="regularBtn" id="back" src={Translate.localizedImage('back.png')} alt="back" onClick={this.back} />
    }
  }

  renderCategoryTable() {
    var categories = RootscopeStore.getProductCategories();
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

    /*
      <table  id="displayCategories">

          <tr className="nav">

             {categories.map( (category, $index) => {
              return (
                <td key={$index} className={'gallery'+ this.isActive($index) ? ' active'}>

                    <img src={category.imagePath} alt={category.description} title={category.description} onClick={this.updateCategory.bind(this, category.categoryID)} />

                </td>
              )
            })}

          </tr>

      </table>
    */

  }
}


export default Product_Search
