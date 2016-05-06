import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	gotoDefaultIdlePage,
	startGeneralIdleTimer,
} from '../utils/TsvUtils'


class Activate extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
      activationKey: '',
      //serialNumber: RootscopeStore.getCache('machineSettings.MachineSerialNumber'),
      machineSettings: RootscopeStore.getCache('machineSettings')
    };
    
  }
  
/*
    "Activate": {
        "CallToActivate1": "Call AVT, Inc",
        "CallToActivate2": "1-877-424-3663",
        "CallToActivate3": "For Your Activation Code",
        "WrongActivationCode": "Wrong Code!",
        "ActivationKey": "Activation Key"
    },
*/

  save(e) {
  	e.preventDefault();
  	TsvActions.apiCall('activate', this.state.activationKey, (err, data) => {
  		if (data.resultCode === 'SUCCESS') {
  			browserHistory.push('/Admin/Login');
  		} else {
  			this.setState({
  				apiResponse: data.result || 'Wrong activation key, please contact your SDK rep for more information'
  			});
  		}
  	});
  }

  textChange(e) {
  	startGeneralIdleTimer(this.props.location.pathname);
  	this.setState({
  		activationKey: e.target.value
  	});
  }

  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
	TsvStore.addChangeListener(this._onTsvChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
	TsvStore.removeChangeListener(this._onTsvChange);
  }

  _onTsvChange(event) {
  	startGeneralIdleTimer(this.props.location.pathname);
  	/*
  	// not sure what the inbound response would be, also we're capturing it explicitly above anyway...
  	// this is here "just in case"
	if (event && event.method === 'FooSomeMessage') {
	}
	*/
  }

  render() {
    return (

      <_E.Row className="Activate" style={{maxWidth:'50%',margin: '0 auto'}}>
			<_E.Col sm="100%" md="100%" lg="100%">
				<h1 style={{fontWeight:300, marginTop:'1em', textAlign:'center'}}>Activate<br />this machine</h1>
			</_E.Col>

          	<_E.Col sm="100%" md="100%" lg="100%" style={{textAlign:'center'}}>
			<_E.Form>

        			<h2 style={{fontWeight:300, textAlign:'center'}}>Enter Activation Key:</h2>
					<_E.FormInput value={this.state.activationKey || this.state.machineSettings.ActivationKey} _vkenabled="true" name='activationKey' onChange={this.textChange.bind(this)} />

			</_E.Form>
    	    </_E.Col>

          	<_E.Col sm="100%" md="100%" lg="100%" style={{textAlign:'center'}}>
    	        <p><_E.Button size="lg" type="primary" onClick={this.save.bind(this)} >Activate this machine</_E.Button></p>
    	        <p>&nbsp;</p>
    	        <p>Machine serial number:<br /><strong>{this.state.machineSettings.MachineSerialNumber || 'none found'}</strong></p>
    	    </_E.Col>

          	<_E.Col sm="100%" md="100%" lg="100%" style={{textAlign:'center'}}>
    	        <p>{this.state.apiResponse}</p>
    	    </_E.Col>


          	{/*<_E.Col sm="100%" md="100%" lg="100%" style={{textAlign:'center'}}>
				<p>state: {JSON.stringify(this.state)} </p>
				<p>foo: {JSON.stringify(RootscopeStore.getCache('machineSettings'))} </p>
    	    </_E.Col>*/}
      </_E.Row>
    );
  }
}

export default Activate
