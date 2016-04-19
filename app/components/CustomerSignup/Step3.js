import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import CS_Actions from '../../actions/CustomerSignupActions'
import CS_Store from '../../stores/CustomerStore'

import appConstants from '../../constants/appConstants'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Step extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
    	errorMsg: null,
    	simulatorPrint: null
    }
    
    this._onCSStoreChange = this._onCSStoreChange.bind(this);

  };

  // Add change listeners to stores
  componentDidMount() {
  	CS_Store.addChangeListener( this._onCSStoreChange );
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CS_Store.removeChangeListener( this._onCSStoreChange );
  }
  
  _onCSStoreChange(event) {
  	if (event.type === appConstants.MOBILE_NUMBER_ADDED_SIGNUP) {
  		if (event.status === 'ok') {
  			this.setState({
  				errorMsg: null
  			});
  		} else {
  			this.setState({
  				errorMsg: 'There was a problem with your mobile number, please try again.'
  			});
  		}
  	}
  }
  
  updateNumber(e) {
  	this.setState({
  		mobileNumber: e.target.value
  	});
  }
  
  saveMobileNumber() {
  	if (this.state.mobileNumber && this.mobileNumberIsOK()) {
  		CS_Actions.captureMobileNumber(this.props.signupToken, this.state.mobileNumber);
  	}
  }
  
  mobileNumberIsOK() {
  	if (this.state.mobileNumber) {
  		// eventually, validate it!
  		return true;
  	}
  	return false;
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>Mobile Number</h2>
			  <p>Punch in your mobile number so we can send a receipt to your phone.</p>

<_E.InputGroup contiguous>
	<_E.InputGroup.Section grow>
		<_E.FormInput type="text" placeholder="Enter your mobile number" _vkenabled="true" onKeyUp={this.updateNumber.bind(this)} />
	</_E.InputGroup.Section>
	<_E.InputGroup.Section>
		<_E.Button type="primary" onClick={this.saveMobileNumber.bind(this)}>Add Phone Number</_E.Button>
	</_E.InputGroup.Section>
</_E.InputGroup>

			</_E.Col>
		  </_E.Row>
		</div>
    );
  }
  
}

export default Step
