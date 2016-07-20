import React, { Component } from 'react'
//import * as Translate from '../../lib/Translate'

//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import CS_Actions from '../../actions/CustomerSignupActions'
import CS_Store from '../../stores/CustomerStore'

import appConstants from '../../constants/appConstants'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Step extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
    	errorMsg: null,
    	simulatorPrint: null
    }
    
    this._onCSStoreChange = this._onCSStoreChange.bind(this);

  };

  // Add change listeners to stores
  componentDidMount() {
  	CS_Store.addChangeListener( this._onCSStoreChange );
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CS_Store.removeChangeListener( this._onCSStoreChange );
  }
  
  _onCSStoreChange(event) {
  	if (event.type === appConstants.ADMIN_VERIFIED_SIGNUP) {
  		if (event.status === 'ok') {
  			this.setState({
  				errorMsg: null
  			});
  		} else {
  			this.setState({
  				errorMsg: 'There was a problem recognizing the admin, please try again.'
  			});
  		}
  	}
  }
  
  selectSimulatorPrint(who, e) {
  	this.setState({
  		simulatorPrint: who
  	});
  }
  
  startPrintScan() {
  	if (this.props.testing && !this.state.simulatorPrint) {
  		return alert('TESTING: Please choose a customer print from the orange buttons.');
  	}
  	CS_Actions.adminVerify(this.props.signupToken, this.state.simulatorPrint);
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Attendant verification of your signup</h2>
			  <p>Please alert one of the attendants to verify your identity, and then scan their fingerprint.</p>
			  {this.renderErrorMsg()}
			  <_E.Button type="warning" onClick={this.startPrintScan.bind(this)}>TESTING: Press to "record" the scan, this will happen automatically when hardware is attached.</_E.Button>
			</_E.Col>
		  </_E.Row>
		  {this.renderSimulator()}
		</div>
    );
  }
  
  renderErrorMsg() {
  	if (this.state.errorMsg) {
  		return (
  			<_E.Alert type="danger">{this.state.errorMsg}</_E.Alert>
  		);
  	}
  	return null;
  }
  
  renderSimulator() {
  	if (this.props.testing) {
  		return (
		  <_E.Row style={{ border: '1px solid #666', borderRadius: '4px', backgroundColor: '#ccc', maxWidth: '85%', margin: '3em auto', paddingTop: '0.4em' }}>
			<_E.Col>
			  <h4 style={{fontWeight: 'normal'}}>SIMULATOR: choose a customer finger/thumb print:</h4>
			  <_E.Row style={{marginBottom: '1em'}}>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPrint.bind(this, 'Admin')}>ADMIN</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPrint.bind(this, 'NotAdmin')}>NOT admin</_E.Button>
				</_E.Col>
			  </_E.Row>
			  <p style={{fontSize: '0.75em'}}>Picked: {this.state.simulatorPrint || 'none yet'}, signup token: <strong>{this.props.signupToken}</strong></p>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default Step
