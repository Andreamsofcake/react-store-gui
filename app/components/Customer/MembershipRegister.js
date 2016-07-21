import React, { Component } from 'react'

import CL_Actions from '../../actions/CustomerLoginActions' // for logout() call
import CL_Store from '../../stores/CustomerStore'
import TsvStore from '../../stores/TsvStore' // for retrieving machine config

import CardMatch from '../Biometrics/MembershipCardMatch'
import PrintMatch from '../Biometrics/PrintMatch'
import PrintRegister from '../Biometrics/PrintRegister'
import MembershipRegister from './MembershipRegister'

import appConstants from '../../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../../utils'

import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Customer_MembershipRegister');

import PrintMatchAdmin from '../Biometrics/AdminPrintMatch'

class Customer_MembershipRegister extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({
			matchedUser: this.props.matchedUser,
			machineInfo: TsvStore.getMachineInfo()
		});

		this.printMatchCallback = this.printMatchCallback.bind(this);
		this.cardMatchCallback = this.cardMatchCallback.bind(this);
		this._onCLStoreChange = this._onCLStoreChange.bind(this);
		this.tryAgain = this.tryAgain.bind(this);
	}
	
	getDefaultState(obj) {
		let def = {
			adminBeginMatched: false,
			adminEndMatched: false,
			adminBeginResponses: [],
			adminEndResponses: [],
			adminEndUser: null,
			isUserVerified: false,
			token: uniq(),
			matchedUser: null,
			membership_id: null,
			printRegistered1: false,
			printRegistered2: false,
			printRegistered3: false,
			numPrintsCaptured: 0,
			registrationInProcess: false,
			registrationFinished: false,
			//isPrintVerified: false,
			//isUserVerified: false,
			loadingUser: false
		}
		if (obj && typeof obj === 'object') {
			Object.keys(obj).forEach( K => { def[K] = obj[K] } );
		}
		return def;
	}

	// Add change listeners to stores
	componentDidMount() {
		//CL_Store.addChangeListener( this._onCLStoreChange );
		//CL_Actions.customerLogout(); // make sure we dump any session!
		let state = this.setupMatchedUserData();
		this.setState( this.getDefaultState(state) );
		startGeneralIdleTimer(this.props.location.pathname);
	}
	
	setupMatchedUserData() {
		var obj = {};
		if (this.state.matchedUser && this.state.machineInfo && !this.state.membership_id) {
			let matched = this.state.matchedUser.client_membership_ids.filter( X => { return X.client == this.state.machineInfo.client });
			if (matched && matched.length) {
				obj.membership_id = matched[0].id;
			}
		}
		return obj;
	}

	// Remove change listers from stores
	componentWillUnmount() {
		//CL_Store.removeChangeListener( this._onCLStoreChange );
	}

	componentWillReceiveProps(nextProps) {
		/*
		Big.log('componentWillReceiveProps(nextProps)');
		Big.log(nextProps);
		if (nextProps.params) {
			this.setState({
				params: nextProps.params
			});	
		}
		*/
	}
	
	tryAgain() {
		let state = this.setupMatchedUserData();
		this.setState( this.getDefaultState(state) );
	}

	adminPrintMatchCallback(beginOrEnd, matched, responses, user) {
		switch (beginOrEnd) {
			case 'begin':
				if (matched) {
					this.setState({
						adminBeginMatched: true
					});
				} else {
					this.setState({
						adminBeginMatched: false,
						adminBeginResponses: responses
					});
				}
				break;

			case 'end':
				if (matched) {
					let state = this.state;
					state.isUserVerified = true;
					state.adminEndMatched = true;
					state.adminEndUser = user;
					this.checkForCustomerLoad(state);
				} else {
					this.setState({
						adminEndMatched: false,
						adminEndResponses: responses
					});
				}
				break;
		}
	}

	_onCLStoreChange(event) {
		startGeneralIdleTimer(this.props.location.pathname);
		switch (event.type) {
			case appConstants.CUSTOMER_VERIFIED_AND_LOADED:
				if (event.status === 'ok') {
					//console.warn(appConstants.CUSTOMER_LOADED + ': customer then credit');
					//console.log(CL_Store.getCustomer());
					//console.log(CL_Store.getCustomerCredit());
					//browserHistory.push('/Storefront');
					this.setState({
						loadingUser: false,
						registrationFinished: true
					});
				}
				break;
		}
	}
  
	checkForCustomerLoad(state) {
		if (state.isUserVerified && state.isPrintVerified && state.membership_id) {
			state.loadingUser = true;
			CL_Actions.adminVerifyAndLoadCustomerByMembershipId(this.state.matchedUser, this.state.adminEndUser, this.state.membership_id);
		}
		this.setState(state);
	}

	cardMatchCallback(result, api, matchedUser, membership_id) {
		Big.log('cardMatchCallback');
		Big.log({result, api, matchedUser, membership_id});
		if (result) {
			
			let client = TsvStore.getMachineInfo().client;
			
			if (client) {
				
				let state = this.state;
				state.isUserVerified = matchedUser.client_verifications.filter( CV => { return CV.client == client } );
				state.matchedUser = matchedUser;
				state.membership_id = membership_id;
				state.loadingUser = false;

				state.isUserVerified = state.isUserVerified && state.isUserVerified.length ? true : false;
				
				this.setState(state);

			} else {
				// serious issue! not sure what to do.
				Big.error('uh, no client????? machine info:');
				Big.log( TsvStore.getMachineInfo() );
			}
		} else {
			// non-recognized card, or membership with a different client (or clients)!
		}
	}
	
	render() {

		if (!this.state.machineInfo) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>Loading machine info, one moment please...</h1>
					<_E.Spinner size="lg" />
				</div>
			);
		}
		
		if (!this.state.adminBeginMatched) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>OK before we get started, let's verify an admin is with you.</h1>
					<PrintMatchAdmin
						token={this.state.token}
						matchCallback={this.adminPrintMatchCallback.bind(this, 'begin')}
						/>
				</div>
			);
		}

		if (!this.state.matchedUser) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>Please swipe your membership card to get started.</h1>
					  <CardMatch
						autostart={true}
						canRetry={true}
						showMessages={true}
						token={this.state.token}
						matchCallback={this.cardMatchCallback.bind(this)}
						/>
				</div>
			);
		}
		
		// should never ever get here.... but just in case!
		// (well, maybe, if by chance a known user accidentally manages to load MembershipRegister
		if (this.state.matchedUser && this.state.isUserVerified) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>You're already registered!</h1>
					<h3>It appears you have already completed this process and you can access the store.</h3>
					<p><_E.Button type="success" size="lg" component={(<Link to="/Storefront">Let's go Shopping!</Link>)} /></p>
				</div>
			);
		}
		
		if (!this.state.printRegistered1 || !this.state.printRegistered2 || !this.state.printRegistered3) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>Let's record your finger prints. This is finger (or thumb) #{this.state.numPrintsCaptured + 1}.</h1>
					{this.renderScanRoot()}
				</div>
			);
		}
		
		if (!this.state.adminEndMatched) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>OK we're done recording your prints, let's verify an admin is still with you.</h1>
					<PrintMatchAdmin
						token={this.state.token}
						matchCallback={this.adminPrintMatchCallback.bind(this, 'end')}
						/>
				</div>
			);
		}
		
		if (this.state.loadingUser) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>Processing your registration, one moment please...</h1>
				</div>
			);
		}

		if (this.state.registrationFinished) {
			return (
				<div style={{textAlign: 'center'}}>
					<h1>All done!</h1>
					<h3>Your registration is complete</h3>
					<p><_E.Button type="success" size="lg" component={(<Link to="/Storefront">Let's go Shopping!</Link>)} /></p>
				</div>
			);
		}

		return (
			<div>
				<p>something funny happened, we should not get to here!</p>
				<pre>{JSON.stringify(this.state.matchedUser, null, 4)}</pre>
			</div>
		);

/*

0. verify props.matchedUser

1. get admin verification up front? (will for now) ... this is just to make sure an admin is here before we start attaching biometrics to a person

2. capture prints 3x for the props.matchedUser
2a. after first captured print, make sure to /matchprint on 2 + 3 to force different fingers

3. get admin verification to close and finish

4. CL_Actions.loadCustomerByMembershipId()

*/

	}

/**** below here, methods imported from Admin/PrintRegistration *****/

	printRegistrationFinished(sequence, apiResponses) {
		let state = this.state;
		state['printRegistered'+sequence] = true;
		state.numPrintsCaptured += 1;
		//state.loadingUser = false;
		//this.checkForCustomerLoad(state);
		this.setState(state);
	}

	renderCapturePrint() {
		
		return (
			<div style={{marginTop: '2em'}}>
			
				<p style={{fontSize: '1.35em'}}>Press the <strong>"Start"</strong> button when you are ready to begin.</p>
				<p style={{fontSize: '1.35em'}}>Click the <strong>"Cancel"</strong> button to cancel and return to the employee list.</p>
			
				<div>

					{!this.state.registrationInProcess ? (
						<_E.Button size="lg" type="primary" onClick={this.startRegisterPrint.bind(this)}>Start</_E.Button>
					) : (<span style={{fontSize: '1.35em'}}>Print registration in process ... </span>)}

					{' '}

					{!this.state.registrationIsFinished ? (
						<_E.Button size="lg" type="danger" onClick={this.reset.bind(this)}><_E.Glyph icon="circle-slash" />Cancel</_E.Button>
					) : (
						<_E.Button size="lg" type="primary" onClick={this.reset.bind(this)}>Home</_E.Button>
					)}

				</div>
				
				{this.renderScanRoot()}
			
			</div>
		);
	}
	
	renderScanRoot() {
		if (!this.state.registrationInProcess) {
			return null;
		}
		
		return (
			<BiometricsPrintRegister
				user={this.state.matchedUser}
				token={this.state.token}
				registrationCallback={this.printRegistrationFinished.bind(this, this.state.numPrintsCaptured + 1)}
				/>
		);
	}
	
	startRegisterPrint() {
		this.setState({
			registrationInProcess: true,
			scanInProcess: false,
			error_msg: '',
			status_msg: 'Start print registration process....',
			num_scans: 0
		});
	}


}

export default Customer_MembershipRegister
