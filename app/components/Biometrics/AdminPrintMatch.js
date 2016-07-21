import React, { Component } from 'react'
import PrintMatch from './PrintMatch'

import Log from '../../utils/BigLogger'
var Big = new Log('Biometrics_PrintMatchAdmin');

class PrintMatchAdmin extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);
		this.state = this.props;
	}
	
	componentWillReceiveProps(nextprops) {
		if (nextprops) {
			/*
			var state = this.state;
			Object.keys(nextprops).forEach( K => {
				state[K] = nextprops[K];
			});
			this.setState(state);
			*/
			this.setState(nextprops);
		}
	}

	render() {

		return (
			<PrintMatch
				isAdminMatch={true}
				autostart={this.state.autostart}
				canRetry={this.state.canRetry}
				showMessages={this.state.showMessages}
				user={this.state.user}
				token={this.state.token}
				matchCallback={this.state.matchCallback}
				/>
		);
	}

}

PrintMatchAdmin.defaultProps = {
	autostart: true,
	canRetry: true,
	showMessages: false,
	user: 'admin-', // just a prefix!
};

PrintMatchAdmin.propTypes = {
	autostart: React.PropTypes.bool.isRequired,
	canRetry: React.PropTypes.bool.isRequired,
	showMessages: React.PropTypes.bool.isRequired,
	user: React.PropTypes.string.isRequired,
	token: React.PropTypes.string.isRequired,
	matchCallback: React.PropTypes.func
};

export default PrintMatchAdmin
