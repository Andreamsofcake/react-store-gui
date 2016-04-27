import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	gotoDefaultIdlePage
} from '../utils/TsvUtils'


class Activate extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Activate');
    //RootscopeActions.setCache('currentLocation', '/Activate');
    this.state = {
      activationKey: '',
      serialNumber: RootscopeStore.getCache('machineSettings.MachineSerialNumber')
    };
    
  }

  activate() {
    if (TsvActions.apiCall('activate', this.state.activationKey, 'resultCode') === 'SUCCESS') {
        gotoDefaultIdlePage();
    }

  }
  
  updateKey(e) {
  	this.setState({
  		activationKey: e.target.value
  	});
  }

  keyboardTimeOut() {
    //keyboad is activate
    //sucessful activation
    //admin login
    //wrong activation code and prompt
    // time out after 5000ms
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Activate" style={{height:'100%',width:'100%'}}>
      	<h1>NOT FINISHED!</h1>
        <h2><span>{this.state.promptMessage}</span></h2>
        <input id="activationKey" type='text' onChange={this.updateKey.bind(this)} />
        <p>state: {JSON.stringify(this.state)} </p>
        <p>foo: {JSON.stringify(RootscopeStore.getCache('machineSettings'))} </p>
      </div>
    );
  }
}

export default Activate
