import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'

class Admin_Vms extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'Admin_Vms');
  }

/*
  lastHeartbeatTime() {
    TsvActions.apiCall('lastHeartbeatTime', (err, lastBeat) => {
      this.setState({
        lastHeartbeatTime: lastBeat
      })
    });
  }

  heartBeatNow() {
    TsvActions.apiCall('heartBeatNow', () => {
      this.lastHeartbeatTime();
    });
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvActions.apiCall('enumerateComponents', (err, data) => {
       this.setState({ versionInfos: data })
    })
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }
*/

  render() {
    return (
      <_E.Row className = "component">
        <_E.Col>
          <_E.Button onClick={ () => { window.location.reload() } }>Restart GUI</_E.Button>
          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />
      	</_E.Col>
      </_E.Row>


    );
  }

}

export default Admin_Vms
