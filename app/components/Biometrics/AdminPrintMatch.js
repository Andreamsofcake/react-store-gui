import React, { Component } from 'react'
import PrintMatch from './PrintMatch'

import Log from '../../utils/BigLogger'
var Big = new Log('Biometrics_PrintMatchAdmin');

class PrintMatchAdmin extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);
		
		//this.state = this.getDefaultState({ user: this.props.user, token: this.props.token });
		//this._onPrintReaderStoreChange = this._onPrintReaderStoreChange.bind(this);
	}

	render() {

		Big.log('props?');
		Big.log(this.props);

		return (
			<PrintMatch
				isAdminMatch={true}
				autostart={this.props.autostart}
				canRetry={this.props.canRetry}
				showMessages={this.props.showMessages}
				user={this.props.user}
				token={this.props.token}
				matchCallback={this.props.matchCallback}
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
