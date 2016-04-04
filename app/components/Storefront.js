
import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Storefront extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    RootscopeActions.setSession('currentView', 'Storefront');

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
          {/* skipped admin because we skipped it else where <button id="adminBtn" onClick=(this.admin()}></button>*/}
        <_E.Col>
          <h2>Storefront<br /></h2>
        </_E.Col>
      </_E.Row>
    );
  }

}

export default Storefront
