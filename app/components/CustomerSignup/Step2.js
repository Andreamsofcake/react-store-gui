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

import Log from '../../utils/BigLogger'
var Big = new Log('SignupStep2');

class Step extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
    	errorMsg: null,
    	simulatorPrint: null,
    	completedSteps: []
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
  	var scanEvents = [appConstants.PRINT_1SCANNED_SIGNUP, appConstants.PRINT_2SCANNED_SIGNUP, appConstants.PRINT_3SCANNED_SIGNUP];
  	if (scanEvents.indexOf(event.type) > -1) {
		var state = {
			completedSteps: CS_Store.getStepsCompleted('signup')
		};
		this.setState(state);
		/*
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
		*/
	} else {
		Big.error('HAY not a known event???');
		Big.log(event);
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
  	
  	var whichPrint = 1
  		, cs = this.state.completedSteps
  		;
  	if (cs && cs.length) {
  		if (cs.indexOf( appConstants.PRINT_3SCANNED_SIGNUP ) > -1) {
  			whichPrint = 4;
  		} else if (cs.indexOf( appConstants.PRINT_2SCANNED_SIGNUP ) > -1) {
  			whichPrint = 3;
  		} else if (cs.indexOf( appConstants.PRINT_1SCANNED_SIGNUP ) > -1) {
  			whichPrint = 2;
  		}
  	}
  	
  	if (whichPrint < 4) {
	  	CS_Actions.scanPrint(this.props.signupToken, whichPrint, this.state.simulatorPrint);
	}
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Scan your finger or thumb print</h2>
			  <p>We need to take three scans of your finger or thumb.</p>
			  <_E.Row>
			  	<_E.Col sm="33%" md="33%" lg="33%">
			  	{this.renderThumb(1)}
			  	</_E.Col>
			  	<_E.Col sm="33%" md="33%" lg="33%">
			  	{this.renderThumb(2)}
			  	</_E.Col>
			  	<_E.Col sm="33%" md="33%" lg="33%">
			  	{this.renderThumb(3)}
			  	</_E.Col>
			  </_E.Row>
			  <_E.Alert type="info">Use the same finger or thumb for each scan.</_E.Alert>
			  <_E.Button type="warning" onClick={this.startPrintScan.bind(this)}>TESTING: Press to "record" the scan, this will happen automatically when hardware is attached.</_E.Button>
			</_E.Col>
		  </_E.Row>
		  {this.renderSimulator()}
		</div>
    );
  }
  
  renderThumb(whichOne) {
  	var checkConstant = appConstants['PRINT_'+whichOne+'SCANNED_SIGNUP']
  		, cs = this.state.completedSteps
  		, RESULT
  		;
  	if (cs && cs.length && cs.indexOf(checkConstant) > -1) {
  		RESULT = (
  			<div>
	  			<_E.Button type="success"><_E.Glyph icon="check" /></_E.Button>
	  			<span style={{display:'block'}}>Complete!</span>
	  		</div>
  		);
  	} else {
  		RESULT = (
  			<div>
	  			<_E.Button type="danger"><_E.Glyph icon="issue-opened" /></_E.Button>
	  			<span style={{display:'block'}}>Not scanned</span>
	  		</div>
  		);
  	}
  	return (
  		<div style={{textAlign:'center'}}>
  			{RESULT}
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
			  <pre style={{fontSize: '0.75em'}}>{ JSON.stringify(this.state.completedSteps) }</pre>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default Step
