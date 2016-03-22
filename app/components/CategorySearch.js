import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
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
    
    TsvService.isCartEmpty( isEmpty => {
		if (RootscopeStore.getCache('custommachinesettings.txtIdleScene') === "category_search" || !isEmpty ) {
			TsvService.startGeneralIdleTimer();
		}
    })


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
      <_E.Row className="Category_Search">
        <_E.Col>

          <h2>{Translate.translate('Select_Category', 'SelectCategory')}</h2>
        </_E.Col>

          {/*slider container*/}
          <_E.Row className="container_slider">
            <_E.Col>
              <ul className="nav">

              {categories.map((category, $index) => {
                  return (
                    <li key={$index} className = "gallery" >

                        <figure>

                            { this.state.bShowCgryTitle ? (<figcaption>{category.categoryName}</figcaption>) : null }

                            <img id={$index} src={category.imagePath} alt={category.description} title={category.description} onClick={this.fetchCategory.bind(this, category.categoryID)} />

                        </figure>

                    </li>
                  )
                }
              )}
              </ul>
            </_E.Col>
          </_E.Row>

          { this.state.bSubCgry ? this.renderSubCgry() : null }

      </_E.Row>
    );
  }

  renderSubCgry() {
    return (
      <img className="regularBtn" id="backImg" src={Translate.localizedImage('back.png')} onClick={this.back} />
    )
  }



}


export default Category_Search
