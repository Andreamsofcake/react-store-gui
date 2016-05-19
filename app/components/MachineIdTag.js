import React, { Component } from 'react'
import * as _E from 'elemental'
import { browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import appConstants from '../constants/appConstants'

class CustomerStatusDisplay extends Component {
	
	constructor(props, context) {
		super(props, context);
		this.state = {
			machineInfo: TsvStore.getMachineInfo()
		}
		
		this._onTsvStoreChange = this._onTsvStoreChange.bind(this);
		this.timer = null;
	}
	
	// Add change listeners to stores
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvStoreChange);
	}
	
	// Remove change listers from stores
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvStoreChange);
	}
	
	_onTsvStoreChange(event) {
		if (event.type === appConstants.MACHINE_INFO) {
			this.setState({
				machineInfo: TsvStore.getMachineInfo()
			});
		}
	}
	
	render() {
		return (
			<div className="machineIdTag">
				{this.state.machineInfo ? this.state.machineInfo.vendor_id : 'no id'}
			</div>
		);
	}
	
}


export default CustomerStatusDisplay
