import React from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../lib/TsvService'
import Translate from '../lib/Translate'
import RootscopeStore from '../store/RootscopeStore'

class Product_Search extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state {
      bShowBackBtn = false;
    }

    RootscopeActions.setConfig('bDisplayCgry', false);
    RootscopeActions.updateCredit(); //unsure
    RootscopeActions.setSession('creditBalance', RootscopeStore.getCache('credit') && true)
    RootscopeActions.setSession('Product_Search');

    if (RootscopeStore.getCache(‘custommachinesettings.bCategoryView’) === false) {
      this.state.products = TSVService.fetchProduct();
    } else {
      this.state.products = RootscopeStore.getProducts();
      this.state.bShowBackBtn = true;
    }

    this.state {
      _Index = 0;
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
      RootscopeActions.setConfig('pvr', TSVService.addToCartByProductID(product.productID));
      // $location.path("/view2");

    }
  }

  logoClicked() {
    RootscopeActions.gotoDefaultIdlePage();
  }

  updateCategory(categoryID) {
      RootscopeStore.getProducts(TSVService.fetchProductByCategory(categoryID));
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

      <div className="Product_Search" >
      { if (this.state.bDisplayCgry) { this.renderCategoryTable() } }

      <h2>{{translate('SelectProduct')}}</h2>

        // slider container
        <div class="container_slider">

            // enumerate all photos
            // { this.renderImageSlider(products)}

            // prev / next controls
            // <div class="arrow prev" href="#" onClick=(this.showPrev()}></div>
            // <div class="arrow next" href="#" onClick=(this.showNext()}></div>

            // extra navigation controls
            <ul class="flex-container">
                {Object.keys(products).map(function(product){
                  return (
                    <li class = "flex-item" ng-class="{'active':isActive($index)}" style={{ opacity: this.setOpacity(stockCount) }}>

                        <figure id="prdImg{{$index}}" onClick={this.setPrdSelected.bind(this, product)}>

                            <figcaption>{{product.productName}}</figcaption>

                            <img src="{{product.imagePath}}" alt="{{product.description}}" title="{{product.description}}" />

                            <p class="prdPrice">{{ currencyFilter(product.price) }}</p>

                        </figure>

                    </li>
                  )
                })}
            </ul>
          </div>
          {if bShowBackBtn}
            <img class="regularBtn" id="backImg" id="back" src="back.png" alt="back" onClick={back()}>
          {/if}
      </div>
    );
  }

  // renderImageSlider(products) {
  //   {Object.keys(products).map(function(product){
  //     return (
  //        <img class="slide" ng-swipe-right={showPrev()} ng-swipe-left={showNext()} ng-show="isActive($index)" src="{{product.imagePath}}" />
  //     )
  //   })}
  // }

  renderCategoryTable() {
    var categories = RootscopeStore.getProductCategories();
    return (
      <table  id="displayCategories">

          <tr class="nav">

            {Object.keys(categories).map(function(category){
              return (
                <td class = "gallery" ng-class="{'active':isActive($index)}">

                    <img src="{{category.imagePath}}" alt="{{category.description}}" title="{{category.description}}" onClick="updateCategory({{category.categoryID}});" />

                </td>
              )
            })}

          </tr>

      </table>
    )
  }

  idleClicked(e) {
  	e.preventDefault();
  	// probably triggers a route change, according to the current TSVService func
  	TSVService.idleClicked();
  }

}

export default Product_Search
