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

import Log from '../utils/BigLogger'
var Big = new Log('Admin_Print_Reader_Tester');

class Admin_Print_Registration extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
/*
		user_id: 'u123',
		client_id: 'c123',
		location_id: 'l123',
		machine_id: 'm123',
		interfaceFocus: false,
*/
		currentClientUser: null,
		clientUsers: [],
		apiResponse: [],
		token: uniq()
    }
    
    this._onStoreChange = this._onStoreChange.bind(this);

  }

// Add change listeners to stores
  componentDidMount() {
    AdminStore.addChangeListener(this._onStoreChange);
    AdminActions.getClientUsers();
    this.setState({
    	currentClientUser: null
    });
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
    AdminStore.removeChangeListener(this._onStoreChange);
  }
  
  _onStoreChange(event) {
  	startGeneralIdleTimer(this.props.location.pathname);
  	if (event.type == appC.REGISTER_CLIENT_USER_PRINT) {
	  	Big.log('PRINT READER event');
  		Big.log(event);
  		this.setState({
  			apiResponse: AdminStore.getApiResponses()
  		});
  	}
  	if (event.type == appC.CLIENT_USERS_RECEIVED) {
	  	Big.log('received client users');
  		this.setState({
  			clientUsers: AdminStore.getClientUsers()
  		});
  	}
  }

  reset() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	this.setState({
  		apiResponse: [], // reset API messages
  		currentClientUser: null,
  		token: null
  	});
  }
  
  registerComplete() {
  	AdminActions.registerClientUserPrintComplete({
  		clientUser: this.currentClientUser,
  		apiResponse: this.state.apiResponse.join("\n")
  	});
  	let cus = this.state.clientUsers;
  	cus.forEach( CU => {
  		if (cus._id === this.currentClientUser._id) {
  			// artificially inflate the prints_registered so there's a visual record of the action (count) in the list of users
  			// this is generally what it looks like in the DB:
  			cus.prints_registered.push({
  				ts: Date.now(),
  				apiResponse: this.state.apiResponse.join("\n")
  			});
  		}
  	});
  	this.setState({
  		clientUsers: cus,
  		apiResponse: [], // reset API messages
  		currentClientUser: null,
  		token: null
  	});
  }

  selectClientUser(CU, e) {
  	if (e) e.preventDefault();
  	this.setState({
  		currentClientUser: CU,
  		token: uniq() // new token each registration
  	});
  }
  
  render() {
  	
//curl -X POST -d '["DOOR_OPENED"]' http://localhost:8085/tsv/flashapi
    return (
      <_E.Row className="Admin_Print_Reader_Tester" >
        <_E.Col>

          <h2 id="instruction">Register Client User Print</h2>

          {this.renderGuiState()}

        </_E.Col>

      </_E.Row>
    );
  }
  
  renderGuiState() {
  	if (this.state.currentClientUser) {
  		let CU = this.state.currentClientUser;
		return (
			<div>
				
				<h4>Register Print for {CU.firstname} {CU.lastname}:</h4>
				
				<p>Press the "Start" button, and then press your desired finger or thumb on to the scanner.</p>
				<p>Once the process is complete, press "Done" button to return to the list of Client Users, or click the cancel button to cancel.</p>
				
				<div>

					<_E.Button size="lg" onClick={this.registerPrint.bind(this)}>Start</_E.Button>
					{' '}
					<_E.Button size="lg" onClick={this.registerComplete.bind(this)}>Done</_E.Button>
					{' '}
					<_E.Button size="lg" onClick={this.reset.bind(this)}><_E.Glyph icon="circle-slash" />Cancel</_E.Button>

				</div>
				
				<div>
					<p>Registration results:</p>
					<pre style={{fontSize: '1em', padding: '1em'}}>
						{this.state.apiResponse.join("\n")}
					</pre>
				</div>
				
			</div>
		);
  	}
  	
  	if (this.state.clientUsers.length) {
		return (
			<div>
				
				<h4>Choose a Client User to register a print for:</h4>
				
				<div>

					<_E.Row>
						<_E.Col sm="50%" md="50%" lg="50%">
							Client User
						</_E.Col>
						<_E.Col sm="25%" md="25%" lg="25%">
							Prints Registered
						</_E.Col>
						<_E.Col sm="25%" md="25%" lg="25%">
							&nbsp;
						</_E.Col>
					</_E.Row>

					{this.state.clientUsers.map( CU => {
						
						return (
							<_E.Row>
								<_E.Col sm="50%" md="50%" lg="50%">
									{CU.firstname} {CU.lastname}
								</_E.Col>
								<_E.Col sm="25%" md="25%" lg="25%">
									{CU.prints_registered.length}
								</_E.Col>
								<_E.Col sm="25%" md="25%" lg="25%">
									<_E.Button size="lg" type="primary" onClick={this.selectClientUser.bind(this, CU)}><_E.Glyph icon=" I NEED A GLYPH " /></_E.Button>
								</_E.Col>
							</_E.Row>
						);
						
					})}
				</div>
				
			</div>
		);
  	}

  	return (
  		<div>
			<p>Loading Client Users, one moment please...</p>
			<_E.Spinner size="lg" type="primary" style={{margin:'0 auto 2em'}} />
  		</div>
  	);
  }
  
  registerPrint() {
  	//startGeneralIdleTimer(this.props.location.pathname);
  	//AdminActions.registerPrint(this.state);
  	AdminActions.registerPrint({
  		ACTION: appC.REGISTER_CLIENT_USER_PRINT,
  		user_id: this.state.currentClientUser._id,
  		token
  		/*
  		// just get this stuff on the server side, don't really need to keep it in the client:
  		client_id: this.state.machineMeta.client,
  		location_id: this.state.machineMeta.location,
  		machine_id: this.state.machineMeta._id,
  		*/
  	});
  }

}

export default Admin_Print_Registration
