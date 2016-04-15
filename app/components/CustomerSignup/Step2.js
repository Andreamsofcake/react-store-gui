import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
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
  	if (event.type === appConstants.PRINT_SCANNED_SIGNUP) {
  		if (event.status === 'ok') {
  			this.setState({
  				errorMsg: null
  			});
  		} else {
  			this.setState({
  				errorMsg: 'There was a problem scanning your fingerprint, please try again.'
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
  	CS_Actions.scanPrint(this.props.signupToken, this.state.simulatorPrint);
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Scan your finger or thumb print</h2>
			  <p>Put your finger or thumb on the scanner to the left.</p>
			  <_E.Alert type="info">Use the same finger or thumb that you used at sign up.<br /><strong>HINT: </strong>we asked for your thumb and your index finger from your dominant hand.</_E.Alert>
			  <_E.Button type="warning" onClick={this.startPrintScan.bind(this)}>TESTING: Press to "record" the scan, this will happen automatically when hardware is attached.</_E.Button>
			</_E.Col>
		  </_E.Row>
		  {this.renderSimulator()}
		</div>
    );
  }
  
  renderSimulator() {
  	if (this.props.testing) {
  		return (
		  <_E.Row style={{ border: '1px solid #666', borderRadius: '4px', backgroundColor: '#ccc', maxWidth: '85%', margin: '3em auto', paddingTop: '0.4em' }}>
			<_E.Col>
			  <h4 style={{fontWeight: 'normal'}}>SIMULATOR: choose a customer finger/thumb print:</h4>
			  <_E.Row style={{marginBottom: '1em'}}>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPrint.bind(this, 'KrisKhan')}>Kris Khan</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPrint.bind(this, 'MaryJaneSmith')}>Mary Jane Smith</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPrint.bind(this, 'BuddyGalore')}>Buddy Galore</_E.Button>
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
