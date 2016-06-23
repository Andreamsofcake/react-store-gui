import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import CL_Actions from '../actions/CustomerLoginActions'

import {
	gotoDefaultIdlePage,
	thankYouTimer,
	updateCredit,
} from '../utils/TsvUtils'

class ThankYouMsg extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    TsvSettingsStore.setConfig("bDisplayCgryNavigation2", TsvSettingsStore.getConfig('bDisplayCgryNavigation'));
    updateCredit();
    
    thankYouTimer();

  };

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="PageIdle">
        <_E.Col>
          <h1 style={{textAlign:'center'}}>Thanks for your business!</h1>
          <p>{' '}</p>
          <h3 style={{textAlign:'center'}}>Looking forwawrd to seeing you again.....</h3>
          <p>{' '}</p>
          <p style={{textAlign:'center'}}><_E.Button size="lg" type="primary" onClick={() => { CL_Actions.customerLogout() }}>Logout</_E.Button></p>
        </_E.Col>
      </_E.Row>

    );
  }

}

export default ThankYouMsg
