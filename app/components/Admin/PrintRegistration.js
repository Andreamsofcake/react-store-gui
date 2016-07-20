import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import AdminActions from '../../actions/AdminActions'
import AdminStore from '../../stores/AdminStore'
import appConstants from '../../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../../utils'
import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Admin_PrintRegistration');

import BiometricsPrintRegister from '../Biometrics/PrintRegister'

class Admin_PrintRegistration extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({ clientUsers: [] });
		this._onAdminStoreChange = this._onAdminStoreChange.bind(this);
	}

	getDefaultState(obj) {
		let def = {
			apiResponse: [], // reset API messages
			currentClientUser: null,
			registrationInProcess: false,
			printRegisterResponses: [],
			token: uniq(),
		}
		if (obj && typeof obj === 'object') {
			Object.keys(obj).forEach( K => { def[K] = obj[K] } );
		}
		return def;
	}

// Add change listeners to stores
	componentDidMount() {
		AdminStore.addChangeListener(this._onAdminStoreChange);
    	AdminActions.getClientUsers();
	}

  // Remove change listers from stores
	componentWillUnmount() {
		AdminStore.removeChangeListener(this._onAdminStoreChange);
	}

	_onAdminStoreChange(event) {
		Big.log('_onAdminStoreChange(event)');
		Big.log(event);
		if (event.type == appConstants.CLIENT_USERS_RECEIVED) {
			Big.log('received client users');
			this.setState({
				clientUsers: AdminStore.getClientUsers()
			});
		}

		if (event.type == appConstants.CLIENTUSER_BIOMETRIC_RECORD_ADDED) {
			Big.log('biometric record saved!');

			let cus = this.state.clientUsers;
			cus.forEach( CU => {
				if (this.getPrintUserID(CU) === this.getPrintUserID(this.currentClientUser)) {
					// artificially inflate the prints_registered so there's a visual record of the action (count) in the list of users
					// this is generally what it looks like in the DB:
					CU.biometric_records.push({
						ts: Date.now(),
						type: 'fingerprint',
						location_data: { location: null, machine: null }, // could get from config somewhere I'm sure
						apiResponses: this.state.printRegisterResponses
					});
				}
			});

			this.setState({
				clientUsers: cus
			});

		}
	}

	printRegistrationFinished(apiResponses) {

		this.setState({
			printRegisterResponses: apiResponses
		}, () => {
			AdminActions.addBiometricRecord({
				token: this.state.token,
				clientUser: this.state.currentClientUser,
				apiResponses: apiResponses,
				type: 'fingerprint'
			});
		});

	}

	reset() {
		this.setState( this.getDefaultState({ clientUsers: this.state.clientUsers }));
	}

	selectClientUser(CU, e) {
		if (e) e.preventDefault();
		this.setState({
			currentClientUser: CU,
			num_scans: 0, // number of scans per print registration (requires 3)
			token: uniq() // new token each registration
		});
	}

	render() {

		//curl -X POST -d '["DOOR_OPENED"]' http://localhost:8085/tsv/flashapi
		return (
		  <_E.Row className="Admin_Print_Reader_Tester" style={{maxWidth: '65%', margin: '1em auto 0'}}>
			<_E.Col>

			  <div style={{float: 'right'}}><_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">Admin Home</Link>)} /></div>
			  <h1>Manage Employee Fingerprints</h1>
			  {this.renderGuiState()}

			</_E.Col>

		  </_E.Row>
		);
	}

	renderGuiState() {
		if (this.state.currentClientUser) {
			return this.renderCapturePrint();
		}
	
		if (this.state.clientUsers.length) {
			return (
				<div>
				
					<h3 style={{fontWeight: 'normal'}}>Choose a Client User to register a print for:</h3>
				
					<div style={{fontSize: '1.35em', marginTop: '1em'}}>

						<_E.Row>
							<_E.Col sm="40%" md="40%" lg="40%">
								<strong>Client User</strong>
							</_E.Col>
							<_E.Col sm="35%" md="35%" lg="35%">
								<strong># Prints Registered</strong>
							</_E.Col>
							<_E.Col sm="25%" md="25%" lg="25%">
								&nbsp;
							</_E.Col>
						</_E.Row>

						{this.state.clientUsers.map( (CU, idx) => {
							
							let num_prints = CU.biometric_records.filter( BR => { return BR.type === 'fingerprint' })
						
							return (
								<_E.Row key={idx}>
									<_E.Col sm="40%" md="40%" lg="40%">
										{CU.firstname} {CU.lastname}
									</_E.Col>
									<_E.Col sm="35%" md="35%" lg="35%">
										{num_prints.length}
									</_E.Col>
									<_E.Col sm="25%" md="25%" lg="25%">
										<_E.Button type="primary" onClick={this.selectClientUser.bind(this, CU)}>Register Fingerprint</_E.Button>{/*<_E.Glyph icon=" I NEED A GLYPH " />*/}
									</_E.Col>
								</_E.Row>
							);
						
						})}
					</div>
				
				</div>
			);
		}

		return (
			<div>
				<p>Loading Client Users, one moment please...</p>
				<_E.Spinner size="lg" type="primary" style={{margin:'0 auto 2em'}} />
				<pre>{JSON.stringify(this.state.clientUsers, null, 4)}</pre>
			</div>
		);
	}

	renderCapturePrint() {
		let CU = this.state.currentClientUser;
		
		return (
			<div style={{marginTop: '2em'}}>
			
				<h3>Register Print for {CU.firstname} {CU.lastname}:</h3>
			
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
		
		Big.log('this.getPrintUserID()');
		Big.log(this.getPrintUserID());

		return (
			<BiometricsPrintRegister
				user={this.getPrintUserID()}
				token={this.state.token}
				registrationCallback={this.printRegistrationFinished.bind(this)}
				/>
		);
	}
	
	getPrintUserID(user) {
		user = user || this.state.currentClientUser;
		if (user) {
			return 'admin-' + user._id;
		}
		return null;
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

export default Admin_PrintRegistration
