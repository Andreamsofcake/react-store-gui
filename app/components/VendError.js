import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import * as _E from 'elemental'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'

import {
	gotoDefaultIdlePage,
	vendErrorTimer,
	killAllTimers,
	updateCredit
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
    //vendErrorTimer();
    killAllTimers();

  };

  // Add change listeners to stores
  componentDidMount() {
  	killAllTimers();
	this.setState({
		errorMsg1: TsvSettingsStore.getSession('vendErrorMsg1'),
		errorMsg2: TsvSettingsStore.getSession('vendErrorMsg2')
	});
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
  	killAllTimers();
  	return (
      <_E.Row className="VendError">
      	<_E.Col>
      		<h2>NOTE: for testing, the idle timer is stopped!</h2>
			<p>{this.state.errorMsg1}</p>
			<p>{this.state.errorMsg2}</p>
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
