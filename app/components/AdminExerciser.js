import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

class Admin_Jofemar_Exerciser extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Admin_Jofemar_Exerciser');
    TsvService.disableLoginDevices(null, () => {});
    TsvService.emptyCart(null, () => {});
    TsvService.fetchMachineIds(null, (err, ids) => {
      	RootscopeActions.setCache('machineList', ids);
      });
    this.state = {
      num: "",
      maxChars: RootscopeStore.getConfig('bDualMachine') ? 3 : 2,
      errs: 0,
      bShowDropDownForMachines: false,
      machineNumber: 0
    };

    if(RootscopeStore.getCache('machineList').length > 1){
        this.state.bShowDropDownForMachines = true;
    }

  }

  vend(){
    TsvService.vendProduct(this.state.machineNumber, parseInt(this.state.num) + this.state.machineNumber * 100, () => {});
    this.setState({
      num: "",
      vmsStatus: ""
    })
  }

  lightOn() {
    TsvService.setLights(this.state.machineNumber, true, () => {});
  }

  lightOff() {
    TsvService.setLights(this.state.machineNumber, false, () => {});
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
    TsvService.subscribe("notifyVmsEvent", (eventArgs) => {
        this.setState({
		  vmsStatus: this.state.vmsStatus + eventArgs.eventType + ' (' + eventArgs.exceptionMessage + ')'
		})
    }, "app.jofemarExerciser");

  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("notifyVmsEvent", "app.jofemarExerciser");
  }

  render() {
//curl -X POST -d '["DOOR_OPENED"]' http://localhost:8085/tsv/flashapi
    return (
      <_E.Row className="Admin_Jofemar_Exerciser" >
        <_E.Col>

          <h2 id="instruction">Exerciser Jofemar</h2>

          <p>{this.state.vmsStatus}</p>

          <div style={{width: '50%', margin: '0 auto'}}>

          { RootscopeStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }
          <_E.Row>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button   onClick={this.lightOn}>{Translate.translate('Admin_Jofemar_Exerciser', 'LightOn')}</_E.Button></_E.Col>
			<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button   onClick={this.lightOff}>{Translate.translate('Admin_Jofemar_Exerciser','LightOff')}</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 1)}>1</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 2)}>2</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 3)}>3</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 4)}>4</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 5)}>5</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 6)}>6</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 7)}>7</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 8)}>8</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 9)}>9</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button type="warning" onClick={this.clear.bind(this)}>Clear</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button type="primary" onClick={this.vend.bind(this)}>Vend</_E.Button></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
            <_E.Col><div style={{textAlign:'center', border:'1px solid #dfdfdf',borderRadius:'4px',margin: '20px auto'}}><h2>selection: {this.state.num}</h2></div></_E.Col>
          </_E.Row>
          </div>

          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />
          </_E.Col>

      </_E.Row>
    );
  }
}

export default Admin_Jofemar_Exerciser
