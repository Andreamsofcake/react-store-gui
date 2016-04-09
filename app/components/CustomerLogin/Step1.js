import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import CL_Actions from '../../actions/CustomerLoginActions'
import CL_Store from '../../stores/CustomerStore'

import appConstants from '../../constants/appConstants'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Step1 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
    	errorMsg: null,
    	simulatorLicense: null
    }
    
    this._onCLStoreChange = this._onCLStoreChange.bind(this);

  };

  // Add change listeners to stores
  componentDidMount() {
  	CL_Store.addChangeListener( this._onCLStoreChange );
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CL_Store.removeChangeListener( this._onCLStoreChange );
  }
  
  _onCLStoreChange(event) {
  	if (event.type === appConstants.LICENSE_SCANNED_LOGIN) {
  		if (event.status === 'ok') {
  			this.setState({
  				errorMsg: null
  			});
  		} else {
  			this.setState({
  				errorMsg: 'There was a problem scanning your license, please try again.'
  			});
  		}
  	}
  }
  
  selectSimulatorLicense(who, e) {
  	this.setState({
  		simulatorLicense: who
  	});
  }
  
  startLicenseScan() {
  	if (this.props.testing && !this.state.simulatorLicense) {
  		return alert('TESTING: Please choose a customer license from the orange buttons.');
  	}
  	CL_Actions.scanLicense(this.props.loginToken, this.state.simulatorLicense);
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Scan your ID</h2>
			  <p>Put your driver's license on the scanner to the left, press below to scan</p>
			  <_E.Button type="primary" onClick={this.startLicenseScan.bind(this)}>Start Scan</_E.Button>
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
			  <h4 style={{fontWeight: 'normal'}}>SIMULATOR: choose a customer license:</h4>
			  <_E.Row style={{marginBottom: '1em'}}>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorLicense.bind(this, 'KrisKhan')}>Kris Khan</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorLicense.bind(this, 'MaryJaneSmith')}>Mary Jane Smith</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorLicense.bind(this, 'BuddyGalore')}>Buddy Galore</_E.Button>
				</_E.Col>
			  </_E.Row>
			  <p style={{fontSize: '0.75em'}}>Picked: {this.state.simulatorLicense || 'none yet'}, login token: <strong>{this.props.loginToken}</strong></p>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default Step1
