import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import CategoryListItem from './CategoryListItem'

import TsvActions from '../actions/TsvActions'
import {
	isCartEmpty,
} from '../utils/TsvUtils'

class CategorySearch extends Component {

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
    //RootscopeActions.setSession('currentView', 'CategorySearch');
    //RootscopeActions.setCache('currentLocation', '/CategorySearch');
    updateCredit();

	this._onRootstoreChange = this._onRootstoreChange.bind(this);
  }

  back(){
    browserHistory.push("/ProductSearch");
  }

  isActive(index) {
    return this.state._Index === index;
  }

  fetchCategory(cat) {
    //var categoryID = cat.categoryID;
  	TsvActions.apiCall('fetchProductCategoriesByParentCategoryID', cat.categoryID, (err, data) => {
    	if (err) throw err;
    	RootscopeActions.setConfig('categories', data);
    	if (data.length === 0) {
    		TsvActions.apiCall('fetchProductByCategory', cat.categoryID, (err, data) => {
		    	if (err) throw err;
		    	console.log('setting products data................................................................................' +"\n................................................................................\n");
		    	console.log(data);
		    	RootscopeActions.setConfig('products', data);
		    	browserHistory.push("/ProductSearch");
		    });
    	}
    });

  }

  // Add change listeners to stores
  componentDidMount() {
		RootscopeStore.addChangeListener(this._onRootstoreChange);
		TsvActions.apiCall('fetchProductCategoriesByParentCategoryID', 0, (err, data) => {
			if (err) throw err;
			RootscopeActions.setConfig('categories', data);
		});

		isCartEmpty( (err, isEmpty) => {
			if (RootscopeStore.getCache('custommachinesettings.txtIdleScene') === "category_search" || !isEmpty ) {
				TsvService.startGeneralIdleTimer();
			}
		})
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
      <_E.Row className="CategorySearch">
        <_E.Col>

          <h2>{Translate.translate('CategorySearch', 'SelectCategory')}</h2>
        </_E.Col>

          {/*slider container*/}
          <_E.Row className="container_slider">

              {this.state.categories ? this.state.categories.map((category, $index) => {
                  return (
                    <CategoryListItem
                       key={$index}
                       onClick={this.fetchCategory.bind(this)}
                       data={category}
                    />
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
      <_E.Button component={(<Link to="/CategorySearch">{Translate.translate('CategorySearch', 'Back')}</Link>)} />
    )
  }

}


export default CategorySearch
