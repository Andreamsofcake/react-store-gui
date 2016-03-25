import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Category_List extends Component {

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


  // Add change listeners to stores
  componentDidMount() {
		RootscopeStore.addChangeListener(this._onRootstoreChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
		RootscopeStore.removeChangeListener(this._onRootstoreChange);
  }

  _onChange(event) {

  }

  render() {
    return (

    );
  }

}


export default Category_List
