import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class View0 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'View0');
    TsvService.startGeneralIdleTimer();
    console.error('<<<<        FIXME: need to attach events to click and mouseover globally to TsvService.resetGeneralIdleTimer()        >>>>');
  };

  admin( ){
      {/* skipped admin because we skipped it else where */}
  };

  // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("noEvent", function() {
        if (RootscopeStore.getCache('currentLocation') == "/view0") {
            TsvService.gotoDefaultIdlePage();
        }
    }, "app.view0");

    TsvService.subscribe("linkDown", function() {
        //window.location.href = "http://localhost:8085/index.html#/view0"; //Not sure about this
        // Kent edit: going to idle page is essentially same as going to /view0 ... let's say no hard-coded url links.
        TsvService.gotoDefaultIdlePage();
    }, "app.view0");
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("linkDown","app.view0");
    TsvService.unsubscribe("noEvent","app.view0");
  }

  render() {
    return (
      <_E.Row className="view0">
          {/* skipped admin because we skipped it else where <button id="adminBtn" onClick=(this.admin()}></button>*/}
        <_E.Col>
          <_E.h2>{Translate.translate('View0', 'Resetting')}<br>{Translate.translate('View0', 'PleaseWait')}</_E.h2>
        </_E.Col>
      </_E.Row>

    );
  }

}

export default View0
