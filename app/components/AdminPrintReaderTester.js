import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import AdminActions from '../actions/AdminActions'
import AdminStore from '../stores/AdminStore'
import appC from '../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import { uniq } from '../utils'

class Admin_Print_Reader_Tester extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Admin_Print_Reader_Tester');
    /*
    TsvService.disableLoginDevices(null, () => {});
    TsvService.emptyCart(null, () => {});
    TsvService.fetchMachineIds(null, (err, ids) => {
      	RootscopeActions.setCache('machineList', ids);
      });
      */

    this.state = {
		user_id: 'u123',
		client_id: 'c123',
		location_id: 'l123',
		machine_id: 'm123',
		interfaceFocus: false,
		apiResponse: [],
		token: uniq()
    }

  }

// Add change listeners to stores
  componentDidMount() {
    AdminStore.addChangeListener(this._onStoreChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
    AdminStore.removeChangeListener(this._onStoreChange);
  }
  
  _onStoreChange(event) {
  	//if (event.type == appC.TEST_REGISTER_PRINT) {
  		this.setState({
  			apiResponse: AdminStore.getApiResponses()
  		});
  	//}
  }
  
  startMatchPrint() {
  	AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'match',
  		apiResponse: [], // reset API messages
  		token: uniq() // new token
  	});
  }
  
  startRegisterPrint() {
  	AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'register',
  		apiResponse: [], // reset API messages
  		token: uniq() // new token
  	});
  }
  
  reset() {
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
			<_E.Col sm="50%" md="50%" lg="50%">
				<_E.Button type="primary" onClick={this.startRegisterPrint.bind(this)}> Register Print </_E.Button>
			</_E.Col>
			<_E.Col sm="50%" md="50%" lg="50%">
				<_E.Button type="primary" onClick={this.startMatchPrint.bind(this)}> Match Print </_E.Button>
			</_E.Col>
  		</_E.Row>
  	);
  }
  
  updateState(what, e) {
  	let state = {};
  	state[what] = e.target.value;
  	this.setState(state);
  }
  
  registerInterface() {
  	return (
  		<_E.Row>
			<_E.Col sm="100%" md="100%" lg="100%">
	  			<h4>Register a print</h4>
	  		</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
	  			<_E.Form type="horizontal">
					<_E.FormField label="User ID" htmlFor="user_id">
						<_E.FormInput type="text" placeholder="Set user ID" name="user_id" value={this.state.user_id} _vkenabled="true" onChange={this.updateState.bind(this, 'user_id')} />
					</_E.FormField>	  			
					<_E.FormField label="Client ID" htmlFor="client_id">
						<_E.FormInput type="text" placeholder="Set client ID" name="client_id" value={this.state.client_id} _vkenabled="true" onChange={this.updateState.bind(this, 'client_id')} />
					</_E.FormField>	  			
					<_E.FormField label="Location ID" htmlFor="location_id">
						<_E.FormInput type="text" placeholder="Set location ID" name="location_id" value={this.state.location_id} _vkenabled="true" onChange={this.updateState.bind(this, 'location_id')} />
					</_E.FormField>	  			
					<_E.FormField label="Machine ID" htmlFor="machine_id">
						<_E.FormInput type="text" placeholder="Set machine ID" name="machine_id" value={this.state.machine_id} _vkenabled="true" onChange={this.updateState.bind(this, 'machine_id')} />
					</_E.FormField>	  			
					<_E.FormField offsetAbsentLabel>
						<_E.Button onClick={this.registerPrint.bind(this)}>Register print</_E.Button>
						{' '}
						<_E.Button onClick={this.reset.bind(this)}>Reset</_E.Button>
					</_E.FormField>
	  			</_E.Form>
  			</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
  				<p>Api Responses (if any):</p>
	  			<pre style={{fontSize: '1em', padding: '1em'}}>
	  			{this.state.apiResponse.join("\n")}
	  			</pre>
  			</_E.Col>
  		</_E.Row>
  	);
  }
  
  matchInterface() {
  	return (
  		<_E.Row>
			<_E.Col sm="100%" md="100%" lg="100%">
	  			<h4>Match a print</h4>
	  		</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
	  			<_E.Form type="horizontal">
					<_E.FormField label="User ID" htmlFor="user_id">
						<_E.FormInput type="text" placeholder="Set user ID" name="user_id" value={this.state.user_id} _vkenabled="true" onChange={this.updateState.bind(this, 'user_id')} />
					</_E.FormField>	  			
					<_E.FormField offsetAbsentLabel>
						<_E.Button onClick={this.matchPrint.bind(this)}>Start matching...</_E.Button>
						{' '}
						<_E.Button onClick={this.reset.bind(this)}>Reset</_E.Button>
					</_E.FormField>
	  			</_E.Form>
  			</_E.Col>
  			<_E.Col sm="50%" md="50%" lg="50%">
  				<p>Api Responses (if any):</p>
	  			<pre style={{fontSize: '1em', padding: '1em'}}>
	  			{this.state.apiResponse.join("\n")}
	  			</pre>
  			</_E.Col>
  		</_E.Row>
  	);
  }
  
  registerPrint() {
  	AdminActions.registerPrint(this.state);
  }

  matchPrint() {
  	AdminActions.matchPrint(this.state);
  }
}

export default Admin_Print_Reader_Tester
