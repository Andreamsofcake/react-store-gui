import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import * as _E from 'elemental'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'

class Vend_Error extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Vend_Error');
    //RootscopeActions.setCache('currentLocation', '/Vend_Error');
    RootscopeActions.updateCredit();
    this.state = {
      errorMsg1: RootscopeStore.getSession('vendErrorMsg1'),
      errorMsg2: RootscopeStore.getSession('vendErrorMsg2')
    }
    RootscopeActions.setSession('vendErrorTimer', () => { TsvService.gotoDefaultIdlePage() }, 10000);

  };

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
  	return (
      <_E.Row className="VendError">
      	<_E.Col>
			<p>{this.errorMsg1}</p>
			<p>{this.errorMsg2}</p>
      	</_E.Col>
      </_E.Row>
  	);
  	/*
    return (
      <div className="VendError">
        <p>{this.errorMsg1}</p>

        <p>{this.errorMsg2}</p>
      </div>
    );
    */
  }

}

export default Vend_Error
