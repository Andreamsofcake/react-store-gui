import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'

import CL_Actions from '../actions/CustomerLoginActions'
import CL_Store from '../stores/CustomerStore'

import A_Actions from '../actions/AdminActions'
import A_Store from '../stores/AdminStore'

import Step1 from './CustomerLogin/Step1'
import Step2 from './CustomerLogin/Step2'
import Matching from './CustomerLogin/Matching'

import appConstants from '../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../utils'

import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CustomerLoginTESTER');

class CustomerLoginTest extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //TsvSettingsStore.setSession('currentView', 'CustomerLogin');
    this.state = {
    	params: this.props.params,
    	loginToken: null
    }

    this._onAStoreChange = this._onAStoreChange.bind(this);
    this._onCLStoreChange = this._onCLStoreChange.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
    this.loadTestCustomer = this.loadTestCustomer.bind(this);
  };

  // Add change listeners to stores
  componentDidMount() {
  	CL_Store.addChangeListener( this._onCLStoreChange );
  	A_Store.addChangeListener( this._onAStoreChange );
  	A_Actions.getTestCustomers();
  	CL_Actions.clearSteps();
  	// reset the login token on mount, should take care of retries, timeouts, etc
  	this.setState({
  		loginToken: uniq()
  	});
	startGeneralIdleTimer(this.props.location.pathname);

  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CL_Store.removeChangeListener( this._onCLStoreChange );
  	A_Store.removeChangeListener( this._onAStoreChange );
  	// causing invariant error (dispatch problem)...
  	// moving to componentDidMount()
  	//CL_Actions.clearSteps();
  }
  
  componentWillReceiveProps(nextProps) {
  	Big.log('componentWillReceiveProps(nextProps)');
  	Big.log(nextProps);
  	if (nextProps.params) {
  		this.setState({
  			params: nextProps.params
  		});	
  	}
  }

  _onAStoreChange(event) {
	startGeneralIdleTimer(this.props.location.pathname);
  	switch (event.type) {
  		case appConstants.TEST_CUSTOMERS_RECEIVED:
  			this.setState({
  				testCustomers: A_Store.getTestCustomers()
  			});
  			CL_Actions.membershipCardSwipe(this.state.loginToken);
  			break;
  	}
  }

  loadTestCustomer(C, e) {
  	if (e) e.preventDefault();
  	CL_Actions.loadCustomerByMembershipId(C.membership_id);
  }
  
  _onCLStoreChange(event) {
	startGeneralIdleTimer(this.props.location.pathname);
  	switch (event.type) {
  		case appConstants.CUSTOMER_LOADED:
			if (event.status === 'ok') {
				console.warn(appConstants.CUSTOMER_LOADED + ': customer then credit');
				console.log(CL_Store.getCustomer());
				console.log(CL_Store.getCustomerCredit());
				browserHistory.push('/Storefront');
			}
  			break;
  		
  		case appConstants.MEMBERSHIP_CARD_SCANNED_LOGIN:
  			if (event.membership_id) { // eventually check for loginToken? maybe not needed
  				this.loadTestCustomer({ membership_id: event.membership_id });
  			}
  			break;

  		case appConstants.LICENSE_SCANNED_LOGIN:
			if (event.status === 'ok') {
				// go to next login step:
				browserHistory.push('/CustomerLogin/Step2');
			}
  			break;

  		case appConstants.PRINT_SCANNED_LOGIN:
			if (event.status === 'ok') {
				// go to next login step:
				browserHistory.push('/CustomerLogin/Matching');
			}
  			break;

  		case appConstants.CUSTOMER_MATCHED_LOGIN:
			if (event.status === 'ok') {
				// yay we are logged in!
				let customer = CL_Store.getCustomer();
				if (customer) {
					// FIXME: calling this action in sequence results in Invariant Violation: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.
					// moved to componentWillUnmount:
					/*
					setTimeout(() => {
						CL_Actions.clearSteps();
					}, 100);
					*/
					return browserHistory.push('/Storefront');
				}
			}
			browserHistory.push('/CustomerLogin/FAIL');
  			break;
  	}
  }
  
  tryAgain() {
  	CL_Actions.customerLogout();
  	browserHistory.push('/CustomerLogin/Step1');
  }
  
  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>TEST Customer Login</h2>
			  <p>This module is for quick testing of the system while we're finishing support for the membership cards.</p>
			  <p>Choose a customer below to shop with.</p>
			  <p><strong>Don't worry, this will ONLY be here when the machine is in test mode!</strong></p>
			</_E.Col>
		  </_E.Row>
		  <_E.Row >
			<_E.Col>
			  {this.renderTestCustomers()}
			</_E.Col>
		  </_E.Row>
    	</div>
    );
  }
  
  renderTestCustomers() {
	if (this.state.testCustomers) {
		return (
		  <_E.Row >
			<_E.Col>
				{this.state.testCustomers.map( (C, idx) => {
					return (
						<div key={idx} style={{margin:'1em auto'}}>
							<_E.Button type="primary" onClick={this.loadTestCustomer.bind(this, C)}>{C.firstname}</_E.Button>
						</div>
					);
				})}
			</_E.Col>
		  </_E.Row>
		);
	}
	return (
	  <_E.Row >
		<_E.Col>
			<h3>Loading test customers, one moment please...</h3>
		</_E.Col>
	  </_E.Row>
  	);
  }
  
  renderStep() {

  	let WhatStep;

  	switch (this.state.params.step) {
  		
  		case 'FAIL':
  			return (
  				<div>
	  				<_E.Alert type="danger">Sorry, we couldn't find your account.</_E.Alert>
	  				<p>&nbsp;</p>
					<_E.Button type="primary" onClick={this.tryAgain}>{Translate.translate('Customer','TryAgainButtonText')}</_E.Button>
					{this.renderSimulator()}
	  			</div>
  			);
  			break;
  		
  		case 'Matching':
		  	WhatStep = Matching;
  			break;

  		case 'Step2': // finger / thumb print scan
		  	WhatStep = Step2;
  			break;

  		case 'Step1': // ID scan
  		default:
		  	WhatStep = Step1;
  			break;
  	}

  	if (WhatStep) {
  		return (
  			<WhatStep
  				loginToken={this.state.loginToken}
  				testing={this.props.appTesting}
  				/>
  		);
  	}

  	Big.warn('renderStep() ... unknown step requested: ' + this.state.params.step);
  	return null;
  }

  renderSimulator() {
  	if (this.props.appTesting) {
  		return (
		  <_E.Row style={{ border: '1px solid #666', borderRadius: '4px', backgroundColor: '#ccc', maxWidth: '85%', margin: '3em auto', paddingTop: '0.4em' }}>
			<_E.Col>
			  <h4 style={{fontWeight: 'normal'}}>SIMULATOR</h4>
			  <p style={{fontSize: '0.75em'}}>login token: <strong>{this.props.loginToken}</strong></p>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default CustomerLoginTest
