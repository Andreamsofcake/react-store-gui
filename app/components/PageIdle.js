import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Page_Idle extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setCache('currentLocation', '/Page_Idle');

    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.setConfig('bShowCredit', RootscopeStore.getCache('credit') && true);

    // this might be as simple as RootscopeActions.setConfig('bAbleToLogin', false)
    TsvService.disableLoginDevices(() => {});

	var binders = [
		'idleClicked',
	];
	binders.forEach(B => {
		if (this[B]) { this[B] = this[B].bind(this); }
	});
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="Page_Idle" onClick={this.idleClicked}>
        <_E.Col>
      	<img id="idleImg" src={Translate.localizedImage('idle.png')} alt="IdlePage" />
        </_E.Col>
      </_E.Row>
    );
  }

  idleClicked(e) {
  	e.preventDefault();
  	// probably triggers a route change, according to the current TsvService func
  	TsvService.idleClicked();
  }

}

export default Page_Idle
