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
			{
				label: 'CC Insert',
				cmd: ['cardTransactionResponse', 'CARD_INSERTED']
			},
			{
				label: 'CC Processing',
				cmd: ['cardTransactionResponse', 'CARD_PROCESSING']
			},
			{
				label: 'CC Approve',
				cmd: ['cardTransactionResponse', 'CARD_APPROVED']
			},
			{
				label: 'CC Connect Fail',
				cmd: ['cardTransactionResponse', 'CARD_CONNECTION_FAILURE']
			},
			{
				label: 'CC Decline',
				cmd: ['cardTransactionResponse', 'CARD_DECLINED']
			},
			{
				label: 'CC Unknown Error',
				cmd: ['cardTransactionResponse', 'CARD_UNKNOWN_ERROR']
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
