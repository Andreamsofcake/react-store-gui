import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import TsvStore from '../../stores/TsvStore'
import TsvActions from '../../actions/TsvActions'
import {
	KillGuiTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('AdminJofemarExerciser');

class AdminJofemarExerciser extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'AdminJofemarExerciser');

    TsvActions.apiCall('fetchMachineIds', (err, ids) => {
      	TsvSettingsStore.setCache('machineList', ids);
      });

    this.state = {
      num: "",
      maxChars: TsvSettingsStore.getConfig('bDualMachine') ? 3 : 2,
      errs: 0,
      bShowDropDownForMachines: false,
      machineNumber: 0,
      vmsStatus: []
    };

    if (TsvSettingsStore.getCache('machineList').length > 1) {
        this.state.bShowDropDownForMachines = true;
    }
    
    this._onTsvChange = this._onTsvChange.bind(this);

  }

  vend(){
    TsvActions.apiCall('vendProduct', this.state.machineNumber, parseInt(this.state.num) + this.state.machineNumber * 100);
    this.setState({
      num: "",
      vmsStatus: []
    })
  }

  lightOn() {
    TsvActions.apiCall('setLights', this.state.machineNumber, true);
  }

  lightOff() {
    TsvActions.apiCall('setLights', this.state.machineNumber, false);
  }

  clear() {
    this.setState({
      num: ""
    })
  }

  press(digit) {
  	var num = this.state.num + digit.toString();
    if (this.state.num.length < this.state.maxChars){
        this.setState({
          num: num
        })
	}
  }

    // Add change listeners to stores
  componentDidMount() {
  	TsvStore.addChangeListener(this._onTsvChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	TsvStore.removeChangeListener(this._onTsvChange);
  }
  
    _onTsvChange(event) {
    	if (event && event.method == 'notifyVmsEvent') {
    		Big.log('TSV event');
    		Big.log(event);
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

        	<h1 style={{fontWeight:300}}>{/*Jofemar Exerciser*/}Test Vending</h1>
        	
        	<p>Select a row to test vend from using the keypad.</p>

          <div>

          { TsvSettingsStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }

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
            <_E.Col><div style={{textAlign:'center',backgroundColor:'#fff', border:'1px solid #dfdfdf',borderRadius:'4px',margin: '20px auto'}}><h2>selection: {this.state.num}</h2></div></_E.Col>
          </_E.Row>
          </div>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
			<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'right'}}><_E.Button size="lg" onClick={this.lightOn.bind(this)}>{Translate.translate('AdminJofemarExerciser', 'LightOn')}</_E.Button></_E.Col>
			<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} /></_E.Col>
			<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'left'}}><_E.Button size="lg" onClick={this.lightOff.bind(this)}>{Translate.translate('AdminJofemarExerciser','LightOff')}</_E.Button></_E.Col>
          </_E.Row>
          
          <p>{this.state.vmsStatus.map( T => {
          	return (
          		<span>{T}<br /></span>
          	);
          })}</p>

          
          </_E.Col>

      </_E.Row>
    );
  }
}

export default AdminJofemarExerciser
