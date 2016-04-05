
import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Storefront extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    StorefrontActions.setSession('currentView', 'Storefront');

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
          <h2>Storefront</h2>
          <_E.Pill label="All" type="primary" onClear={this.handleClear} />
          <_E.Pill label="Drinks" type="primary" onClear={this.handleClear} />
          <_E.Pill label="Snacks" type="primary" onClear={this.handleClear} />
        </_E.Col>
      </_E.Row>
    );
  }

}

export default Storefront
