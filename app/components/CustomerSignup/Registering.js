import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import CS_Actions from '../../actions/CustomerSignupActions'
//import CS_Store from '../../stores/CustomerStore'

import appConstants from '../../constants/appConstants'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Step1 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    
  };
  
  componentDidMount() {
  	CS_Actions.finishRegistering(this.props.signupToken);
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
			  <h2>One moment please while we create your account</h2>
			  <_E.Spinner />
			</_E.Col>
		  </_E.Row>
		  {this.renderSimulator()}
		</div>
    );
  }
  
  renderSimulator() {
  	if (this.props.testing) {
  		return (
		  <_E.Row style={{ border: '1px solid #666', borderRadius: '4px', backgroundColor: '#ccc', maxWidth: '85%', margin: '3em auto', paddingTop: '0.4em' }}>
			<_E.Col>
			  <h4 style={{fontWeight: 'normal'}}>SIMULATOR: trying to register the customer</h4>
			  <p style={{fontSize: '0.75em'}}>signup token: <strong>{this.props.signupToken}</strong></p>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default Step1
