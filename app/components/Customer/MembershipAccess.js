/***

general approach:

render a page with:

	[ membership card swipe status ]			[ fingerprint capture status ]

both will callback, this will be parent controller of those two independent modules

once membership card is swiped and matched to a user, and we have a fingerprint captured,
we use the user_id from matchedUser to match fingerprint (part of print match module....)

if user is not admin verified yet, walk through process to get (3) fingerprints,
plus admin user verify

if both card is matched and fingerprint is matched, then load user

***/
import React, { Component } from 'react'

import CustomerActions from '../../actions/CustomerActions' // for logout() call
import CustomerStore from '../../stores/CustomerStore'
import TsvStore from '../../stores/TsvStore' // for retrieving machine config
import SessionActions from '../../actions/SessionActions'

//import Step1 from './Customer_MembershipAccess/Step1'
//import Step2 from './Customer_MembershipAccess/Step2'
//import Matching from './Customer_MembershipAccess/Matching'

import CardMatch from '../Biometrics/MembershipCardMatch'
import PrintMatch from '../Biometrics/PrintMatch'
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
var Big = new Log('Customer_MembershipAccess');

class Customer_MembershipAccess extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState();
		
		this.printMatchCallback = this.printMatchCallback.bind(this);
		this.cardMatchCallback = this.cardMatchCallback.bind(this);
		this._onCLStoreChange = this._onCLStoreChange.bind(this);
		this.tryAgain = this.tryAgain.bind(this);
	}
	
	getDefaultState(obj) {
		let def = {
			token: uniq(),
			matchedUser: null,
			membership_id: null,
			isPrintVerified: false,
			isUserVerified: false,
			loadingUser: false,
			loginCancelled: false
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
		SessionActions.createSession(); // make a new one! << createSession() will also customerLogout()
		this.setState(this.getDefaultState());
		GuiTimer();
	}

	// Remove change listers from stores
	componentWillUnmount() {
		CustomerStore.removeChangeListener( this._onCLStoreChange );
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
	
	_onSessionStoreChange(event) {
		switch (event.type) {
			case appConstants.SESSION_CREATED:
				CustomerActions.refreshCustomer();
				break;
		}
	}

	_onCLStoreChange(event) {
		GuiTimer();
		switch (event.type) {
			case appConstants.CUSTOMER_LOADED:
				if (event.status === 'ok') {
					//console.warn(appConstants.CUSTOMER_LOADED + ': customer then credit');
					//console.log(CustomerStore.getCustomer());
					//console.log(CustomerStore.getCustomerCredit());
					//browserHistory.push('/Storefront');
					this.setState({
						loadingUser: false
					});
					SessionActions.addUserToSession();
				}
				break;

			case appConstants.CUSTOMER_LOGIN_CANCELLED:
				if (event.status === 'ok') {
					browserHistory.push('/PageIdle');
				}
				break;
		}
	}
  
	printMatchCallback(result, api) {
		Big.log('printMatchCallback');
		if (result) {
			let state = this.state;
			state.isPrintVerified = true;
			state.loadingUser = false;
			this.checkForCustomerLoad(state);
		}
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

				Big.log('alright lettuce check for customer Load.... first, state: [client='+client+']');
				Big.log(state);
				
				state.isUserVerified = state.isUserVerified && state.isUserVerified.length ? true : false;
				
				this.checkForCustomerLoad(state);

			} else {
				// serious issue! not sure what to do.
				Big.error('uh, no client????? machine info:');
				Big.log( TsvStore.getMachineInfo() );
			}
		} else {
			// non-recognized card, or membership with a different client (or clients)!
		}
	}
	
	checkForCustomerLoad(state) {
		Big.log('checkForCustomerLoad');
		if (state.isUserVerified && state.isPrintVerified && state.membership_id) {
			state.loadingUser = true;
			Big.log('OK! loading customer!');
			CustomerActions.loadCustomerByMembershipId(this.state.membership_id);
		} else {
			Big.log('boo, not loading customer');
		}
		this.setState(state);
	}

	tryAgain() {
		this.setState( this.getDefaultState() );
	}
	
	cancelLogin() {
		this.setState({
			loginCancelled: true
		});
		SessionActions.closeSession( { ts: Date.now(), msg: 'customer cancelled login' }, appConstants.CUSTOMER_LOGIN_CANCELLED );
	}

	render() {
		
		if (this.state.loginCancelled) {
			return (
				<div style={{maxWidth:'60%',margin: '10em auto 1em', textAlign: 'center'}}>
					<h1>One Moment Please....</h1>
					<div><_E.Spinner size="lg" /></div>
				</div>
			);
		}
		
		// FIXME: someday, this should be a switch, whether or not we need to verify-by-admin or not
		if (this.state.matchedUser && !this.state.isUserVerified) {
			// BELOW: have to pass props.location here, because Access is wrapping Register instead of it being loaded by Router.
			return (
				<MembershipRegister
					matchedUser={this.state.matchedUser}
					location={this.props.location}
					/>
			);
		}
		
		if (this.state.matchedUser && this.state.isUserVerified && this.state.isPrintVerified) {
			if (this.state.loadingUser) {
				return (
					<div style={{maxWidth:'60%',margin: '10em auto 1em', textAlign: 'center'}}>
						<h1>One Moment Please....</h1>
						<div><_E.Spinner size="lg" /></div>
					</div>
				);
			}
			return (
				<div style={{maxWidth:'60%',margin: '10em auto 1em'}}>
					<h1>Welcome back {this.state.matchedUser.firstname}</h1>
					<p style={{textAlign: 'center'}}><_E.Button type="success" component={(<Link to="/Storefront">Let's go shopping!</Link>)} /></p>
				</div>
			);
		}

		return (
			<div style={{maxWidth:'60%',margin: '10em auto 1em'}}>
			  <_E.Row >
				<_E.Col>
				  <h1>Customer Access</h1>
				  <h3>Before you can pick products and check out, we need to know who you are. :-)</h3>
				</_E.Col>
			  </_E.Row>
			  <_E.Row >
				<_E.Col md="1/2" lg="1/2">
					<div className="interfaceBox" style={{marginTop: '1em'}}>
					<h3 style={{textAlign: 'center', marginBottom: '2em'}}>Scan your Membership Card</h3>
				  <CardMatch
					autostart={true}
					canRetry={true}
					showMessages={true}
					token={this.state.token}
					matchCallback={this.cardMatchCallback.bind(this)}
				  	/>
				  	</div>
				</_E.Col>
				<_E.Col md="1/2" lg="1/2">
					<div className="interfaceBox" style={{marginTop: '1em'}}>
					<h3 style={{textAlign: 'center', marginBottom: '2em'}}>Scan your fingerprint</h3>
				  <PrintMatch
					autostart={true}
					canRetry={true}
					showMessages={true}
					user={this.state.matchedUser}
					token={this.state.token}
					matchCallback={this.printMatchCallback.bind(this)}
				  	/>
				  	</div>
				</_E.Col>
				<_E.Col>
					<p style={{textAlign: 'center'}}><_E.Button type="danger" onClick={this.cancelLogin.bind(this)}>Cancel Login</_E.Button></p>
				</_E.Col>
			  </_E.Row>
			</div>
		);
	}

}

export default Customer_MembershipAccess
