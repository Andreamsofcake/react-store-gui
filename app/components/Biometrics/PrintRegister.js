import React, { Component } from 'react'

import appConstants from '../../constants/appConstants'
//import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import PrintReaderActions from '../../actions/PrintReaderActions'
import PrintReaderStore from '../../stores/PrintReaderStore'

import { uniq } from '../../utils'
import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Biometrics_PrintRegister');

class PrintRegister extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({ user: this.props.user, token: this.props.token });
		this._onPrintReaderStoreChange = this._onPrintReaderStoreChange.bind(this);
	}

	getDefaultState(obj) {
		let def = {
			apiResponses: [], // reset API messages
			user: null,
			token: null,
			num_scans: 0,
			scanStep: 0,
			scanInProcess: false,
			enrollmentFailed: false,
			registrationIsFinished: false,
			alreadyRegisteredPrint: false,
			error_msg: '',
			status_msg: '',
		}
		if (obj && typeof obj === 'object') {
			Object.keys(obj).forEach( K => { def[K] = obj[K] } );
		}
		return def;
	}
	
// Add change listeners to stores
	componentDidMount() {
		if (this.props.location) startGeneralIdleTimer(this.props.location.pathname);
		// dump any existing data:
		PrintReaderActions.clearApiResponses();
		PrintReaderActions.clearDataBuffer();
		PrintReaderStore.addChangeListener(this._onPrintReaderStoreChange);
	}

  // Remove change listers from stores
	componentWillUnmount() {
		PrintReaderStore.removeChangeListener(this._onPrintReaderStoreChange);
	}

	componentWillReceiveProps(nextprops) {
		if (nextprops && nextprops.user) {
			// resetting on a new user object is a good thing
			this.reset({ user: nextprops.user, token: nextprops.token, registrationCallback: nextprops.registrationCallback });
		}
	}

