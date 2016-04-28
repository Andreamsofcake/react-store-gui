import React, { Component } from 'react'
import * as _E from 'elemental'
import { browserHistory } from 'react-router'

//import CL_Store from '../stores/CL_Store'

import CL_Actions from '../actions/CustomerLoginActions'
import CL_Store from '../stores/CustomerStore'

class CustomerStatusDisplay extends Component {
	
	constructor(props, context) {
		super(props, context);
		this.state = {
			customer: CL_Store.getCustomer()
		}
		
		this._onCLStoreChange = this._onCLStoreChange.bind(this);
	}
	
	// Add change listeners to stores
	componentDidMount() {
		CL_Store.addChangeListener(this._onCLStoreChange);
		CL_Actions.refreshCustomer();
		// tickle just in case:
		//this._onCLStoreChange();
	}

	// Remove change listers from stores
	componentWillUnmount() {
		CL_Store.removeChangeListener(this._onCLStoreChange);
	}

	_onCLStoreChange(event) {
		this.setState({
			customer: CL_Store.getCustomer()
		});
	}
	
	render() {
		return (
			<div style={{backgroundColor: '#000', padding: '0.5em', fontSize: '0.85em', color: '#fff', textTransform: 'uppercase', textAlign: 'right', marginBottom: 0}}>
				{this.state.customer ? this.renderLoggedIn() : this.renderLoggedOut()}
			</div>
		);
	}
	
	renderLoggedIn() {
		return (
			<p style={{marginBottom: 0}}>Welcome Back, {this.state.customer.firstname}! ... Credit Balance: $0.00
				{' '}<_E.Button size="xs" type="success" onClick={() => { CL_Actions.customerLogout() }}>Logout</_E.Button>
			</p>
		);
	}

	renderLoggedOut() {
		return (
			<p style={{marginBottom: 0}}>Logged Out 
				{' '}<_E.Button size="xs" type="success" onClick={() => {browserHistory.push('/CustomerLogin')}}>Login</_E.Button>
				{' '}<_E.Button size="xs" type="success" onClick={() => {browserHistory.push('/CustomerSignup')}}>Register</_E.Button>
			</p>
		);
	}

}


export default CustomerStatusDisplay
