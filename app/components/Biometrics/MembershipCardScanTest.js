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
var Big = new Log('Biometrics_MembershipCardScanTest');

/*
	<MembershipCardScanTest
		autostart={true}
		canRetry={true}
		showMessages={true}
		// client will be passed on the server side
		token={token}
		matchCallback={someFunc}  =>  (BOOLEAN match result, apiResponses, matchUser, membershipID)
		/>
*/

class MembershipCardScanTest extends Component {

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
			scannedOnce: false,
			scanInProcess: false,
			cardScanned: false,
			cardData: null,
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
				state.error_msg = lastResponse || 'Scan fail';
				state.cardScanned = false;
			}
			
			state.scanInProcess = false;
			state.scannedOnce = true;

		}

		// finally, set state
		this.setState(state, stateCB);
	}
	
	reset(obj) {
		this.setState( this.getDefaultState(obj) );
	}
	
	scanCard() {
		if (!this.state.scanInProcess) {
		
			this.setState({
				scanInProcess: true,
				cardScanned: false,
				membership_id: null,
				error_msg: '',
				status_msg: 'Swipe card magstripe UP'
			});

			CardReaderActions.clearApiResponses();
			CardReaderActions.clearDataBuffer(); // dumps any saved card data

			CardReaderActions.scanMembershipCard({
				token: this.state.token
			});

		}
	}

	render() {
		
		if (!this.state.token) {
			return (
				<_E.Alert type="danger"><span style={{fontSize:'1.65em'}}>Misconfiguration, this component needs a token.</span></_E.Alert>
			);
		}
		
		if (this.state.scanInProcess) {
			return (
				<div>
					<h4>Scanning</h4>
					<_E.Spinner size="md" type="primary" />
				</div>
			);
		}
		
		return (
			<div>
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
			|| (this.state.scannedOnce && this.props.canRetry && !this.state.scanInProcess)
		
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
		if (this.state.scanInProcess) {
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
					<span style={{display:'block'}}>Card scanned, Membership ID: {this.state.membership_id}</span>
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

export default MembershipCardScanTest
