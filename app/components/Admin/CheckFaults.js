import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../../actions/TsvActions'
import TsvStore from '../../stores/TsvStore'
import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

class AdminCheckFaults extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
      bRunningClearFaults: false,
      machineID: 0,
    };

    if (TsvSettingsStore.getCache('machineList').length > 1) {
    	this.state.bShowDropDownForMachines = true;
    };

	this._onTsvChange = this._onTsvChange.bind(this);
  }

  back(){
    browserHistory.push("/Admin/Home")
  }
  
  getFaultCodes(machine_id) {
  	startGeneralIdleTimer(this.props.location.pathname);
    TsvActions.apiCall('getFaultCodes', machine_id.toString(), (err, data) => {
      this.setState({
        faults: data
      })
    });
  }

  clearFaults(){
      if(!this.state.bRunningClearFaults){
        this.setState({
			bRunningClearFaults: true
        });
        TsvSettingsStore.setSession('bRunningClearFaults', true);
        getFaultCodes(this.state.machineID);
      }
  }

  // Add change listeners to stores
	componentDidMount() {
		startGeneralIdleTimer(this.props.location.pathname);
		TsvSettingsStore.setSession('bRunningClearFaults', false);
		this.getFaultCodes(this.state.machineID);
		TsvStore.addChangeListener(this._onTsvChange);
	}
	
	componentWillUnmount() {
		TsvSettingsStore.setSession('bRunningClearFaults', false);
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
  _onTsvChange(event) {
  	startGeneralIdleTimer(this.props.location.pathname);
	if (event && event.method === 'notifyResetComplete') {
		let machineID = event.data;

        this.setState({
          bRunningClearFaults: false
        });
        
        TsvSettingsStore.setSession('bRunningClearFaults', false);
        
        getFaultCodes(machineID);
	}
  }

  getMachineSelectOptions() {
    var options = [];
    TsvSettingsStore.getCache('machineList').forEach( MACHINE => {
      options.push({ label: 'Machine ' + MACHINE, value: MACHINE });
    })
    return options;
  }

  render() {
    return (
      <_E.Row className="check_faults" style={{maxWidth:'50%',margin: '1em auto'}}>

        	<h1 style={{fontWeight:300}}>Check Faults</h1>

          { TsvSettingsStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }

          <_E.Button type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />

          <_E.Row id="wrapper">

              <_E.Col>

                  <_E.Row className="faults">
                      <_E.Col basis="1/3" className="faults">{Translate.translate('AdminCheckFaults', 'FaultCode')}</_E.Col>
                      <_E.Col basis="1/3" className="faults">{Translate.translate('AdminCheckFaults','EventID')}</_E.Col>
                      <_E.Col basis="1/3" className="faults">{Translate.translate('AdminCheckFaults','Description')}</_E.Col>
                  </_E.Row>
                  
                  {this.renderFaults()}

              </_E.Col>

          </_E.Row>

          <_E.Button type="warning" onClick={this.clearFaults.bind(this)}>{Translate.translate('AdminCheckFaults','Clear')}</_E.Button>

      </_E.Row>

    );
  }
  
  renderFaults() {
	  if (this.state.faults && this.state.faults.length) {
	  	return this.state.faults.map((fault, $index) => {
		  return (
			<_E.Row key={$index}>
			  <_E.Col basis="1/3" className="faults">{ fault.faultCode }</_E.Col>
			  <_E.Col basis="1/3" className="faults">{ fault.vmsEventID }</_E.Col>
			  <_E.Col basis="1/3" className="faults">{ fault.faultDescription }</_E.Col>
			</_E.Row>
		  )});
	  }
	  return (<p>No faults... maybe they are loading</p>);
  }

}

export default AdminCheckFaults
