import React, { Component } from 'react'

import appConstants from '../../constants/appConstants'
//import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import CardReaderActions from '../../actions/CardReaderActions'
import CardReaderStore from '../../stores/CardReaderStore'

import { uniq } from '../../utils'
import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Biometrics_MembershipCardMatch');

/*
	<MembershipCardMatch
		autostart={true}
		canRetry={true}
		showMessages={true}
		// client will be passed on the server side
		token={token}
		matchCallback={someFunc}  =>  (BOOLEAN match result, apiResponses, matchUser, membershipID)
		/>
*/

class MembershipCardMatch extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({ token: this.props.token });
		this._onCardReaderStoreChange = this._onCardReaderStoreChange.bind(this);
	}

	getDefaultState(obj) {
		let def = {
			apiResponse: [], // reset API messages
			token: null,
			membership_id: null,
			matchedUser: null,
			scannedOnce: false,
			scanInProcess: false,
			cardScanned: false,
			cardData: null,
			matchingInProcess: false,
			matchingIsFinished: false,
			isMatched: false,
			matchedUser: false,
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
		CardReaderActions.clearApiResponses();
		CardReaderActions.clearDataBuffer();
		CardReaderStore.addChangeListener(this._onCardReaderStoreChange);
		if (this.props.autostart) {
			this.scanCard();
		}
	}

  // Remove change listers from stores
	componentWillUnmount() {
		CardReaderStore.removeChangeListener(this._onCardReaderStoreChange);
	}

	____componentWillReceiveProps(nextprops) {
		if (nextprops && nextprops.user) {
			let cb
				, state = {
				user: nextprops.user,
				token: nextprops.token
			};
			
			if (this.state.cardScanned && !this.state.matchingIsFinished) {
				cb = this.startMatchingProcess.bind(this);
			}
			
			this.setState(state, cb);
		}
	}

/*
	MEMBERSHIP_CARD_SCANNED: null,
	MEMBERSHIP_CARD_MATCHED: null,
	MEMBERSHIP_CARD_NOT_MATCHED: null,
*/
	_onCardReaderStoreChange(event) {

		// we will be building up state here...
		let state = this.state
			, stateCB = null
			;

		// handle inbound
		if (event.type === appConstants.MEMBERSHIP_CARD_SCANNED) { // scan completed
			
			let lastResponse = CardReaderStore.lastApiResponse();
			
			//if (lastResponse && lastResponse.scanOK === true) {
			if (event.membership_id || (lastResponse && lastResponse.indexOf('Scan OK') > -1)) {
				state.membership_id = event.membership_id;
				state.status_msg = 'Card scanned';
				state.error_msg = '';
				state.cardScanned = true;
			} else {
				state.status_msg = '';
				state.error_msg = 'Scan fail';
				state.cardScanned = false;
			}
			
			state.scanInProcess = false;
			state.scannedOnce = true;

			// reset matching flags on scan attempt
			state.matchingIsFinished = false;
			state.matchingInProcess = false;
			state.isMatched = false;
			
			stateCB = this.startMatchingProcess.bind(this);

		}

		// register the print with the current user_id
		if (event.type === appConstants.MEMBERSHIP_CARD_MATCHED || event.type === appConstants.MEMBERSHIP_CARD_NOT_MATCHED) {

			let RESPONSES = CardReaderStore.getApiResponses();
			state.matchedUser = CardReaderStore.lastMatchedMembershipUser()

			if (event.type === appConstants.MEMBERSHIP_CARD_MATCHED) {
				state.status_msg = 'Card matched';
				state.error_msg = '';
				state.isMatched = true;
			} else {
				state.status_msg = '';
				state.error_msg = 'Match fail';
				state.isMatched = false;
			}

			if (this.props.matchCallback) {
				this.props.matchCallback( !!(event.type === appConstants.MEMBERSHIP_CARD_MATCHED), RESPONSES, state.matchedUser, state.membership_id );
			}

			state.matchingIsFinished = true;
			state.matchingInProcess = false;
			state.cardScanned = false; // tells interface that we are done trying to match that card
			
			CardReaderActions.clearApiResponses();
			CardReaderActions.clearDataBuffer(); // dumps any saved card data
		}

		// finally, set state
		this.setState(state, stateCB);
	}
	
	reset(obj) {
		this.setState( this.getDefaultState(obj) );
	}
	
	startMatchingProcess() {
		
		if (this.state.cardScanned
			&& this.state.membership_id
			&& !this.state.scanInProcess
			&& !this.state.matchingInProcess
			&& !this.state.matchingIsFinished) {
		
			this.setState({
				matchingInProcess: true
			});

			CardReaderActions.matchMembershipCard({
				token: this.props.token,
				membership_id: this.state.membership_id
			});
		/*} else {
			this.setState({
				error_msg: 'Cannot start matching?',
				status_msg: ''
			});*/
		}
	}

	scanCard() {
		if (!this.state.cardScanned
			&& !this.state.scanInProcess
			&& !this.state.matchingInProcess) {
		
			this.setState({
				scanInProcess: true,
				matchingInProcess: false,
				matchingIsFinished: false,
				isMatched: false,
				cardScanned: false,
				membership_id: null,
				matchedUser: null,
				error_msg: '',
				status_msg: 'Swipe card magstripe UP'
			});

			CardReaderActions.clearApiResponses();
			CardReaderActions.clearDataBuffer(); // dumps any saved card data

			CardReaderActions.scanMembershipCard({
				token: this.state.token
			});

		/*} else {
			this.setState({
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
			SCAN_BUTTON_PROPS.onClick = this.scanCard.bind(this);
		}
		
		if (
			// regular start button:
			(!this.state.scannedOnce && !this.props.autostart)
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
					{this.props.canRetry ? (
					<_E.Button type="primary" onClick={this.tryAgain}>Try again</_E.Button>
					) : null}
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

		} else if (this.state.cardScanned) {
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

export default MembershipCardMatch