/*
	PRINT_SCANNED_1: null,
	PRINT_SCANNED_2: null,
	PRINT_SCANNED_3: null,
	PRINT_REGISTERED: null,
	PRINT_MATCHED: null,
	PRINT_NOT_MATCHED: null,
	CLEAR_PRINT_MODULE_API_RESPONSES: null,
*/
	_onPrintReaderStoreChange(event) {
		
		if (this.props.location) startGeneralIdleTimer(this.props.location.pathname);

		// we will be building up state here...
		let state = this.state
			, state_cb
			;
		
		state.apiResponses = PrintReaderStore.getApiResponses();
		
		if (event.type === appConstants.PRINT_MATCHED) {
			// uh oh, we have already registered this print with this user!
			state.alreadyRegisteredPrint = true;
			if (this.props.alreadyRegisteredCallback && typeof this.props.alreadyRegisteredCallback === 'function') {
				this.props.alreadyRegisteredCallback(true);
			}
		}

		// handle inbound
		if (event.type === appConstants.PRINT_SCANNED_1
			|| event.type === appConstants.PRINT_SCANNED_2
			|| event.type === appConstants.PRINT_SCANNED_3) { // scans completed
			
			let lastResponse = PrintReaderStore.lastApiResponse();

			//if (lastResponse && lastResponse.scanOK === true) {
			if (lastResponse && lastResponse.indexOf('Scan OK') > -1) {
				state.num_scans += 1;
				state.status_msg = 'Print scanned successfully. Remove your finger, press "scan again" when you are ready.';
				state.error_msg = '';
			} else {
				state.status_msg = '';
				state.error_msg = 'Scan failed, try again.';
			}
			
			Big.log('lastResponse: ' + lastResponse);
			
			state.scanStep = 0;
			state.scanInProcess = false;

		}
		
		// let's see if this print is already registered with this user...
		if (event.type === appConstants.PRINT_SCANNED_1 && state.num_scans === 1) {
			PrintReaderActions.matchPrint({
				token: this.state.token,
				matchProps: {
					user: this.state.user,
					client: this.props.client,
					location: this.props.location,
					machine: this.props.machine
				}
			});
		}

		// register the print with the current user_id
		if (event.type === appConstants.PRINT_SCANNED_3) {
			state.status_msg = 'Print sampled successfully. Processing, one moment please...';
			PrintReaderActions.registerPrint({
				token: this.state.token,
				registerUser: this.state.user
			});
		}

		if (event.type === appConstants.PRINT_SCAN_FAILED) {
			state.scanInProcess = false;
			state.status_msg = '';
			state.error_msg = 'Scan failed, try again.';
		}
		
		if (event.type === appConstants.PRINT_SCAN_ENROLLENT_FAILED) {
			state.scanInProcess = false;
			state.enrollmentFailed = true;
			state.status_msg = '';
			state.error_msg = 'Print register process failed, please try again.';
		}

		// print successfully registered, finish and callback
		if (event.type === appConstants.PRINT_REGISTERED) {

			if (this.props.registrationCallback && typeof this.props.registrationCallback === 'function') {
				this.props.registrationCallback(state.apiResponses);
			} else {
				Big.error('HAY NOW no registrationCallback for finishing print registration???');
			}
			
			state.registrationIsFinished = true;
			setTimeout( () => {
				PrintReaderActions.clearApiResponses();
				PrintReaderActions.clearDataBuffer();
			}, 250);
		}

		// finally, set state
		this.setState(state);
	}
	
	reset(obj) {
		
		if (this.props.location) startGeneralIdleTimer(this.props.location.pathname);
		
		/// INVARIANT!!!!!!
		setTimeout(() => {
			PrintReaderActions.clearApiResponses();
			PrintReaderActions.clearDataBuffer();
		}, 250);
		this.setState( this.getDefaultState(obj) );
	}
	
	tryAgain() {

		if (this.props.location) startGeneralIdleTimer(this.props.location.pathname);

		this.reset({ user: this.state.user, token: this.state.token });
	}

	render() {
		
		if (!this.state.user || !this.state.token) {
			return (
				<_E.Alert type="danger"><span style={{fontSize:'1.65em', marginTop: '1em'}}>Misconfiguration, this component needs a user and token.</span></_E.Alert>
			);
		}
		
		if (this.state.enrollmentFailed) {
			return (
				<div style={{textAlign:'center', marginTop: '1em'}}>
					<h1 className="mainHeaderText">Sorry, we have a problem.</h1>
					<p>Let's start over with that same finger (or thumb).</p>
					
					<p><_E.Button type="primary" size="lg" onClick={this.tryAgain.bind(this)}>Try Again</_E.Button></p>
				</div>
			);
		}
		
		if (this.state.alreadyRegisteredPrint) {
			return (
				<div style={{textAlign:'center', marginTop: '1em'}}>
					<h1 className="mainHeaderText">Hey now, it looks like you have already registered that print for yourself.</h1>
					<p>You don't need to re-register the same finger or thumb, please use another.</p>
					
					<p><_E.Button type="primary" size="lg" onClick={this.tryAgain.bind(this)}>Try Again</_E.Button></p>
				</div>
			);
		}
		
		return (
			<div>
				{this.renderScanSteps()}
				{this.renderScanSystemMessages()}
			</div>
		);
	}
	
	renderScanSystemMessages() {
		if (this.state.num_scans) {
			return (
				<div style={{margin: '2em 10em', backgroundColor:'rgba(255,255,255,0.75)', color:'#333', padding: '1.2em', border: '1px solid #aaa'}}>
					<h4 style={{color:'#333'}}>System messages:</h4>
					<pre style={{fontSize: '1em', padding: '1em'}}>
						{this.state.apiResponses ? this.state.apiResponses.join("\n") : 'no responses yet'}
					</pre>
				</div>
			);
		}
		return null;
	}

	renderScanSteps() {
		if (this.state.registrationIsFinished) {
			return (
				<div style={{marginTop: '2em'}}>
					<h2>Scan complete!</h2>
				</div>
			);
		}
		
		let SCAN_LABEL = this.state.scanStep > 1 ? 'Scan Again' : 'Scan'
			, SCAN_BUTTON_OPACITY = 1
			, READY_MSG = 'When you\'re ready,'
			, SCAN_BUTTON_PROPS = {
				size: 'lg',
				type: 'primary'
			}
			;
		
		if (this.state.scanInProcess) {
			SCAN_BUTTON_OPACITY = 0.3;
			SCAN_BUTTON_PROPS.type = "default-primary";
			SCAN_LABEL = 'Scanning.....';
			READY_MSG = 'OK!';
		} else {
			SCAN_BUTTON_PROPS.onClick = this.scanPrint.bind(this);
		}
		
		return (
			<div style={{marginTop: '2em'}}>
				<h2>We need to take three scans of your finger or thumb.</h2>
			
				<_E.Row>
					<_E.Col sm="33%" md="33%" lg="33%">
						{this.renderPrintTracker(1)}
					</_E.Col>
					<_E.Col sm="33%" md="33%" lg="33%">
						{this.renderPrintTracker(2)}
					</_E.Col>
					<_E.Col sm="33%" md="33%" lg="33%">
						{this.renderPrintTracker(3)}
					</_E.Col>
				</_E.Row>

				<_E.Row style={{marginTop:'2em',textAlign:'center'}}>
					<_E.Col>
						<_E.Alert type="info"><span style={{fontSize:'1.65em'}}>Use the same finger or thumb for each scan.</span></_E.Alert>
					</_E.Col>
				</_E.Row>

				<p style={{fontSize: '1.35em', margin: '2em 11em 1em'}}>{READY_MSG}</p>
				<div style={{opacity: SCAN_BUTTON_OPACITY, textAlign: 'center', marginBottom: '2em'}}>
					<_E.Button {...SCAN_BUTTON_PROPS}>{SCAN_LABEL}</_E.Button>
				</div>
				
				{this.renderErrors()}
				{this.renderStatus()}

			
			</div>
		);
	}
	
	renderStatus() {
		if (this.state.status_msg) {
			return (
				<div style={{textAlign:'center'}}>
					<_E.Alert type="success"><span style={{fontSize:'1.65em'}}>{this.state.status_msg}</span></_E.Alert>
					{/*<_E.Spinner size="lg" />*/}
				</div>
			);
		}
		return null;
	}

	renderErrors() {
		if (this.state.error_msg) {
			return (
				<_E.Alert type="danger"><span style={{fontSize:'1.35em'}}>{this.state.error_msg}</span></_E.Alert>
			);
		}
		return null;
	}

	renderPrintTracker(whichOne) {
		var RESULT;
		if (this.state.num_scans >= whichOne) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="success"><_E.Glyph icon="check" /></_E.Button>
					<span style={{display:'block'}}>Complete!</span>
				</div>
			);
		} else if (this.state.scanStep == whichOne) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="warning" size="lg"><_E.Spinner /></_E.Button>
					<span style={{display:'block'}}>Scanning in process</span>
				</div>
			);
		} else {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="danger"><_E.Glyph icon="issue-opened" /></_E.Button>
					<span style={{display:'block'}}>Not scanned</span>
				</div>
			);
		}
		return RESULT;
	}

	scanPrint() {
		
		if (this.props.location) startGeneralIdleTimer(this.props.location.pathname);
		
		var scanStep = this.state.num_scans + 1
			, statusMsg = 'Please ' + (scanStep > 1 ? 'reposition the same' : 'place your') + ' thumb or finger on the scanner to the right.'
			;
		this.setState({
			scanInProcess: true,
			error_msg: '',
			status_msg: statusMsg,
			scanStep
		});
		PrintReaderActions.grabPrint({
			sequence: scanStep,
			token: this.state.token
		});
	}
/*
	____startRegisterPrint() {
		this.setState({
			scanInProcess: false,
			error_msg: '',
			status_msg: 'Start print registration process....',
			num_scans: 0
		});
	}
*/
}

export default PrintRegister
