import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'

class Category_Search extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
      // bClickedOnce: false,
      bShowCgryTitle: true,
      bShowPrevArrow: false,
      bShowNextArrow: false,
      _Index: 0
    }

    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.updateCredit();
    RootscopeActions.setSession('currentView', 'Category_Search');
    RootscopeActions.setConfig('categories', TsvService.fetchProductCategoriesByParentCategoryID(0));

    if (RootscopeStore.getConfig('customSetting.txtIdleScene') === "category_search")
      || !TsvService.isCartEmpty() ){
        TsvService.startGeneralIdleTimer();
      }

  }

  back(){
    browserHistory.push("/Product_Search");
  }

  isActive(index) {
    return this.state._Index === index;
  }

  fetchCategory(categoryID) {
    RootscopeActions.setConfig('categories', TsvService.fetchProductCategoriesByParentCategoryID(categoryID));

    if(RootscopeStore.getCache('categories').length == 0) {
      RootscopeActions.setConfig('products', TSVService.fetchProductByCategory(categoryID));
      browserHistory.push("/Product_Search");
    }
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Category_Search">


          <h2>{Translate.translate('Select_Category', 'SelectCategory')}</h2>


          {/*slider container*/}
          <div className="container_slider">

              <ul className="nav">

              {categories.map((category, $index) => {
                  return (
                    <li key={$index} className = "gallery" >

                        <figure>

                            { if (this.state.bShowCgryTitle) {this.renderCategoryName()} }

                            <img id={$index} src={category.imagePath} alt={category.description} title={category.description} onClick={this.fetchCategory.bind(this, category.categoryID)} />

                        </figure>

                    </li>
                  )
                }
              )}
              </ul>

          </div>

          { if (this.state.bSubCgry) { this.renderSubCgry()} }

      </div>
    );
  }

  renderSubCgry() {
    return (
      <img className="regularBtn" id="backImg" ng-show="bSubCgry" src={Translate.localizedImage('back.png')} noClick={this.back()} /> {/*err-src="../Images/back.png" */}
    )
  }

  renderCategoryName() {
    return (
        <figcaption>{{category.categoryName}}</figcaption>
    )
  }



}


export default Category_Search
