import React, { Component } from 'react'
import * as _E from 'elemental'

import TestscopeActions from '../actions/TestscopeActions'
import TestscopeStore from '../stores/TestscopeStore'

class ComEmulator extends Component {
	
	constructor(props, context) {
		super(props, context);
		this._onTestscopeChange = this._onTestscopeChange.bind(this);
		this.state = {
			lastResult: ''
		}
	}
	
	sendCommand(cmd, e) {
		TestscopeActions.sendEmulatorCommand(cmd);
	}
	
	componentDidMount() {
		TestscopeStore.addChangeListener(this._onTestscopeChange);
	}
	
	compomentWillUnmount() {
		TestscopeStore.removeChangeListener(this._onTestscopeChange);
	}
	
	_onTestscopeChange(result) {
		this.setState({
			lastResult: result
		});
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
				cmd: ['insertCash', 5],
				showFor: ['Cash_Card','Cash_Vending']
			},
			{
				label: 'Insert $10',
				cmd: ['insertCash', 10],
				showFor: ['Cash_Card','Cash_Vending']
			},
			{
				label: 'Insert $20',
				cmd: ['insertCash', 20],
				showFor: ['Cash_Card','Cash_Vending']
			},
			{
				label: 'Insert $50',
				cmd: ['insertCash', 50],
				showFor: ['Cash_Card','Cash_Vending']
			},
			{
				label: 'Insert $100',
				cmd: ['insertCash', 100],
				showFor: ['Cash_Card','Cash_Vending']
			},

			// credit cards:
			{
				label: 'CC Insert',
				cmd: ['cardTransactionResponse', 'CARD_INSERTED'],
				showFor: ['Cash_Card','Card_Vending']
			},
			{
				label: 'CC Processing',
				cmd: ['cardTransactionResponse', 'CARD_PROCESSING'],
				showFor: ['Cash_Card','Card_Vending']
			},
			{
				label: 'CC Approve',
				cmd: ['cardTransactionResponse', 'CARD_APPROVED'],
				showFor: ['Cash_Card','Card_Vending']
			},
			{
				label: 'CC Connect Fail',
				cmd: ['cardTransactionResponse', 'CARD_CONNECTION_FAILURE'],
				showFor: ['Cash_Card','Card_Vending']
			},
			{
				label: 'CC Decline',
				cmd: ['cardTransactionResponse', 'CARD_DECLINED'],
				showFor: ['Cash_Card','Card_Vending']
			},
			{
				label: 'CC Unknown Error',
				cmd: ['cardTransactionResponse', 'CARD_UNKNOWN_ERROR'],
				showFor: ['Cash_Card','Card_Vending']
			},
		];
		
		return (
			<div id="ComEmulator">
				<h4>Send Test Commands:</h4>
				<div>
				{ buttons.map( (B, idx) => {
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
