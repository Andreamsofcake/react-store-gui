import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Category_Search extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
      // bClickedOnce: false,
      bShowCgryTitle: true,
      bShowPrevArrow: false,
      bShowNextArrow: false,
      _Index: 0,
      categories: RootscopeStore.getConfig('categories')
    }
    
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.setSession('currentView', 'Category_Search');
    RootscopeActions.setCache('currentLocation', '/Category_Search');
    RootscopeActions.updateCredit();

    TsvService.fetchProductCategoriesByParentCategoryID(0, (err, data) => {
    	if (err) throw err;
    	RootscopeActions.setConfig('categories', data);
    });
    
    TsvService.isCartEmpty( isEmpty => {
		if (RootscopeStore.getCache('custommachinesettings.txtIdleScene') === "category_search" || !isEmpty ) {
			TsvService.startGeneralIdleTimer();
		}
    })

	this._onRootstoreChange = this._onRootstoreChange.bind(this);
  }

  back(){
    browserHistory.push("/Product_Search");
  }

  isActive(index) {
    return this.state._Index === index;
  }

  fetchCategory(categoryID) {
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
		//console.log('[_onRootstoreChange]');
		//console.log(event);
		//console.log(RootscopeStore.getConfig('categories'));
		this.setState({
			categories: RootscopeStore.getConfig('categories')
		});
  	}
  }

  render() {
    return (
      <_E.Row className="Category_Search">
        <_E.Col>

          <h2>{Translate.translate('Category_Search', 'SelectCategory')}</h2>
        </_E.Col>

          {/*slider container*/}
          <_E.Row className="container_slider">

              {this.state.categories ? this.state.categories.map((category, $index) => {
                  return (
                    <_E.Col basis="33%" key={$index} className = "gallery" >

                        <div className="product">

                            { this.state.bShowCgryTitle ? (<h4>{category.categoryName}</h4>) : null }

                            <img id={$index} src={category.imagePath} alt={category.description} title={category.description} onClick={this.fetchCategory.bind(this, category.categoryID)} />

                        </div>

                    </_E.Col>
                  )
                }
              ) : null}

          </_E.Row>

          { this.state.bSubCgry ? this.renderSubCgry() : null }

      </_E.Row>
    );
  }

  renderSubCgry() {
  	//<img className="regularBtn" id="backImg" src={Translate.localizedImage('back.png')} onClick={this.back} />
    return (
      <_E.Button> {Translate.translate('Category_Search', 'Back')} </_E.Button>
    )
  }

}


export default Category_Search
