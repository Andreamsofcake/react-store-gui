import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import AdminActions from '../actions/AdminActions'
import AdminStore from '../stores/AdminStore'
import appC from '../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../utils'
import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

class Admin_Print_Reader_Tester extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
		user_id: 'u123',
		client_id: 'c123',
		location_id: 'l123',
		machine_id: 'm123',
		interfaceFocus: false,
		apiResponse: [],
		token: uniq()
    }
    
    this._onStoreChange = this._onStoreChange.bind(this);

  }

// Add change listeners to stores
  componentDidMount() {
    AdminStore.addChangeListener(this._onStoreChange);
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
    AdminStore.removeChangeListener(this._onStoreChange);
  }
  
  _onStoreChange(event) {
  	startGeneralIdleTimer(this.props.location.pathname);
  	//if (event.type == appC.TEST_REGISTER_PRINT) {
  		this.setState({
  			apiResponse: AdminStore.getApiResponses()
  		});
  	//}
  }
  
  startMatchPrint() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'match',
  		apiResponse: [], // reset API messages
  		token: uniq() // new token
  	});
  }
  
  startRegisterPrint() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'register',
  		apiResponse: [], // reset API messages
  		token: uniq() // new token
  	});
  }
  
  reset() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	this.setState({
  		interfaceFocus: false,
  		apiResponse: [], // reset API messages
  		token: uniq() // new token
  	});
  }

  render() {
  	
//curl -X POST -d '["DOOR_OPENED"]' http://localhost:8085/tsv/flashapi
    return (
      <_E.Row className="Admin_Print_Reader_Tester" >
        <_E.Col>

          <h2 id="instruction">Test print reading and matching</h2>

          {this.renderGuiState()}

        </_E.Col>

      </_E.Row>
    );
  }
  
  renderGuiState() {
  	if (this.state.interfaceFocus) {
  		switch (this.state.interfaceFocus) {
  			case 'register':
  				return this.registerInterface();
  				break;

  			case 'match':
  				return this.matchInterface();
  				break;
  		}
  	}

  	return (
  		<_E.Row>
			<_E.Col sm="100%" md="100%" lg="100%">
				<h4>what are we doing?</h4>
			</_E.Col>
			<_E.Col sm="33%" md="33%" lg="33%">
				<_E.Button size="lg" type="primary" onClick={this.startRegisterPrint.bind(this)}> Register Print </_E.Button>
			</_E.Col>
			<_E.Col sm="33%" md="33%" lg="33%">
				<_E.Button size="lg" type="primary" onClick={this.startMatchPrint.bind(this)}> Match Print </_E.Button>
			</_E.Col>
			<_E.Col sm="33%" md="33%" lg="33%">
				<_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
			</_E.Col>
  		</_E.Row>
  	);
  }
  
  updateState(what, e) {
  	startGeneralIdleTimer(this.props.location.pathname);
  	//console.warn('updateState(what, e)');
  	//console.log(what);
  	//console.log(e.target.value);
  	let state = {};
  	state[what] = e.target.value;
  	//console.log(state);
  	this.setState(state);
  }

