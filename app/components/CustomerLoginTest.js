import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'

import CL_Actions from '../actions/CustomerLoginActions'
import CL_Store from '../stores/CustomerStore'

import A_Actions from '../actions/AdminActions'
import A_Store from '../stores/AdminStore'

import TsvStore from '../stores/TsvStore'

import appConstants from '../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../utils'

import {
	GuiTimer,
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
    	loginToken: null,
    	machineInfo: TsvStore.getMachineInfo()
    }

    this._onAStoreChange = this._onAStoreChange.bind(this);
    this._onCLStoreChange = this._onCLStoreChange.bind(this);
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
	GuiTimer();

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
	GuiTimer();
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
  	var id = C.client_membership_ids.filter( ID => { return ID.client === this.state.machineInfo.client });
  	if (id && id.length) {
	  	//CL_Actions.loadCustomerByMembershipId(C.membership_id);
	  	CL_Actions.loadCustomerByMembershipId(id[0].id);
	}
  }
  
  _onCLStoreChange(event) {
	GuiTimer();
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
  	}
  }
  
  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h1>TEST Customer Login</h1>
			  <p style={{fontSize: '1.3em'}}>This module is for quick testing of the system while we're finishing support for the membership cards.</p>
			  <p style={{fontSize: '1.3em'}}>Choose a customer below to shop with.</p>
			  <p style={{fontSize: '1.3em'}}><strong>Don't worry, this will ONLY be here when the machine is in test mode!</strong></p>
			  <h3>OR: if you have a card in hand that matches one of the test accounts (talk to Kevin) then you can use that instead</h3>
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
  
}

export default CustomerLoginTest
