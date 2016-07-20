import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'
import CategoryListItem from './CategoryListItem'

import TsvActions from '../actions/TsvActions'
import {
	isCartEmpty,
	updateCredit
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CategorySearch');

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
      categories: TsvSettingsStore.getConfig('categories')
    }

    TsvSettingsStore.setConfig('bDisplayCgryNavigation', false);
    //TsvSettingsStore.setSession('currentView', 'CategorySearch');
    //TsvSettingsStore.setCache('currentLocation', '/CategorySearch');
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
    	if (err) Big.throw(err);
    	TsvSettingsStore.setConfig('categories', data);
    	if (data.length === 0) {
    		TsvActions.apiCall('fetchProductByCategory', cat.categoryID, (err, data) => {
		    	if (err) Big.throw(err);
		    	Big.log('setting products data................................................................................' +"\n................................................................................\n");
		    	Big.log(data);
		    	TsvSettingsStore.setConfig('products', data);
		    	browserHistory.push("/ProductSearch");
		    });
    	}
    });

  }

  // Add change listeners to stores
  componentDidMount() {
		TsvSettingsStore.addChangeListener(this._onRootstoreChange);
		TsvActions.apiCall('fetchProductCategoriesByParentCategoryID', 0, (err, data) => {
			if (err) Big.throw(err);
			TsvSettingsStore.setConfig('categories', data);
		});

		isCartEmpty( (err, isEmpty) => {
			if (TsvSettingsStore.getCache('custommachinesettings.txtIdleScene') === "category_search" || !isEmpty ) {
				startGeneralIdleTimer(this.props.location.pathname);
			}
		})
  }

  // Remove change listers from stores
  componentWillUnmount() {
		TsvSettingsStore.removeChangeListener(this._onRootstoreChange);
  }

  _onRootstoreChange(event) {
  	if (event && event.type == 'config' && event.path == 'categories') {
		//Big.log('[_onRootstoreChange]');
		//Big.log(event);
		//Big.log(TsvSettingsStore.getConfig('categories'));
		this.setState({
			categories: TsvSettingsStore.getConfig('categories')
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
