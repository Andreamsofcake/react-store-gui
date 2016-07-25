import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import CustomerActions from '../actions/CustomerActions'
import SessionActions from '../actions/SessionActions'
import TransactionActions from '../actions/TransactionActions'

import TsvActions from '../actions/TsvActions'
import {
	idleClicked,
	emptyCart
} from '../utils/TsvUtils'

class PageIdle extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    TsvSettingsStore.setConfig({
    	bDisplayCgryNavigation: false,
    	bShowCredit: TsvSettingsStore.getCache('credit') && true
    });

    // this might be as simple as TsvSettingsStore.setConfig('bAbleToLogin', false)
    TsvActions.apiCall('disableLoginDevices');

	var binders = [
		'idleClicked',
	];
	binders.forEach(B => {
		if (this[B]) { this[B] = this[B].bind(this); }
	});
  }

	// Add change listeners to stores
	componentDidMount() {
		emptyCart();
		CustomerActions.customerLogout();
		SessionActions.kill();
		TransactionActions.kill();
	}

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="PageIdle" onClick={this.active}>
      	<h1 className="mainHeaderText page-centered" style={{textAlign:'center', fontSize: '3em'}}>Touch<br />anywhere<br />to<br />shop....</h1>
      </div>
    );
  }

  active(e) {
  	e.preventDefault();
  	idleClicked();
  }

}

export default PageIdle
