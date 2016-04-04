import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Vms extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    RootscopeActions.setSession('currentView', 'Admin_Vms');
    TsvService.enumerateComponents((err, data) => {
       this.setState({ versionInfos: data })
    })

  }
  lastHeartbeatTime() {
    TsvService.lastHeartbeatTime(null, (lastBeat) => {
      this.setState({
        lastHeartbeatTime: lastBeat
      })
    });
  }

  heartBeatNow() {
    TsvService.heartBeatNow(null, () => {
      TsvService.lastHeartbeatTime(null, (lastBeat) => {
        this.setState({
          lastHeartbeatTime: lastBeat
        });
      });
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
      <_E.Row className = "component">
        <_E.Col>
          <_E.Button onClick={TsvService.refreshIndexPage}>Restart GUI</_E.Button>
          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />
      	</_E.Col>
      </_E.Row>


    );
    /*
      <div class = "component">

          <button ng-click="restartGUI()">Restart GUI</button>

          <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

      </div>
    */
  }

}

export default Admin_Vms
