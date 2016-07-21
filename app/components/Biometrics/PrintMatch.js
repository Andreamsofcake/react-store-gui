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
var Big = new Log('Biometrics_PrintMatch');

/*
	<PrintMatch
		autostart={true}
		canRetry={true}
		showMessages={true}
		user={userData || LIST OF USERDATA}  =>  allows matching against multiple user _ids (use case: match a person's fingerprint against list of ClientUsers)
		token={token}
		matchCallback={someFunc}  =>  (BOOLEAN match result, apiResponses)
		/>
*/

class PrintMatch extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({ user: this.props.user, token: this.props.token, autostart: this.props.autostart });
		this._onPrintReaderStoreChange = this._onPrintReaderStoreChange.bind(this);
		
		this._isMounted = false;
	}

	getDefaultState(obj) {
		let def = {
			apiResponse: [], // reset API messages
			user: null,
			token: null,
			scannedOnce: false,
			scanInProcess: false,
			printScanned: false,
			matchingInProcess: false,
			matchingIsFinished: false,
			isMatched: false,
			error_msg: '',
			status_msg: '',
		}
		if (obj && typeof obj === 'object') {
			Object.keys(obj).forEach( K => { def[K] = obj[K] } );
		}
		return def;
	}
	
	// what's this for you ask? getting some instances that are ghost-mounted somehow.
	// this wrapper will make sure we don't setState on unmounted component
	_setState(state, cb) {
		if (this._isMounted) {
			return this.setState(state, cb);
		}
	}

// Add change listeners to stores
	componentDidMount() {
		this._isMounted = true;
		PrintReaderStore.addChangeListener(this._onPrintReaderStoreChange);
		if (this.props.autostart) {
			this.scanPrint();
		//} else {
			//Big.error('what, no autostart???');
			//Big.log(this.props);
		}
	}

  // Remove change listers from stores
	componentWillUnmount() {
		this._isMounted = false;
		PrintReaderStore.removeChangeListener(this._onPrintReaderStoreChange);
	}

	componentWillReceiveProps(nextprops) {
		Big.log('componentWillReceiveProps');
		Big.log(nextprops);
		Big.log(this.state);

		if (nextprops && nextprops.user) {
			let cb
				, state = {
				user: nextprops.user,
				token: nextprops.token
			};

			if (nextprops.hasOwnProperty('autostart')) {
				state.autostart = nextprops.autostart;
			}
			
			if (this.state.printScanned && !this.state.matchingIsFinished) {
				cb = this.startMatchingProcess.bind(this);
			}
			
			this._setState(state, cb);
		}
	}

