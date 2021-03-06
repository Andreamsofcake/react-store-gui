import React, { Component } from 'react'

import CustomerActions from '../../actions/CustomerActions' // for logout() call
import CustomerStore from '../../stores/CustomerStore'
import TsvStore from '../../stores/TsvStore' // for retrieving machine config
import SessionActions from '../../actions/SessionActions'
import SessionStore from '../../stores/SessionStore'

import CardMatch from '../Biometrics/MembershipCardMatch'
import PrintMatchAdmin from '../Biometrics/AdminPrintMatch'
import PrintRegister from '../Biometrics/PrintRegister'
import MembershipRegister from './MembershipRegister'

import appConstants from '../../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../../utils'

import {
	GuiTimer,
	KillGuiTimer
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Customer_MembershipRegister');

class Customer_MembershipRegister extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({
			matchedUser: this.props.matchedUser,
			machineInfo: TsvStore.getMachineInfo()
		});

		this.cardMatchCallback = this.cardMatchCallback.bind(this);
		this._onCLStoreChange = this._onCLStoreChange.bind(this);
		this.tryAgain = this.tryAgain.bind(this);
	}
	
	getDefaultState(obj) {
		let def = {
			machineInfo: TsvStore.getMachineInfo(),
			matchedUser: null,
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
			loadCustomerCheckFailed: false,
			registrationInProcess: false,
			registrationFinished: false,
			loadingUser: false,
			registerCancelled: false
		}
		if (obj && typeof obj === 'object') {
			Object.keys(obj).forEach( K => { def[K] = obj[K] } );
		}
		return def;
	}

	// Add change listeners to stores
	componentDidMount() {
		CustomerStore.addChangeListener( this._onCLStoreChange );
		//CustomerActions.customerLogout(); // make sure we dump any session!
		if (!SessionStore.getCurrentSession()) {
			SessionActions.createSession(); // make a new one! << createSession() will also customerLogout()
		}
		let state = this.setupMatchedUserData();
		this.setState( this.getDefaultState(state) );
		GuiTimer();
	}
	
	setupMatchedUserData() {
		var obj = {};
		if (this.state.matchedUser && this.state.machineInfo && !this.state.membership_id) {
			let matched = this.state.matchedUser.client_membership_ids.filter( X => { return X.client == this.state.machineInfo.client });
			if (matched && matched.length) {
				obj.membership_id = matched[0].id;
			}
			obj.matchedUser = this.state.matchedUser;
		}
		return obj;
	}

	// Remove change listers from stores
	componentWillUnmount() {
		CustomerStore.removeChangeListener( this._onCLStoreChange );
	}

	componentWillReceiveProps(nextProps) {
		/*
		//Big.log('componentWillReceiveProps(nextProps)');
		//Big.log(nextProps);
		if (nextProps.session) {
			this.setState({
				session: nextProps.session
			});	
		}
		*/
	}
	
	tryAgain() {
		let state = this.setupMatchedUserData();
		this.setState( this.getDefaultState(state) );
	}
	
	cancel() {
		browserHistory.push('/Storefront');
	}

	adminPrintMatchCallback(beginOrEnd, matched, responses, user) {
		GuiTimer();
		let state = this.state;
		switch (beginOrEnd) {
			case 'begin':
				if (matched) {
					state.adminBeginMatched = true;
				} else {
					state.adminBeginMatched = false
					state.adminBeginResponses = responses;
				}
				this.setState(state);
				break;

			case 'end':
				Big.warn('adminPrintMatchCallback END');
				if (matched) {
					Big.log('admin matched! lettuce check for customer load. matched admin user details:');
					Big.log(user);
					state.isUserVerified = true;
					state.adminEndMatched = true;
					state.adminEndUser = user;
					this.checkForCustomerLoad(state);
				} else {
					state.adminEndMatched = false;
					state.adminEndResponses = responses;
					this.setState(state);
				}
				break;
		}
	}

	_onCLStoreChange(event) {
		GuiTimer();
		switch (event.type) {
			case appConstants.CUSTOMER_VERIFIED_AND_LOADED:
				if (event.status === 'ok') {
					Big.warn(appConstants.CUSTOMER_VERIFIED_AND_LOADED + ': customer then credit');
					Big.log(CustomerStore.getCustomer());
					Big.log(CustomerStore.getCustomerCredit());
					//browserHistory.push('/Storefront');
					this.setState({
						loadingUser: false,
						registrationFinished: true
					});
					SessionActions.addUserToSession();
				}
				break;
			case appConstants.CUSTOMER_REGISTRATION_CANCELLED:
				if (event.status === 'ok') {
					browserHistory.push('/PageIdle');
					/*
					this.setState({
						loadingUser: false,
						registrationFinished: true
					});
					*/
				}
				break;
		}
	}
  
	checkForCustomerLoad(state) {
		GuiTimer();
		if (state.isUserVerified && state.membership_id && state.adminEndMatched) {
			Big.warn('checkForCustomerLoad ... load the user!');
			state.loadingUser = true;
			CustomerActions.adminVerifyAndLoadCustomerByMembershipId(this.state.matchedUser, this.state.adminEndUser, this.state.membership_id);
		} else {
			state.loadingUser = false;
			state.loadCustomerCheckFailed = true;
			Big.warn('checkForCustomerLoad ... DO NOT load the user????');
		}
		this.setState(state);
	}

	cardMatchCallback(result, api, matchedUser, membership_id) {
		GuiTimer();
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
	
	cancelRegistration() {
		this.setState({
			registerCancelled: true
		});
		SessionActions.closeSession( { ts: Date.now(), msg: 'customer cancelled registration' }, appConstants.CUSTOMER_REGISTRATION_CANCELLED );
	}

	render() {

		if (this.state.registerCancelled) {
			return (
				<div style={{maxWidth:'60%',margin: '10em auto 1em', textAlign: 'center'}}>
					<h1 className="mainHeaderText">One Moment Please....</h1>
					<div><_E.Spinner size="lg" /></div>
				</div>
			);
		}
		
		if (!this.state.machineInfo) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">Loading machine info, one moment please...</h1>
					<_E.Spinner size="lg" />
				</div>
			);
		}
		
		if (!this.state.matchedUser) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">Please swipe your membership card to get started.</h1>
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
		
		if (!this.state.adminBeginMatched) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">Hello, {this.state.matchedUser.firstname}!
						<br />Let's get your biometrics registered properly.</h1>
					<h3>OK before we get started, let's verify an admin is with you.</h3>
					<PrintMatchAdmin
						token={this.state.token}
						matchCallback={this.adminPrintMatchCallback.bind(this, 'begin')}
						/>
				</div>
			);
					//<p>state: {this.state.matchedUser ? 'matchedUser present.' : 'NO PRE-MATCHED USER???'}</p>
					//<p>props: {this.props.matchedUser ? 'matchedUser present.' : 'NO PRE-MATCHED USER???'}</p>
		}

		if (!this.state.printRegistered1 || !this.state.printRegistered2 || !this.state.printRegistered3) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">Let's record your finger prints. This is finger (or thumb) #{this.state.numPrintsCaptured + 1}.</h1>
					{this.renderCapturePrint()}
				</div>
			);
		}
		
		if (!this.state.adminEndMatched) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">OK we're done recording your prints, let's verify an admin is still with you.</h1>
					<PrintMatchAdmin
						token={this.state.token}
						autostart={false}
						matchCallback={this.adminPrintMatchCallback.bind(this, 'end')}
						/>
				</div>
			);
		}
		
		if (this.state.loadingUser) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">Processing your registration, one moment please...</h1>
				</div>
			);
		}

		if (this.state.registrationFinished) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">All done!</h1>
					<h3>Your registration is complete</h3>
					<p><_E.Button type="success" size="lg" component={(<Link to="/Storefront">Let's go Shopping!</Link>)} /></p>
				</div>
			);
		}

		// should never ever get here.... but just in case!
		// (well, maybe, if by chance a known user accidentally manages to load MembershipRegister
		if (!this.state.loadCustomerCheckFailed && this.state.matchedUser && this.state.isUserVerified) {
			return (
				<div style={{textAlign: 'center', maxWidth:'60%', margin: '6em auto 1em'}}>
					<h1 className="mainHeaderText">You're already registered!</h1>
					<h3>It appears you have already completed this process and you can access the store.</h3>
					<p><_E.Button type="success" size="lg" component={(<Link to="/Storefront">Let's go Shopping!</Link>)} /></p>
					<pre style={{fontSize: '0.85em'}}>
					{JSON.stringify(this.state, null, 4)}
					</pre>
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

4. CustomerActions.loadCustomerByMembershipId()

*/

	}
	
	// this allows for a partial registration to return to finish...
	// each "captured" print that is already registered will just skip to the next step
	printAlreadyRegistered(result) {
		GuiTimer();
		if (result) {
			let state = this.state;
			state.registrationInProcess = false;
			state.numPrintsCaptured += 1;
			state['printRegistered' + state.numPrintsCaptured] = true;
			this.setState(state);
		} else {
			Big.warn('got a printAlreadyRegistered callback with false result. logic error.');
		}
	}

/**** below here, methods imported from Admin/PrintRegistration *****/

	printRegistrationFinished(sequence, apiResponses) {
		Big.log('printRegistrationFinished, sequence: ' + sequence);
		Big.log(apiResponses);
		GuiTimer();
		let state = this.state;
		state.registrationInProcess = false;
		state.numPrintsCaptured += 1;
		state['printRegistered' + state.numPrintsCaptured] = true;
		//state['printRegistered' + sequence] = true;
		//state.loadingUser = false;
		//this.checkForCustomerLoad(state);
		this.setState(state);
	}

	renderCapturePrint() {
		
		return (
			<div style={{marginTop: '2em'}}>
			
				<p style={{fontSize: '1.35em'}}>Press the <strong>"Start"</strong> button when you are ready to scan your fingerprint.</p>
				<p style={{fontSize: '1.35em'}}>Click the <strong>"Cancel"</strong> button to cancel registration.</p>
			
				<div>

					{!this.state.registrationInProcess ? (
						<_E.Button size="lg" type="primary" onClick={this.startRegisterPrint.bind(this)}>Start</_E.Button>
					) : (<span style={{fontSize: '1.35em'}}>Print registration in process ... </span>)}

					{' '}

					{!this.state.registrationIsFinished ? (
						<_E.Button size="lg" type="danger" onClick={this.cancel.bind(this)}><_E.Glyph icon="circle-slash" />Cancel</_E.Button>
					) : null}

				</div>
				
				{this.renderScanRoot()}
			
			</div>
		);
	}
	
	// this extra function allows hiding of BiometricsPrintRegister until "start" is pressed each time.
	renderScanRoot() {
		if (!this.state.registrationInProcess) {
			return null;
		}
		
		return (
			<PrintRegister
				user={this.state.matchedUser}
				token={this.state.token}
				registrationCallback={this.printRegistrationFinished.bind(this, this.state.numPrintsCaptured + 1)}
				alreadyRegisteredCallback={this.printAlreadyRegistered.bind(this)}
				location={this.props.location}
				/>
		);
	}
	
	startRegisterPrint() {
		GuiTimer();
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
