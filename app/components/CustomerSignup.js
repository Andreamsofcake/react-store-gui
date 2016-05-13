import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'

import CS_Actions from '../actions/CustomerSignupActions'
import CS_Store from '../stores/CustomerStore'

import Step1 from './CustomerSignup/Step1'
import Step2 from './CustomerSignup/Step2'
import Step3 from './CustomerSignup/Step3'
import Step4 from './CustomerSignup/Step4'
import Step5 from './CustomerSignup/Step5'
import AdminVerify from './CustomerSignup/AdminVerify'
import Registering from './CustomerSignup/Registering'

import appConstants from '../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../utils'

import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CustomerSignup');

class CustomerSignup extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'CustomerSignup');
    this.state = {
    	params: this.props.params,
    	signupToken: null
    }

    this._onCSStoreChange = this._onCSStoreChange.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
  };

  // Add change listeners to stores
  componentDidMount() {
  	CS_Store.addChangeListener( this._onCSStoreChange );
  	// reset the signup token on mount, should take care of retries, timeouts, etc
  	this.setState({
  		signupToken: uniq()
  	});
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CS_Store.removeChangeListener( this._onCSStoreChange );
  	CS_Actions.clearSteps();
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

  _onCSStoreChange(event) {
	startGeneralIdleTimer(this.props.location.pathname);
  	switch (event.type) {
  		case appConstants.LICENSE_SCANNED_SIGNUP:
  		case appConstants.PRINT_1SCANNED_SIGNUP:
  		case appConstants.PRINT_2SCANNED_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				browserHistory.push('/CustomerSignup/Step2');
			}
  			break;
/*
  		case appConstants.PRINT_SCANNED_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				browserHistory.push('/CustomerSignup/Step3');
			}
  			break;
*/
  		case appConstants.PRINT_3SCANNED_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				browserHistory.push('/CustomerSignup/Step3');
			}
  			break;

  		case appConstants.PHOTO_TAKEN_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				browserHistory.push('/CustomerSignup/Step4');
			}
  			break;

  		case appConstants.MOBILE_NUMBER_CAPTURED_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				browserHistory.push('/CustomerSignup/Step5');
			}
  			break;

  		case appConstants.EMAIL_CAPTURED_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				/*
				if (unattendedAdminMode) {
					return browserHistory.push('/CustomerSignup/Registering');
				}
				*/
				browserHistory.push('/CustomerSignup/AdminVerify');
			}
  			break;

  		case appConstants.ADMIN_VERIFIED_SIGNUP:
			if (event.status === 'ok') {
				// go to next signup step:
				browserHistory.push('/CustomerSignup/Registering');
			}
  			break;

  		case appConstants.CUSTOMER_REGISTERED_SIGNUP:
			if (event.status === 'ok') {
				// yay we are logged in!
				let customer = CS_Store.getCustomer();
				if (customer) {
					// FIXME: calling this action in sequence results in Invariant Violation: Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.
					// moved to componentWillUnmount:
					/*
					setTimeout(() => {
						CS_Actions.clearSteps();
					}, 100);
					*/
					return browserHistory.push('/Storefront');
				}
			}
			browserHistory.push('/CustomerSignup/FAIL');
  			break;
  	}
  }
  
  tryAgain() {
  	//CS_Actions.customerLogout();
  	CS_Actions.clearSteps();
  	browserHistory.push('/CustomerSignup/Step1');
  }
  
  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Customer Signup</h2>
			  <p>Before you can pick products and check out, we need to know who you are. :-)</p>
			</_E.Col>
		  </_E.Row>
		  <_E.Row >
			<_E.Col>
			  {this.renderStep()}
			</_E.Col>
		  </_E.Row>
		  {this.renderLogin()}
    	</div>
    );
  }
  
  renderLogin() {
  	if (this.state.params.step !== 'Registering') {
  		return (
		  <_E.Row >
			<_E.Col>
				<h3>Already signed up? Go back to the signup page</h3>
				<_E.Button type="primary" component={(<Link to="/CustomerLogin">{Translate.translate('Customer','LoginButtonText')}</Link>)} />
				{' '}
				<_E.Button type="success" component={(<Link to="/Storefront">{Translate.translate('ShoppingCart','Shop_More')}</Link>)} />
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
	  				<_E.Alert type="danger">Sorry, there was a problem registering your account.</_E.Alert>
	  				<p>&nbsp;</p>
					<_E.Button type="primary" onClick={this.tryAgain}>{Translate.translate('Customer','TryAgainButtonText')}</_E.Button>
					{this.renderSimulator()}
	  			</div>
  			);
  			break;
  		
  		case 'Registering':
		  	WhatStep = Registering;
  			break;

  		case 'AdminVerify': // ADMIN thumb (unless "unattended admin" mode)
		  	WhatStep = AdminVerify;
  			break;

  		case 'Step5': // email
		  	WhatStep = Step5;
  			break;

  		case 'Step4': // mobile
		  	WhatStep = Step4;
  			break;

  		case 'Step3': // photo
		  	WhatStep = Step3;
  			break;

  		case 'Step2': // thumb scan
		  	WhatStep = Step2;
  			break;

  		case 'Step1': // license
  		default:
		  	WhatStep = Step1;
  			break;
  	}

  	if (WhatStep) {
  		return (
  			<WhatStep
  				signupToken={this.state.signupToken}
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
			  <p style={{fontSize: '0.75em'}}>signup token: <strong>{this.props.signupToken}</strong></p>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default CustomerSignup
