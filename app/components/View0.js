import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class View0 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'View0');
    TsvService.startGeneralIdleTimer();
    console.error('<<<<        FIXME: need to attach events to click and mouseover globally to TsvService.resetGeneralIdleTimer()        >>>>');
  };

  reloadPage(){
    window.location..reload(); //Not sure about this
  }

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
        window.location.href = "http://localhost:8085/index.html#/view0"; //Not sure about this
    }, "app.view0");
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="view0">
          {/* skipped admin because we skipped it else where <button id="adminBtn" onClick=(this.admin()}></button>*/}

          <h2>{Translate.translate('View0', 'Resetting')}<br>{Translate.translate('View0', 'PleaseWait')}</h2>
      </div>

    );
  }

}

export default View0
