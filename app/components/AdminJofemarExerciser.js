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

class AdminJofemarExerciser extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'AdminJofemarExerciser');
    TsvActions.apiCall('disableLoginDevices');
    emptyCart();
    TsvActions.apiCall('fetchMachineIds', (err, ids) => {
      	RootscopeActions.setCache('machineList', ids);
      });
    this.state = {
      num: "",
      maxChars: RootscopeStore.getConfig('bDualMachine') ? 3 : 2,
      errs: 0,
      bShowDropDownForMachines: false,
      machineNumber: 0,
      vmsStatus: []
    };

    if (RootscopeStore.getCache('machineList').length > 1) {
        this.state.bShowDropDownForMachines = true;
    }
    
    this._onTsvChange = this._onTsvChange.bind(this);

  }

  vend(){
  	startGeneralIdleTimer(this.props.location.pathname);
    TsvActions.apiCall('vendProduct', this.state.machineNumber, parseInt(this.state.num) + this.state.machineNumber * 100);
    this.setState({
      num: "",
      vmsStatus: []
    })
  }

  lightOn() {
  	startGeneralIdleTimer(this.props.location.pathname);
    TsvActions.apiCall('setLights', this.state.machineNumber, true);
  }

  lightOff() {
  	startGeneralIdleTimer(this.props.location.pathname);
    TsvActions.apiCall('setLights', this.state.machineNumber, false);
  }

  clear() {
  	startGeneralIdleTimer(this.props.location.pathname);
    this.setState({
      num: ""
    })
  }

  press(digit) {
  	startGeneralIdleTimer(this.props.location.pathname);
  	var num = this.state.num + digit.toString();
    if (this.state.num.length < this.state.maxChars){
        this.setState({
          num: num
        })
	}
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
    	if (event && event.method == 'notifyVmsEvent') {
    		var status = this.state.vmsStatus;
    		status.push(eventArgs.eventType + ' (' + eventArgs.exceptionMessage + ')');
			this.setState({
			  vmsStatus: status
			})
		}
    }


  render() {
//curl -X POST -d '["DOOR_OPENED"]' http://localhost:8085/tsv/flashapi
    return (
      <_E.Row className="AdminJofemarExerciser" style={{width: '50%', margin: '1em auto'}}>
        <_E.Col>

        	<h1 style={{fontWeight:300}}>Jofemar Exerciser</h1>

          <div>

          { RootscopeStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }
          <_E.Row>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button size="lg"   onClick={this.lightOn.bind(this)}>{Translate.translate('AdminJofemarExerciser', 'LightOn')}</_E.Button></_E.Col>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button size="lg"   onClick={this.lightOff.bind(this)}>{Translate.translate('AdminJofemarExerciser','LightOff')}</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 1)}>1</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 2)}>2</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 3)}>3</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 4)}>4</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 5)}>5</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 6)}>6</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 7)}>7</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 8)}>8</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 9)}>9</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="warning" onClick={this.clear.bind(this)}>Clear</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" onClick={this.vend.bind(this)}>Vend</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
            <_E.Col><div style={{textAlign:'center', border:'1px solid #dfdfdf',borderRadius:'4px',margin: '20px auto'}}><h2>selection: {this.state.num}</h2></div></_E.Col>
          </_E.Row>
          </div>
          
          <p>{this.state.vmsStatus.map( T => {
          	return (
          		<span>{T}<br /></span>
          	);
          })}</p>

          <_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
          </_E.Col>

      </_E.Row>
    );
  }
}

export default AdminJofemarExerciser
