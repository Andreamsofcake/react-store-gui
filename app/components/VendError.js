import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import * as _E from 'elemental'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'

import CustomerActions from '../actions/CustomerActions'
import CustomerStore from '../stores/CustomerStore'

import {
	updateCredit,
	GuiTimer,
	KillGuiTimer
} from '../utils/TsvUtils'

class VendError extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'VendError');
    //TsvSettingsStore.setCache('currentLocation', '/VendError');
    this.state = {
      errorMsg1: TsvSettingsStore.getSession('vendErrorMsg1'),
      errorMsg2: TsvSettingsStore.getSession('vendErrorMsg2')
    }
    updateCredit();

    this._onCLStoreChange = this._onCLStoreChange.bind(this);

  };

  // Add change listeners to stores
  componentDidMount() {
  	CustomerStore.addChangeListener( this._onCLStoreChange );
    //vendErrorTimer();
  	KillGuiTimer();
	this.setState({
		errorMsg1: TsvSettingsStore.getSession('vendErrorMsg1'),
		errorMsg2: TsvSettingsStore.getSession('vendErrorMsg2')
	});
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CustomerStore.removeChangeListener( this._onCLStoreChange );
  }

  _onCLStoreChange(event) {
  	if (event.type === appConstants.CUSTOMER_LOGOUT) {
  		KillGuiTimer();
  		browserHistory.push('/PageIdle');
  	}
  }

  render() {
  	return (
      <_E.Row className="VendError">
      	<_E.Col>
      		<h2>NOTE: for testing, the idle timer is stopped!</h2>
			<p>{this.state.errorMsg1}</p>
			<p>{this.state.errorMsg2}</p>
      	</_E.Col>
      	<_E.Col>
          <p>{' '}</p>
          <p style={{textAlign:'center', margin: '2em auto'}}>
          	<_E.Button size="lg" type="success" onClick={() => { browserHistory.push('/Storefront') }}>Shop Again</_E.Button>
          </p>
          <p style={{textAlign:'center'}}>
          	<_E.Button size="lg" type="primary" onClick={() => { CustomerActions.customerLogout() }}>Logout</_E.Button>
          </p>
      	</_E.Col>
      	<div>
      	<pre>
      	{JSON.stringify(TsvSettingsStore.getCache('shoppingCart'), null, 4)}
      	</pre>
      	</div>
      </_E.Row>
  	);
  }

}

export default VendError
