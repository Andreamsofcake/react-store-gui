import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

//import AdminActions from '../../actions/AdminActions'
//import AdminStore from '../../stores/AdminStore'

import appConstants from '../../constants/appConstants'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import CardScanTest from '../Biometrics/MembershipCardScanTest'

import { uniq } from '../../utils'
import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('Admin_CardScanTester');

class Admin_CardScanTester extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
		interfaceFocus: false,
		apiResponse: [],
		token: uniq()
    }
    
    this._onStoreChange = this._onStoreChange.bind(this);

  }

// Add change listeners to stores
  componentDidMount() {
    //AdminStore.addChangeListener(this._onStoreChange);
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
    //AdminStore.removeChangeListener(this._onStoreChange);
  }
  
  _onStoreChange(event) {
  	Big.log('_onStoreChange');
  	Big.log(event);
  }
  
  startMembershipCardScan() {
  	//AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'membership-card',
  		token: uniq() // new token
  	});
  }
  
  startIdCardScan() {
  	AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'id-card',
  		token: uniq() // new token
  	});
  }
  
  startCreditCardScan() {
  	AdminActions.clearApiResponses();
  	this.setState({
  		interfaceFocus: 'credit-card',
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
      <_E.Row className="Admin_CardScanTester" >
        <_E.Col>

          <h2 id="instruction">Test card scans of different types</h2>

          {this.renderGuiState()}

        </_E.Col>

      </_E.Row>
    );
  }
  
  renderGuiState() {
  	if (this.state.interfaceFocus) {
  		switch (this.state.interfaceFocus) {
  			case 'membership-card':
  				return this.membershipCardScan();
  				break;

  			case 'id-card':
  				return this.idCardScan();
  				break;

  			case 'credit-card':
  				return this.creditCardScan();
  				break;
  		}
  	}

  	return (
  		<div>
  		<_E.Row style={{width: '50%', margin: '0 auto'}}>
			<_E.Col sm="100%" md="100%" lg="100%">
				<h3>what are we doing?</h3>
			</_E.Col>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign: 'center'}}>
				<_E.Button size="lg" type="primary" onClick={this.startMembershipCardScan.bind(this)}> Membership Card </_E.Button>
			</_E.Col>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign: 'center'}}>
				<_E.Button size="lg" type="primary" onClick={this.startIdCardScan.bind(this)}> ID / License Card </_E.Button>
			</_E.Col>
  		</_E.Row>
    	<_E.Row><p>{' '}</p></_E.Row>
  		<_E.Row style={{width: '50%', margin: '0 auto'}}>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign: 'center'}}>
				<_E.Button size="lg" type="primary" onClick={this.startCreditCardScan.bind(this)}> Credit Card </_E.Button>
			</_E.Col>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign: 'center'}}>
				<_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
			</_E.Col>
  		</_E.Row>
  		</div>
  	);
  }
    
  membershipCardScan() {
  	return (
  		<_E.Row style={{maxWidth:'65%',margin: '0 auto'}}>
			<_E.Col>
				<div style={{float: 'right'}}><_E.Button size="lg" type="primary" onClick={this.reset.bind(this)}>Cancel, back to list</_E.Button></div>
	  			<h4>Membership Card Scan Test</h4>
	  		</_E.Col>
  			<_E.Col>
  				<CardScanTest
					autostart={true}
					canRetry={true}
					showMessages={true}
					// client will be passed on the server side
					token={this.state.token}
  					/>
	  		</_E.Col>
	  	</_E.Row>
  	);
  }

  idCardScan() {
  	return (
  		<_E.Row style={{maxWidth:'65%',margin: '0 auto'}}>
			<_E.Col>
				<div style={{float: 'right'}}><_E.Button size="lg" type="primary" onClick={this.reset.bind(this)}>Cancel, back to list</_E.Button></div>
	  			<h4>ID / License Card Scan Test</h4>
	  		</_E.Col>
  			<_E.Col>
  				<p>not supported yet</p>
	  		</_E.Col>
	  	</_E.Row>
  	);
  }

  creditCardScan() {
  	return (
  		<_E.Row style={{maxWidth:'65%',margin: '0 auto'}}>
			<_E.Col>
				<div style={{float: 'right'}}><_E.Button size="lg" type="primary" onClick={this.reset.bind(this)}>Cancel, back to list</_E.Button></div>
	  			<h4>Credit Card Scan Test</h4>
	  		</_E.Col>
  			<_E.Col>
  				<p>not supported yet</p>
	  		</_E.Col>
	  	</_E.Row>
  	);
  }
  
}

export default Admin_CardScanTester
