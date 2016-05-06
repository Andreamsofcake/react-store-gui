import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	emptyCart,
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

class AdminBillAcceptor extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'AdminBillAcceptor');
    TsvActions.apiCall('disableLoginDevices');
    emptyCart();

    this.state = {
		acceptorState: 'off',
		amtInserted: '0.00',
		totalInsertedCents: '0.00'
    };

    this._onTsvChange = this._onTsvChange.bind(this);

  }

  billOn() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");
  	this.setState({
  		acceptorState: 'on'
  	});
  }

  billOff() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	TsvActions.apiCall('disablePaymentDevice');
  	this.setState({
  		acceptorState: 'off'
  	});
  }

    // Add change listeners to stores
  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
  	TsvStore.addChangeListener(this._onTsvChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	TsvStore.removeChangeListener(this._onTsvChange);
  }
  
    _onTsvChange(event) {
    	startGeneralIdleTimer(this.props.location.pathname);
    	if (event && event.method == 'creditBalanceChanged') {
    		//var status = this.state.vmsStatus;
    		//status.push(eventArgs.eventType + ' (' + eventArgs.exceptionMessage + ')');
			this.setState({
			  tsvEvent: event,
			  amtInserted: event.data[0].toFixed(2), // this is the bill
			  totalInsertedCents: event.data[1]
			})
		}
    }


  render() {
//curl -X POST -d '["DOOR_OPENED"]' http://localhost:8085/tsv/flashapi
	var onStyle = this.state.acceptorState == 'on' ? 'success' : 'danger';
	var offStyle = this.state.acceptorState == 'off' ? 'success' : 'danger';
    return (
      <_E.Row className="AdminBillAcceptor" style={{width: '60%', margin: '1em auto', textAlign:'center'}}>
        <_E.Col>

        	<h1 style={{fontWeight:300}}>Test Bill Acceptor</h1>

          <div>

			  <_E.Row>
	        	<h2 style={{fontWeight:300, textAlign:'center'}}>Set Bill Acceptor State:</h2>
			  </_E.Row>
			  <_E.Row>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button type={onStyle} size="lg" onClick={this.billOn.bind(this)}>On</_E.Button></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button type={offStyle} size="lg" onClick={this.billOff.bind(this)}>Off</_E.Button></_E.Col>
			  </_E.Row>

			  <_E.Row><p>{' '}</p></_E.Row>

			  <_E.Row>
				<_E.Col><div style={{backgroundColor: '#fff', textAlign:'center', border:'1px solid #dfdfdf',borderRadius:'4px',margin: '20px auto'}}>
					<h2>last event:
						{/*<br />{JSON.stringify(this.state.tsvEvent)}*/}
						<br />
						<br />Inserted: <strong>${this.state.amtInserted}</strong>
						<br />Total Inserted (cents): <strong>{this.state.totalInsertedCents}</strong>
					</h2></div></_E.Col>
			  </_E.Row>
          </div>
          
          <_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
          </_E.Col>

      </_E.Row>
    );
  }
}

export default AdminBillAcceptor