/*********

		BIG OL DEV NOTE: we are setting onChange as well as onKeyUp because:
		- react screams loudly if there's no onChange or readOnly
		- chrome virtual keyboard extension does not fire onChange, thus we need onKeyup

*********/
  
  registerInterface() {
  	return (
  		<_E.Row style={{maxWidth:'65%',margin: '0 auto'}}>
			<_E.Col sm="100%" md="100%" lg="100%">
	  			<h4>Register a print</h4>
	  		</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
	  			<_E.Form type="horizontal">
					<_E.FormField label="User ID" htmlFor="user_id">
						<_E.FormInput type="text" placeholder="Set user ID" name="user_id" value={this.state.user_id} _vkenabled="true" onChange={this.updateState.bind(this, 'user_id')} onKeyUp={this.updateState.bind(this, 'user_id')} />
					</_E.FormField>	  			
					<_E.FormField label="Client ID" htmlFor="client_id">
						<_E.FormInput type="text" placeholder="Set client ID" name="client_id" value={this.state.client_id} _vkenabled="true" onChange={this.updateState.bind(this, 'client_id')} onKeyUp={this.updateState.bind(this, 'client_id')} />
					</_E.FormField>	  			
					<_E.FormField label="Location ID" htmlFor="location_id">
						<_E.FormInput type="text" placeholder="Set location ID" name="location_id" value={this.state.location_id} _vkenabled="true" onChange={this.updateState.bind(this, 'location_id')} onKeyUp={this.updateState.bind(this, 'location_id')} />
					</_E.FormField>	  			
					<_E.FormField label="Machine ID" htmlFor="machine_id">
						<_E.FormInput type="text" placeholder="Set machine ID" name="machine_id" value={this.state.machine_id} _vkenabled="true" onChange={this.updateState.bind(this, 'machine_id')} onKeyUp={this.updateState.bind(this, 'machine_id')} />
					</_E.FormField>	  			
					<_E.FormField offsetAbsentLabel>
						<_E.Button size="lg" onClick={this.registerPrint.bind(this)}>Register print</_E.Button>
						{' '}
						<_E.Button size="lg" onClick={this.reset.bind(this)}>Reset</_E.Button>
					</_E.FormField>
	  			</_E.Form>
  			</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
  				<p>Api Responses (if any):</p>
	  			<pre style={{fontSize: '1em', padding: '1em'}}>
	  			{this.state.apiResponse.join("\n")}
	  			</pre>
	  			<pre style={{fontSize: '0.75em', padding: '1em', backgroundColor: '#dfdfdf'}}>
	  			Virtual Keyboard Sanity check:{"\n"}
	  			User ID: {this.state.user_id}{"\n"}
	  			Client ID: {this.state.client_id}{"\n"}
	  			Location ID: {this.state.location_id}{"\n"}
	  			Machine ID: {this.state.machine_id}{"\n"}
	  			</pre>
  			</_E.Col>
  		</_E.Row>
  	);
  }
  
/*********

		BIG OL DEV NOTE: we are setting onChange as well as onKeyUp because:
		- react screams loudly if there's no onChange or readOnly
		- chrome virtual keyboard extension does not fire onChange, thus we need onKeyup

*********/
  
  matchInterface() {
  	return (
  		<_E.Row>
			<_E.Col sm="100%" md="100%" lg="100%">
	  			<h4>Match a print</h4>
	  		</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
	  			<_E.Form type="horizontal">
					<_E.FormField label="User ID" htmlFor="user_id">
						<_E.FormInput type="text" placeholder="Set user ID" name="user_id" value={this.state.user_id} _vkenabled="true" onChange={this.updateState.bind(this, 'user_id')} onKeyUp={this.updateState.bind(this, 'user_id')} />
					</_E.FormField>	  			
					<_E.FormField offsetAbsentLabel>
						<_E.Button size="lg" onClick={this.matchPrint.bind(this)}>Start matching...</_E.Button>
						{' '}
						<_E.Button size="lg" onClick={this.reset.bind(this)}>Reset</_E.Button>
					</_E.FormField>
	  			</_E.Form>
  			</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
  				<p>Api Responses (if any):</p>
	  			<pre style={{fontSize: '1em', padding: '1em'}}>
	  			{this.state.apiResponse.join("\n")}
	  			</pre>
	  			<pre style={{fontSize: '0.75em', padding: '1em', backgroundColor: '#dfdfdf'}}>
	  			Virtual Keyboard Sanity check:{"\n"}
	  			User ID: {this.state.user_id}{"\n"}
	  			Client ID: {this.state.client_id}{"\n"}
	  			Location ID: {this.state.location_id}{"\n"}
	  			Machine ID: {this.state.machine_id}{"\n"}
	  			</pre>
  			</_E.Col>
  		</_E.Row>
  	);
  }
  
  registerPrint() {
  	//startGeneralIdleTimer(this.props.location.pathname);
  	AdminActions.registerPrint(this.state);
  }

  matchPrint() {
  	//startGeneralIdleTimer(this.props.location.pathname);
  	AdminActions.matchPrint(this.state);
  }
}

export default Admin_Print_Reader_Tester
