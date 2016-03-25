import React, { Component } from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Jofemar_Exerciser extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Admin_Jofemar_Exerciser');
    TsvService.disableLoginDevices();
    TsvService.emptyCart();
    TsvService.fetchMachineIds((err, ids) => {
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
        this.setState({
          bShowDropDownForMachines: true,
        })
    }

  }

  vend(){
    // clearStatus();
    // var clearStatus = function() {
    //     $scope.errs = 0;
    //     $(".vmsStatus").empty();
    // };
    TsvService.vendProduct(this.state.machineNumber, parseInt(this.num) + this.state.machineNumber * 100);
    this.setState({
      num: ""
    })
  }

  lightOn() {
    TsvService.setLights(this.state.machineNumber, true);
  }

  lightOff() {
    TsvService.setLights(this.state.machineNumber, false);
  }

  clear() {
    this.setState({
      num: ""
    })
  }

  press(digit) {
    if(this.state.num.length < this.state.maxChars){
        this.setState({
          num: this.state.num + digit
        })
    }
    this.setState({
      num: parseInt(this.state.num).toString()
    });
  }

  prompt(){
    if(this.state.num.length != 0) {
      return this.state.num
    }
    return ""
  }

  backToAdminHome() {
    browserHistory.push("/Admin_Home");
  }
    // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("notifyVmsEvent", (eventArgs) => {
        if (browserHistory.push() !== "/Admin_Jofemar_Exerciser")
            return;
        if (this.state.errs == 2) {
            //clearStatus();
            // var clearStatus = function() {
            //     $scope.errs = 0;
            //     $(".vmsStatus").empty();
            // };
        }

        // $(".vmsStatus").append(eventArgs.eventType + ' (' + eventArgs.exceptionMessage + ')<br/>');
        // this.errs++;
    }, "app.jofemarExerciser");

  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("notifyVmsEvent", "app.jofemarExerciser");
  }

  render() {
    return (
      <_E.Row className="Admin_Jofemar_Exerciser" >
        <_E.Col>

          <h2 id="instruction">{ this.instructionMessage }</h2> // there was no instructions in the js
          <_E.Row>

            { RootscopeStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }

            <_E.Col basis="1/2"><_E.Button   onClick={this.lightOn}>{Translate.translate('Admin_Jofemar_Exerciser', 'LightOn')}</_E.Button></_E.Col>

            <_E.Col basis="1/2"><_E.Button   onClick={this.lightOff}>{Translate.translate('Admin_Jofemar_Exerciser','LightOff')}</_E.Button></_E.Col>

          </_E.Row>


          <_E.Row>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 1)}>1</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 2)}>2</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 3)}>3</_E.Button></_E.Col>
          </_E.Row>
          <_E.Row>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 4)}>4</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 5)}>5</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 6)}>6</_E.Button></_E.Col>
          </_E.Row>
          <_E.Row>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 7)}>7</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 8)}>8</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 9)}>9</_E.Button></_E.Col>
          </_E.Row>
          <_E.Row>
              <_E.Col basis="1/3"><_E.Button type="warning" onClick={this.clear}>Clear</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
              <_E.Col basis="1/3"><_E.Button type="primary" onClick={this.vend}>Vend</_E.Button></_E.Col>
          </_E.Row>
          <_E.Row>
            <_E.Col><_E.Demobox>{this.prompt}</_E.Demobox></_E.Col>
          </_E.Row>



          <_E.Button id="back" onClick={this.back}>Back</_E.Button>
          </_E.Col>

      </_E.Row>


      /*
      <div class="jofemar">

          <div style="position: absolute; top: 0; right: 0; width: 500px; text-align:right;">
              <p style="color:white; background-color:black" class="vmsStatus"></p>
          </div>

          <h2 id="instruction">{{ instructionMessage }}</h2>

          <table>

              <td><select id="selectMachine" data-ng-show="bShowDropDownForMachines"></select></td>

              <td><button class="smallButton"  id="lightOn" ng-click="lightOn()">{{translate('LightOn')}}</button></td>

              <td><button  class="smallButton" id="lightOff" ng-click="lightOff()">{{translate('LightOff')}}</button></td>

          </table>

          <div id="keypad">

              <img src="../Images/Button_1.png" ng-click="press(1)">
              <img src="../Images/Button_2.png" ng-click="press(2)">
              <img src="../Images/Button_3.png" ng-click="press(3)">
              <img src="../Images/Button_4.png" ng-click="press(4)">
              <img src="../Images/Button_5.png" ng-click="press(5)">
              <img src="../Images/Button_6.png" ng-click="press(6)">
              <img src="../Images/Button_7.png" ng-click="press(7)">
              <img src="../Images/Button_8.png" ng-click="press(8)">
              <img src="../Images/Button_9.png" ng-click="press(9)">
              <img src="../Images/Button_10.png" ng-click="press(0)">

              <img ng-src="{{localizedImage('Button_Clear.png')}}" err-src="/Images/Button_Clear.png" ng-click="clear()">
              <img ng-src="{{localizedImage('Button_Vend.png')}}" err-src="/Images/Button_Vend.png" ng-click="vend()">

          </div>

          <p id="coilInput">{{prompt()}}</p>

          <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

      </div>
      */
    );
  }
}

export default Admin_Jofemar_Exerciser
