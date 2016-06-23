import React, { Component } from 'react'
import * as _E from 'elemental'
import { browserHistory } from 'react-router'

//import CL_Store from '../stores/CL_Store'

import CL_Actions from '../actions/CustomerLoginActions'
import CL_Store from '../stores/CustomerStore'

//import TsvSettingsStore from '../stores/TsvSettingsStore'
import TsvStore from '../stores/TsvStore'
import {
	startGeneralIdleTimer,
	killGeneralIdleTimer,
	getTimer,
} from '../utils/TsvUtils'

class CustomerStatusDisplay extends Component {
	
	constructor(props, context) {
		super(props, context);
		this.state = {
			customer: CL_Store.getCustomer(),
			adminInPath: this.props.adminInPath,
			generalTimeoutRemaining: 0
		}
		
		this._onCLStoreChange = this._onCLStoreChange.bind(this);
		this.timer = null;
	}
	
	// Add change listeners to stores
	componentDidMount() {
		CL_Store.addChangeListener(this._onCLStoreChange);
		CL_Actions.refreshCustomer();
		this.startInterval(this.state.adminInPath);
	}
	
	startInterval(adminInPath) {
		if (adminInPath) {
			this.timer = setInterval( this.updateTimer.bind(this), 420 ); // just to be weird
		}
	}

	updateTimer() {
		var T = getTimer('generalIdleTimer')
			, timeLeft = T && T.getTimeLeft() ? T.getTimeLeft() : 0
			;
			
		if (T) {
			this.setState({
				generalTimeoutRemaining: (timeLeft / 1000).toFixed(3) + 's'
			});
		}
	}

	// Remove change listers from stores
	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
		CL_Store.removeChangeListener(this._onCLStoreChange);
	}
	
	componentWillReceiveProps(nextprops) {
		if (nextprops) {
			this.setState({ adminInPath: nextprops.adminInPath });
			this.startInterval(nextprops.adminInPath);
		}
	}
	
	resetGeneralIdleTimer() {
		startGeneralIdleTimer(this.props.location.pathname);
	}
	
	cancelGeneralIdleTimer() {
		killGeneralIdleTimer();
		this.setState({
			generalTimeoutRemaining: 'timer cancelled'
		});
	}

	_onCLStoreChange(event) {
		this.setState({
			customer: CL_Store.getCustomer(),
			customerCredit: CL_Store.getCustomerCredit()
		});
	}
	
	render() {
		return (
			<div style={{backgroundColor: '#000', padding: '0.5em', fontSize: '0.85em', color: '#fff', textTransform: 'uppercase', textAlign: 'right', marginBottom: 0}}>
				{this._render()}
			</div>
		);
	}
	
	_render() {
		if (this.state.adminInPath && !(/Login/.test(this.props.location.pathname))) {
			var btype = this.state.generalTimeoutRemaining > 10 ? 'warning' : 'danger';
			return (
				<p style={{marginBottom: 0}}><strong>... admin mode ...</strong> general timeout: {this.state.generalTimeoutRemaining}
					{' '}
					{parseInt(this.state.generalTimeoutRemaining) > 0 ? (
						<span>
						<_E.Button type={btype} size="sm" onClick={this.resetGeneralIdleTimer.bind(this)}> RESET IDLE TIMER </_E.Button>
						{' '}
						<_E.Button type={btype} size="sm" onClick={this.cancelGeneralIdleTimer.bind(this)}> CANCEL IDLE TIMER </_E.Button>
						</span>
					) : null }
				</p>
			);
		}
		return (this.state.customer ? this.renderLoggedIn() : this.renderLoggedOut() );
	}
	
	displayCreditBalance() {
		if (this.state.customerCredit) {
			return '$' + (this.state.customerCredit.current_credit_cents / 100).toFixed(2);
		}
		return '$0.00';
	}
	
	renderLoggedIn() {
		return (
			<p style={{marginBottom: 0}}>Welcome Back, {this.state.customer.firstname}! ... Credit Balance: {this.displayCreditBalance()}
				{' '}<_E.Button size="xs" type="success" onClick={() => { CL_Actions.customerLogout() }}>Logout</_E.Button>
			</p>
		);
	}

	renderLoggedOut() {
		return (
			<p style={{marginBottom: 0}}>Logged Out 
				{' '}
				{this.props.testing ? (
					<_E.Button size="xs" type="success" onClick={() => {browserHistory.push('/CustomerLoginTest')}}>Test Customer Login</_E.Button>
				) : null }
				{' '}<_E.Button size="xs" type="success" onClick={() => {browserHistory.push('/CustomerLogin')}}>Login</_E.Button>
				{' '}<_E.Button size="xs" type="success" onClick={() => {browserHistory.push('/CustomerSignup')}}>Register</_E.Button>
			</p>
		);
	}

}


export default CustomerStatusDisplay
