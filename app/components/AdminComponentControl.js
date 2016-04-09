import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Component_Control extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'Admin_Component_Control');
    this.state = {
      versionInfos: TsvService.enumerateComponents()
    }

  }
  restartGUI() {
    TsvService.refreshIndexPage();
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
      <_E.Row class="vms">
        <_E.Col>
          <_E.Button onClick={this.heartBeatNow}>{Tranlate.translate('Admin_Component_Control''HeartBeatNow')}</_E.Button>
          <_E.Button onClick={this.lastHeartbeatTime()}>{Translate.translate('Admin_Component_Control','LastHeartBeatTime')}</_E.Button>
            {this.state.lastHeartBeatTime.map((beat, $index) => {
                return (
                  <p key={$index} > {beat.key} : {beat}</p>
                )}
              )}
          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />
        </_E.Col>
      </_E.Row>


    );
    /*
      <div class="vms">

          <button ng-click="heartBeatNow()">{{translate('HeartBeatNow')}}</button>

          <button ng-click="lastHeartbeatTime()">{{translate('LastHeartBeatTime')}}</button>

          <p ng-repeat='(key, value) in lastHeartBeatTime'>{{key}} : {{value}}</p>

          <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

      </div>
    */
  }

}

export default Admin_Component_Control
