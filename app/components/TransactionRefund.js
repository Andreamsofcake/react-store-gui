import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Transaction_Refund extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'Transaction_Refund');

  };

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row >
        <_E.Col>
          <h2>Transaction Refund<br /></h2>
        </_E.Col>
      </_E.Row>
    );
  }

}

export default Transaction_Refund
