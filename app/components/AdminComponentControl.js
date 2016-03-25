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
    this.state = {
      versionInfos: TsvService.enumerateComponents()
    }

  }
  lastHeartbeatTime() {
    this.setState({
      lastHeartbeatTime: TsvService.lastHeartbeatTime()
    })
  }

  heartBeatNow() {
    TsvService.heartBeatNow();
    this.setState({
      lastHeartbeatTime: TsvService.lastHeartbeatTime()
    })
  }

  back(){
    browserHistory.push("/Admin_Home")
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
          <_E.Button onClick={this.restartGUI}>Restart GUI</_E.Button>
          <_E.Button id="back" onClick={this.backToAdminHome}>Back</_E.Button>
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
