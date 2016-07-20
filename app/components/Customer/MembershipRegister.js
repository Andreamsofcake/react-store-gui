import React, { Component } from 'react'

import CL_Actions from '../../actions/CustomerLoginActions' // for logout() call
import CL_Store from '../../stores/CustomerStore'
import TsvStore from '../../stores/TsvStore' // for retrieving machine config

import CardMatch from '../Biometrics/MembershipCardMatch'
import PrintMatch from '../Biometrics/PrintMatch'
import MembershipRegister from './MembershipRegister'

import appConstants from '../../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../../utils'

import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Customer_MembershipAccess');

import PrintMatchAdmin from '../Biometrics/PrintMatchAdmin'

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
			adminBeginMatched: false,
			adminEndMatched: false,
			adminBeginResponses: [],
			adminEndResponses: [],
			adminEndUser: null,
			token: uniq(),
			matchedUser: null,
			membership_id: null,
			isPrintVerified: false,
			isUserVerified: false,
			loadingUser: false
		}
		if (obj && typeof obj === 'object') {
			Object.keys(obj).forEach( K => { def[K] = obj[K] } );
		}
		return def;
	}

	// Add change listeners to stores
	__componentDidMount() {
		CL_Store.addChangeListener( this._onCLStoreChange );
		CL_Actions.customerLogout(); // make sure we dump any session!
		this.setState(this.getDefaultState());
		startGeneralIdleTimer(this.props.location.pathname);
	}

	// Remove change listers from stores
	__componentWillUnmount() {
		CL_Store.removeChangeListener( this._onCLStoreChange );
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
					this.setState({
						adminEndMatched: true,
						adminEndUser: user,
					});
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
			case appConstants.CUSTOMER_LOADED:
				if (event.status === 'ok') {
					//console.warn(appConstants.CUSTOMER_LOADED + ': customer then credit');
					//console.log(CL_Store.getCustomer());
					//console.log(CL_Store.getCustomerCredit());
					//browserHistory.push('/Storefront');
					this.setState({
						loadingUser: false
					});
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
		if (result) {
			
			let client = TsvStore.getMachineInfo().client;
			
			if (client) {
				
				let state = this.state;
				state.isUserVerified = matchedUser.client_verifications.filter( CV => { return CV.client == client } );
				state.matchedUser = matchedUser;
				state.membership_id = membership_id;
				state.loadingUser = false;

				state.isUserVerified = state.isUserVerified && state.isUserVerified.length ? true : false;
				
				this.checkForCustomerLoad(state);

			//} else {
				// serious issue! not sure what to do.
			}
		}
	}
	
	checkForCustomerLoad(state) {
		if (state.isUserVerified && state.isPrintVerified && state.membership_id) {
			state.loadingUser = true;
			CL_Actions.loadCustomerByMembershipId(this.state.membership_id);
		}
		this.setState(state);
	}

	render() {

		if (!this.state.adminBeginMatched) {
			return (
				<div>
					<h1>OK before we get started, let's verify an admin is with you.</h1>
					<PrintMatchAdmin
						token={this.state.token}
						matchCallback={this.adminPrintMatchCallback.bind(this)}
						/>
				</div>
			);
		}
		
		return (
			<div>
				<p>found user, but is not admin-verified! must capture prints etc</p>
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

		return (
			<div>
			  <_E.Row >
				<_E.Col>
				  <h2>Customer Access</h2>
				  <p>Before you can pick products and check out, we need to know who you are. :-)</p>
				</_E.Col>
			  </_E.Row>
			  <_E.Row >
				<_E.Col md="1/2" lg="1/2">
				  <CardMatch
					autostart={true}
					canRetry={true}
					showMessages={true}
					token={this.state.token}
					matchCallback={this.cardMatchCallback}
				  	/>
				</_E.Col>
				<_E.Col md="1/2" lg="1/2">
				  <PrintMatch
					autostart={true}
					canRetry={true}
					showMessages={true}
					user={this.state.matchedUser}
					token={this.state.token}
					matchCallback={this.printMatchCallback}
				  	/>
				</_E.Col>
			  </_E.Row>
			</div>
		);
	}

}

export default Customer_MembershipAccess
