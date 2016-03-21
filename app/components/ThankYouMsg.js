import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class THANKYOU_MSG extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setConfig("bDisplayCgryNavigation2", RootscopeStore.getConfig('bDisplayCgryNavigation'));
    RootscopeActions.updateCredit();
    RootscopeActions.setSession('thankyouTimer', () => { TsvService.gotoDefaultIdlePage() }), RootscopeActions.getCache('custommachinesettings.thankyouPageTimeout' ));

  };

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="thankyou">
        <_E.Col>

          <img id="thankyouImg" src={Translate.localizedImage('thankyou.png')} alt="thankyou">
        </_E.Col>
      </_E.Row>

    );
  }

}

export default THANKYOU_MSG
