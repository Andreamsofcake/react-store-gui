import React, { Component } from 'react'
import PrintMatch from './PrintMatch'

class PrintMatchAdmin extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);

		this.state = this.getDefaultState({ user: this.props.user, token: this.props.token });
		this._onPrintReaderStoreChange = this._onPrintReaderStoreChange.bind(this);
	}

	render() {
		return (
			<PrintMatch
				autostart={true}
				canRetry={true}
				showMessages={false}
				user="admin-"
				token={this.props.token}
				matchCallback={this.props.matchCallback}
				/>
		);
	}

}

export default PrintMatch
