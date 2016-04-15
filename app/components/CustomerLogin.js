import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'

import CL_Actions from '../actions/CustomerLoginActions'
import CL_Store from '../stores/CustomerStore'

import Step1 from './CustomerLogin/Step1'
import Step2 from './CustomerLogin/Step2'
import Matching from './CustomerLogin/Matching'

import appConstants from '../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../utils'

class Customer_Login extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'Customer_Login');
    this.state = {
    	params: this.props.params,
    	loginToken: null
    }

    this._onCLStoreChange = this._onCLStoreChange.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
  };

  // Add change listeners to stores
  componentDidMount() {
  	CL_Store.addChangeListener( this._onCLStoreChange );
  	// reset the login token on mount, should take care of retries, timeouts, etc
  	this.setState({
  		loginToken: uniq()
  	});
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CL_Store.removeChangeListener( this._onCLStoreChange );
  }
  
  componentWillReceiveProps(nextProps) {
  	console.log('Customer Login componentWillReceiveProps(nextProps)');
  	console.log(nextProps);
  	if (nextProps.params) {
  		this.setState({
  			params: nextProps.params
  		});	
  	}
  }

  _onCLStoreChange(event) {
  	switch (event.type) {
  		case appConstants.LICENSE_SCANNED_LOGIN:
			if (event.status === 'ok') {
				// go to next login step:
				browserHistory.push('/Customer_Login/Step2');
			}
  			break;

  		case appConstants.PRINT_SCANNED_LOGIN:
			if (event.status === 'ok') {
				// go to next login step:
				browserHistory.push('/Customer_Login/Matching');
			}
  			break;

  		case appConstants.CUSTOMER_MATCHED_LOGIN:
			if (event.status === 'ok') {
				// yay we are logged in!
				let customer = CL_Store.getCustomer();
				if (customer) {
					// FIXME: calling this action in sequence results in Invariant Violation: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.
					setTimeout(() => {
						CL_Actions.clearSteps();
					}, 100);
					return browserHistory.push('/Storefront');
				}
			}
			browserHistory.push('/Customer_Login/FAIL');
  			break;
  	}
  }
  
  tryAgain() {
  	CL_Actions.customerLogout();
  	browserHistory.push('/Customer_Login/Step1');
  }
  
  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Customer Login</h2>
			  <p>Before you can pick products and check out, we need to know who you are. :-)</p>
			</_E.Col>
		  </_E.Row>
		  <_E.Row >
			<_E.Col>
			  {this.renderStep()}
			</_E.Col>
		  </_E.Row>
		  {this.renderSignup()}
    	</div>
    );
  }
  
  renderSignup() {
  	if (this.state.params.step !== 'Matching') {
  		return (
		  <_E.Row >
			<_E.Col>
				<h3>First time here? Let's register your account!</h3>
				<_E.Button type="primary" component={(<Link to="/Customer_Signup">{Translate.translate('Customer','SignupButtonText')}</Link>)} />
			</_E.Col>
		  </_E.Row>
  		);
  	}
  	return null;
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

  	console.warn('CustomerLogin renderStep() ... unknown step requested: ' + this.state.params.step);
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

export default Customer_Login