/*
	PRINT_SCANNED_1: null,
	PRINT_MATCHED: null,
	PRINT_NOT_MATCHED: null,
	CLEAR_PRINT_MODULE_API_RESPONSES: null,
*/
	_onPrintReaderStoreChange(event) {

		// we will be building up state here...
		let state = this.state
			, stateCB = null
			;

		// handle inbound
		if (event.type === appConstants.PRINT_SCANNED_1) { // scan completed
			
			let lastResponse = PrintReaderStore.lastApiResponse();

			//if (lastResponse && lastResponse.scanOK === true) {
			if (lastResponse && lastResponse.indexOf('Scan OK') > -1) {
				state.status_msg = 'Print scanned';
				state.error_msg = '';
				state.printScanned = true;
			} else {
				state.status_msg = '';
				state.error_msg = 'Scan fail';
				state.printScanned = false;
			}
			
			state.scanInProcess = false;
			state.scannedOnce = true;

			// reset matching flags on any scan attempt
			state.matchingIsFinished = false;
			state.matchingInProcess = false;
			state.isMatched = false;
			
			if (this.state.user && this.state.token && state.printScanned) {
				stateCB = this.startMatchingProcess.bind(this);
			}

		}
		
		if (event.type === appConstants.PRINT_SCAN_FAILED) {
			state.scanInProcess = false;
			state.scannedOnce = true;
			// reset matching flags on any scan attempt
			state.matchingIsFinished = false;
			state.matchingInProcess = false;
			state.isMatched = false;
			state.status_msg = '';
			state.error_msg = 'Scan fail';
			state.printScanned = false;
		}

		// register the print with the current user_id
		if (event.type === appConstants.PRINT_MATCHED || event.type === appConstants.PRINT_NOT_MATCHED) {

			let RESPONSES = PrintReaderStore.getApiResponses();
			if (event.type === appConstants.PRINT_MATCHED) {
				state.status_msg = 'Print matched';
				state.error_msg = '';
				state.isMatched = true;
			} else {
				state.status_msg = '';
				state.error_msg = 'Match fail';
				state.isMatched = false;
			}

			if (this.props.matchCallback) {
				this.props.matchCallback( !!(event.type === appConstants.PRINT_MATCHED), RESPONSES, event.matchedUser );
			}

			state.matchingIsFinished = true;
			state.matchingInProcess = false;
			state.printScanned = false; // tells interface that we are done trying to match that print
			
			setTimeout( PrintReaderActions.clearApiResponses, 250 );
		}

		// finally, set state
		this._setState(state, stateCB);
	}
	
	reset(obj) {
		this._setState( this.getDefaultState(obj) );
	}
	
	startMatchingProcess() {
		
		if (this.state.printScanned
			&& !this.state.scanInProcess
			&& !this.state.matchingInProcess
			&& !this.state.matchingIsFinished) {
		
			this._setState({
				matchingInProcess: true
			});
			
			PrintReaderActions.matchPrint({
				token: this.props.token,
				isAdminMatch: this.props.isAdminMatch,
				matchProps: {
					user: this.state.user,
					client: this.props.client,
					location: this.props.location,
					machine: this.props.machine
				}
			});

		/*} else {
			this._setState({
				error_msg: 'Cannot start matching?',
				status_msg: ''
			});*/
		}
	}

	scanPrint() {
		if (!this.state.printScanned
			&& !this.state.scanInProcess
			&& !this.state.matchingInProcess) {
		
			this._setState({
				scanInProcess: true,
				matchingInProcess: false,
				matchingIsFinished: false,
				isMatched: false,
				printScanned: false,
				error_msg: '',
				status_msg: 'Place finger on scanner'
			});
			PrintReaderActions.grabPrint({
				sequence: 1,
				token: this.state.token
			});
		/*} else {
			this._setState({
				error_msg: 'Cannot start scanning?',
				status_msg: ''
			});*/
		}
	}

	render() {
		
		if (!this.state.token) {
			return (
				<_E.Alert type="danger"><span style={{fontSize:'1.65em'}}>Misconfiguration, this component needs a token.</span></_E.Alert>
			);
		}
		
		if (this.state.matchingInProcess) {
			return (
				<div style={{textAlign: 'center'}}>
					<h4>Matching</h4>
					<_E.Spinner size="md" type="primary" />
				</div>
			);
		}
		
		if (this.state.scanInProcess) {
			return (
				<div style={{textAlign: 'center'}}>
					<h4>Scanning</h4>
					<_E.Spinner size="md" type="primary" />
				</div>
			);
		}
		
		return (
			<div style={{textAlign: 'center'}}>
				{this.renderScanGUI()}
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
						{this.state.apiResponse.join("\n")}
					</pre>
				</div>
			);
		}
		return null;
	}

	renderScanGUI() {
		let SCAN_LABEL = 'Scan'
			, SCAN_BUTTON_OPACITY = 1
			, START_SCAN_BUTTON = null
			, SCAN_BUTTON_PROPS = {
				size: 'lg',
				type: 'primary'
			}
			;
		
		if (this.state.scanInProcess) {
			SCAN_BUTTON_OPACITY = 0.3;
			SCAN_BUTTON_PROPS.type = "default-primary";
			SCAN_LABEL = 'Scanning...';
		} else {
			SCAN_BUTTON_PROPS.onClick = this.scanPrint.bind(this);
		}
		
		if (
			// regular start button:
			(!this.state.scannedOnce && !this.state.autostart)
			// after at least one scan and no match:
			|| (this.state.scannedOnce && this.props.canRetry && !this.state.scanInProcess && !this.state.matchInProcess && !this.state.isMatched)
		
			) {

			START_SCAN_BUTTON = (
				<div style={{opacity: SCAN_BUTTON_OPACITY, textAlign: 'center', marginBottom: '2em'}}>
					<_E.Button {...SCAN_BUTTON_PROPS}>{SCAN_LABEL}</_E.Button>
				</div>			
			);
		}
		
		return (
			<div style={{marginTop: '2em'}}>
			
				<_E.Row>
					<_E.Col>
						{this.renderPrintTracker()}
					</_E.Col>
				</_E.Row>

				{START_SCAN_BUTTON}
				
				{this.renderErrors()}
				{this.renderStatus()}

			</div>
		);
	}
	
	renderStatus() {
		if (this.props.showMessages && this.state.status_msg) {
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
		if (this.props.showMessages && this.state.error_msg) {
			return (
				<_E.Alert type="danger"><span style={{fontSize:'1.35em'}}>{this.state.error_msg}</span></_E.Alert>
			);
		}
		return null;
	}

	renderPrintTracker() {
		var RESULT;
		if (this.state.isMatched) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="success"><_E.Glyph icon="check" /></_E.Button>
					<span style={{display:'block'}}>Done, matched!</span>
				</div>
			);

		} else if (!this.state.isMatched && this.state.matchingIsFinished) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="danger"><_E.Glyph icon="circle-slash" /></_E.Button>
					<span style={{display:'block'}}>Done, not matched</span>
				</div>
			);

		} else if (this.state.matchingInProcess) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="warning" size="lg"><_E.Spinner /></_E.Button>
					<span style={{display:'block'}}>Matching</span>
				</div>
			);

		} else if (this.state.scanInProcess) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="warning" size="lg"><_E.Spinner /></_E.Button>
					<span style={{display:'block'}}>Scanning</span>
				</div>
			);

		} else if (this.state.printScanned) {
			RESULT = (
				<div style={{textAlign:'center'}}>
					<_E.Button type="success">OK</_E.Button>
					<span style={{display:'block'}}>Waiting for match</span>
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

}

PrintMatch.defaultProps = {
	autostart: true,
	canRetry: true,
	showMessages: false,
	isAdminMatch: false,
	user: 'admin-', // just a prefix!
};

PrintMatch.propTypes = {
	autostart: React.PropTypes.bool.isRequired,
	canRetry: React.PropTypes.bool.isRequired,
	showMessages: React.PropTypes.bool.isRequired,
	isAdminMatch: React.PropTypes.bool,
	user: React.PropTypes.string.isRequired,
	token: React.PropTypes.string.isRequired,
	matchCallback: React.PropTypes.func
};

export default PrintMatch
