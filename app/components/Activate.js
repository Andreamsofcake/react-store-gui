import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class Activate extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Activate');
    this.state = {
      activationKey: '',
      serialNumber: TsvService.machineSetting('MachineSerialNumber')
    };

  activate() {
    if (TsvService.activate('this.activationKey', 'resultCode') === 'SUCCESS') {
        kb.reveal();
    }

  }

  keyboardTimeOut() {
    //keyboad is activate
    //sucessful activation
    //admin login
    //wrong activation code and prompt
    // time out after 5000ms
  }

  keyboard() {

  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Activate" style="height:100%;width:100%;">
        <h2><span>{this.state.promptMessage}</span></h2>
        <input id="activationKey" type='text' />{activate() keyboard()}
      </div>
    );
  }
}

export default Activate
