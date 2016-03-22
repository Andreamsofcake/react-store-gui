import React, { Component } from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import RootscopeStore from '../stores/RootscopeStore'

class Product_Search extends Component {

  constructor(props, context) {
    {/* MUST call super() before any this.*/}
    super(props, context);

    this.state = {
      bShowBackBtn: false,
      _Index: 0
    }

    RootscopeActions.setConfig('bDisplayCgry', false);
    RootscopeActions.updateCredit();
    RootscopeActions.setConfig('credit', RootscopeStore.getSession('creditBalance'))
    RootscopeActions.setSession('currentView', 'Product_Search');

    if (RootscopeStore.getCache('custommachinesettings.bCategoryView') === false) {
      /*this.state.products = */TsvService.fetchProduct(null, function(err, products) {
      	this.setState({
      		products: products
      	});
      });

    } else {
      this.state.products = RootscopeStore.getProducts();
      this.state.bShowBackBtn = true;
    }

  }

  setOpacity() {
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
      RootscopeActions.setConfig('pvr', TsvService.addToCartByProductID(product.productID));
      {/* $location.path("/view2");*/}

    }
  }

  logoClicked() {
    RootscopeActions.gotoDefaultIdlePage();
  }

  updateCategory(categoryID) {
      RootscopeStore.getProducts(TsvService.fetchProductByCategory(categoryID));
  }

  back() {
      browserHistory.push("/Category_Search");
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    var products = RootscopeStore.getProducts();
    return (

      <_E.Row className="Product_Search" >

        <_E.Col>
          { this.state.bDisplayCgry ? this.renderCategoryTable() : null }

        <h2>{Translate.translate('Product_Search','SelectProduct')}</h2>
        </_E.Col>
        {/* slider container*/}
        <_E.Row class="container_slider">
          <_E.Col>

              {/* enumerate all photos
              { this.renderImageSlider(products)}

              prev / next controls
              <div class="arrow prev" href="#" onClick=(this.showPrev()}></div>
              <div class="arrow next" href="#" onClick=(this.showNext()}></div>

              extra navigation controls*/}

              <ul className="flex-container">
                  {products.map((product, $index) => {
                    return (
                      <li key={$index} className={'flex-item' + (this.isActive($index) ? ' active' : '')} style={{ opacity: this.setOpacity(stockCount) }}>

                          <figure id={"prdImg" + $index} onClick={this.setPrdSelected.bind(this, product)}>

                              <figcaption>{product.productName}</figcaption>

                              <img src={product.imagePath} alt={product.description} title={product.description} />

                              <p className="prdPrice"> {TsvService.currencyFilter(product.price) }</p>

                          </figure>

                      </li>
                    )
                  })}
              </ul>
            </_E.Col>
          </_E.Row>

          {this.renderBackBtn()}

      </_E.Row>
    );

    /*
    <div className="Product_Search" >
    { if (this.state.bDisplayCgry) { this.renderCategoryTable() } }

    <h2>{Translate.translate('Product_Search','SelectProduct')}</h2>

      {slider container}
      <div class="container_slider">

           enumerate all photos
          { this.renderImageSlider(products)}
          prev / next controls
          <div class="arrow prev" href="#" onClick=(this.showPrev()}></div>
          <div class="arrow next" href="#" onClick=(this.showNext()}></div>
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
         <img class="slide" ng-swipe-right={showPrev()} ng-swipe-left={showNext()} ng-show="isActive($index)" src="{{product.imagePath}}" />
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
