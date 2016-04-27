import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'

class Admin_Check_Faults extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'Admin_Check_Faults');
    RootscopeActions.setCache('currentLocation', '/Admin_Check_Faults');
    this.state = {
      bRunningClearFaults: false,
      machineID: 0,
    };

    if (RootscopeStore.getCache('machineList').length > 1) {
    	this.state.bShowDropDownForMachines = true;
    };

	this._onTsvChange = this._onTsvChange.bind(this);
  }

  back(){
    browserHistory.push("/Admin_Home")
  }
  
  getFaultCodes(machine_id) {
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
        })
        getFaultCodes(this.state.machineID);
      }
  }

  // Add change listeners to stores
	componentDidMount() {
		getFaultCodes(this.state.machineID);
		TsvStore.addChangeListener(this._onTsvChange);
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
  _onTsvChange(event) {
	if (event && event.method === 'notifyResetComplete') {
		let machineID = event.data;

        this.setState({
          bRunningClearFaults: false
        })
        
        getFaultCodes(machineID);
	}
  }

  getMachineSelectOptions() {
    var options = [];
    RootscopeStore.getCache('machineList').forEach( MACHINE => {
      options.push({ label: 'Machine ' + MACHINE, value: MACHINE });
    })
    return options;
  }

  render() {
    return (
      <_E.Row className="check_faults">

          { RootscopeStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }

          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />

          <_E.Row id="wrapper">

              <_E.Col>

                  <_E.Row className="faults">
                      <_E.Col basis="1/3" className="faults">{Translate.translate('Admin_Check_Faults', 'FaultCode')}</_E.Col>
                      <_E.Col basis="1/3" className="faults">{Translate.translate('Admin_Check_Faults','EventID')}</_E.Col>
                      <_E.Col basis="1/3" className="faults">{Translate.translate('Admin_Check_Faults','Description')}</_E.Col>
                  </_E.Row>
                  
                  {this.state.renderFaults()}

              </_E.Col>

          </_E.Row>

          <_E.Button type="warning" onClick={this.clearFaults}>{Translate.translate('Admin_Check_Faults','Clear')}</_E.Button>

      </div>

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

export default Admin_Check_Faults
