import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class THANKYOU_MSG extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setConfig("bDisplayCgryNavigation2", RootscopeStore.getConfig('bDisplayCgryNavigation'));
    RootscopeActions.updateCredit();
    RootscopeActions.setSession('thankyouTimer', thankyouTimeout, RootscopeActions.getCache('custommachinesettings.thankyouPageTimeout' ));

  };

  vendErrorTimeout(){
      TsvService.gotoDefaultIdlePage();
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="thankyou">

          <img id="thankyouImg" src={Translate.localizedImage('thankyou.png')} alt="thankyou">

      </div>

    );
  }

}

export default THANKYOU_MSG
