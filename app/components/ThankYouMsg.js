import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import appConstants from '../constants/appConstants'

import CL_Actions from '../actions/CustomerLoginActions'
import CL_Store from '../stores/CustomerStore'

import PrintMatch from './Biometrics/PrintMatch'

import {
	gotoDefaultIdlePage,
	thankYouTimer,
	updateCredit,
	GuiTimer,
	KillGuiTimer
} from '../utils/TsvUtils'

import { uniq } from '../utils'

class ThankYouMsg extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setConfig("bDisplayCgryNavigation2", TsvSettingsStore.getConfig('bDisplayCgryNavigation'));
    updateCredit();
    
    this._onCLStoreChange = this._onCLStoreChange.bind(this);

  };

  // Add change listeners to stores
  componentDidMount() {
  	CL_Store.addChangeListener( this._onCLStoreChange );
    TsvSettingsStore.setSession('bVendingInProcess', false);
    thankYouTimer();
    this.setState({
    	token: uniq(),
    	customer: CL_Store.getCustomer()
    });
  }

  // Remove change listers from stores
  componentWillUnmount() {
	CL_Store.removeChangeListener( this._onCLStoreChange );
  }
  
  _onCLStoreChange(event) {
  	if (event.type === appConstants.CUSTOMER_LOGOUT) {
  		KillGuiTimer();
  		browserHistory.push('/PageIdle');
  	}
  }
  
  shopAgainPrintCheck() {
  	if (this.state.customer) {
		this.setState({
			showPrintMatcher: true
		})
	} else {
		alert('unknown error, cannot continue');
	}
  }
  
  shopAgain(matched) {
  	if (matched) {
  		browserHistory.push('/Storefront');
  	}
  }

  render() {

//          	<_E.Button size="lg" type="success" onClick={() => { browserHistory.push('/Storefront') }}>Shop Again</_E.Button>

    return (
      <_E.Row className="PageIdle">
        <_E.Col>
          <h1 style={{textAlign:'center'}}>Thanks for your business!</h1>
          <h2 style={{textAlign:'center'}}>Looking forward to seeing you again.....</h2>
          <p>{' '}</p>
          <p style={{textAlign:'center', margin: '2em auto'}}>
          	{this.state.showPrintMatcher ? (
			<PrintMatch
				autostart={true}
				canRetry={true}
				showMessages={true}
				user={this.state.customer}
				token={this.state.token}
				matchCallback={this.shopAgain.bind(this)}
				/>
          	) : (
          	<_E.Button size="lg" type="success" onClick={this.shopAgainPrintCheck.bind(this)}>Shop Again</_E.Button>
          	)}
          </p>
          <p style={{textAlign:'center'}}>
          	<_E.Button size="lg" type="primary" onClick={CL_Actions.customerLogout}>Logout</_E.Button>
          </p>
        </_E.Col>
      </_E.Row>

    );
  }

}

export default ThankYouMsg
