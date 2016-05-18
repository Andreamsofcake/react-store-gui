import React, { Component } from 'react'
import * as _E from 'elemental'

import TestscopeActions from '../actions/TestscopeActions'
import TestscopeStore from '../stores/TestscopeStore'
import TsvSettingsStore from '../stores/TsvSettingsStore'

import Log from '../utils/BigLogger'
var Big = new Log('ComEmulator');

class ComEmulator extends Component {
	
	constructor(props, context) {
		super(props, context);
		this._onTestscopeChange = this._onTestscopeChange.bind(this);
		this._onTsvSettingsChange = this._onTsvSettingsChange.bind(this);
		this.state = {
			lastResult: '',
			currentView: TsvSettingsStore.getSession('currentView')
		}
	}
	
	sendCommand(cmd, e) {
		TestscopeActions.sendEmulatorCommand(cmd);
	}
	
	componentDidMount() {
		TestscopeStore.addChangeListener(this._onTestscopeChange);
		TsvSettingsStore.addChangeListener(this._onTsvSettingsChange);
	}
	
	compomentWillUnmount() {
		TestscopeStore.removeChangeListener(this._onTestscopeChange);
		TsvSettingsStore.removeChangeListener(this._onTsvSettingsChange);
	}
	
	_onTestscopeChange(result) {
		this.setState({
			lastResult: result
		});
	}

	_onTsvSettingsChange(event) {
		if (event.type === 'session' && event.path === 'currentView') {
			this.setState({
				currentView: TsvSettingsStore.getSession('currentView')
			});
		}
	}

	render() {
		
		var stylz = {
			backgroundColor: 'rgba(0,0,0,0.5)',
			color: '#fff',
			padding: '4px',
			fontSize: '0.75em'
		};
		
		var buttons = [

			// cash:
			{
				label: 'Insert $5',
				cmd: [['insertCash', 5]],
				showFor: ['ChooseCashCard','CashVending','AdminBillAcceptor']
			},
			{
				label: 'Insert $10',
				cmd: [['insertCash', 10]],
				showFor: ['ChooseCashCard','CashVending','AdminBillAcceptor']
			},
			{
				label: 'Insert $20',
				cmd: [['insertCash', 20]],
				showFor: ['ChooseCashCard','CashVending','AdminBillAcceptor']
			},
			{
				label: 'Insert $50',
				cmd: [['insertCash', 50]],
				showFor: ['ChooseCashCard','CashVending','AdminBillAcceptor']
			},
			{
				label: 'Insert $100',
				cmd: [['insertCash', 100]],
				showFor: ['ChooseCashCard','CashVending','AdminBillAcceptor']
			},

			// credit cards:
			{
				label: 'CC Insert',
				cmd: [['cardTransactionResponse', 'CARD_INSERTED']],
				showFor: ['ChooseCashCard','CardVending']
			},
			{
				label: 'CC Processing',
				cmd: [['cardTransactionResponse', 'CARD_PROCESSING']],
				showFor: ['ChooseCashCard','CardVending']
			},
			{
				label: 'CC Approve',
				cmd: [['cardTransactionResponse', 'CARD_APPROVED']],
				showFor: ['ChooseCashCard','CardVending']
			},
			{
				label: 'CC Connect Fail',
				cmd: [['cardTransactionResponse', 'CARD_CONNECTION_FAILURE']],
				showFor: ['ChooseCashCard','CardVending']
			},
			{
				label: 'CC Decline',
				cmd: [['cardTransactionResponse', 'CARD_DECLINED']],
				showFor: ['ChooseCashCard','CardVending']
			},
			{
				label: 'CC Unknown Error',
				cmd: [['cardTransactionResponse', 'CARD_UNKNOWN_ERROR']],
				showFor: ['ChooseCashCard','CardVending']
			},

			// admin
			{
				label: 'Sample Automap',
				cmd: [
					['notifyMapStatusChange', 'Map', { machineID: 0, coilNumber: '10', channel: 1, tray: 1 } ],
					['notifyMapStatusChange', 'Map', { machineID: 0, coilNumber: '11', channel: 1, tray: 1 } ],
					['notifyMapStatusChange', 'Map', { machineID: 0, coilNumber: '12', channel: 1, tray: 1 } ],
					['notifyMapStatusChange', 'Map', { machineID: 0, coilNumber: '13', channel: 1, tray: 1 } ],
					['notifyMapStatusChange', 'InvalidChannel', { machineID: 0, coilNumber: '', channel: 1, tray: 1 } ],
					['notifyMapStatusChange', 'InvalidChannel', { machineID: 0, coilNumber: '', channel: 2, tray: 1 } ],
				],
				showFor: ['AdminAutoMap']
			},

			{
				label: 'END Automap',
				cmd: [
					['notifyMapStatusChange', 'End', { machineID: 0, coilNumber: null, channel: '0', tray: 0 } ],
				],
				showFor: ['AdminAutoMap']
			},
		];
		
		var pathname = '';
		if (typeof window !== 'undefined') {
			pathname = window.location.pathname.replace(/\//g, '');
			Big.log('pathname: '+pathname);
		}
		
		let showButtons = buttons.filter( B => {
			return pathname !== 'ChooseCashCard' && B.showFor.indexOf( pathname ) > -1;
		});
		
		if (!showButtons.length) {
			return null;
		}
		
		Big.log('ok, render');

		return (
			<div id="ComEmulator">
				<h4>Send Test Commands:</h4>
				<div>
				{ showButtons.map( (B, idx) => {
					return (
						<_E.Button key={idx} type="primary" size="sm" onClick={ this.sendCommand.bind(this, B.cmd ) }>{ B.label }</_E.Button>
					);
				}) }
				</div>

				<hr />
				<p style={stylz}>{ this.state.lastResult ? JSON.stringify(this.state.lastResult) : 'no commands sent yet' }</p>
			</div>
		)
	}
}

export default ComEmulator;
