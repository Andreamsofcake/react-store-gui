import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class View0 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'View0');
    //RootscopeActions.setCache('currentLocation', '/View0');
    TsvService.startGeneralIdleTimer();
    console.error('<<<<        FIXME: need to attach events to click and mouseover globally to TsvService.resetGeneralIdleTimer()        >>>>');
  };

  admin( ){
      // skipped admin because we skipped it else where
  };

  // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("noEvent", function() {
        if (RootscopeStore.getCache('currentLocation') == "/View0") {
            TsvService.gotoDefaultIdlePage();
        }
    }, "app.View0");

    TsvService.subscribe("linkDown", function() {
        //window.location.href = "http://localhost:8085/index.html#/View0"; //Not sure about this
        // Kent edit: going to idle page is essentially same as going to /View0 ... let's say no hard-coded url links.
        // Kent update: actually, /View0 is "wait a moment, system is not ready...."
        // so we should be keeping it here in /View0
        //TsvService.gotoDefaultIdlePage();
        browserHistory.push('/View0');
        
    }, "app.View0");
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("linkDown","app.View0");
    TsvService.unsubscribe("noEvent","app.View0");
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
