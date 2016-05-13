import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
	gotoDefaultIdlePage,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('View0');

class View0 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'View0');
    //RootscopeActions.setCache('currentLocation', '/View0');
    startGeneralIdleTimer();
    Big.error('<<<<        FIXME: need to attach events to click and mouseover globally to start/resetGeneralIdleTimer()        >>>>');
  };

  admin( ){
      // skipped admin because we skipped it else where
  };

  // Add change listeners to stores
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method) {
			switch (event.method) {
				case 'noEvent':
					gotoDefaultIdlePage();
					break;
				
				case 'linkDown':
					browserHistory.push('/View0');
					break;
			}
		}
	}

  render() {
    return (
      <_E.Row className="View0">
          {/* skipped admin because we skipped it else where <button id="adminBtn" onClick=(this.admin()}></button>*/}
        <_E.Col>
          <h2>{Translate.translate('View0', 'Resetting')}<br />{Translate.translate('View0', 'PleaseWait')}</h2>
        </_E.Col>
      </_E.Row>
    );
  }

}

export default View0
