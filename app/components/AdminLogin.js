import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Admin_Login extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Admin_Login');
    TsvService.disableLoginDevices();
    TsvService.emptyCart();
    this.state = {
      num: "",
      maxChars: 6,
      instructionMessage: Translate.translate('Admin_Login','Password')
    };
  }

  enter() {
    TsvService.validateAdminPassword(this.state.num, res => {
      switch(res.result){
          case "VALID":
              browserHistory.path("/Admin_Home");
              break;
          default:
              this.setState({
                instructionMessage : Translate.translate('Admin_Login', 'InvalidPassword'),
                num: ""
              }) //"Invalid Password";
              break;
      }

    } );

  }

  clear() {
    this.setState({
      instructionMessage : Translate.translate('Admin_Login', 'Password'),
      num: ""
    })
  }

  press(digit) {
    if(this.state.num.length < this.state.maxChars){
        this.setState({
          num: this.state.num + digit
        })
    }
  }

  back() {
    TsvService.gotoDefaultIdlePage();
  }
    // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="Admin_Login" >
        <_E.Col>

          <h2 id="instruction">{ this.instructionMessage }</h2>

          <_E.Button id="back" onClick={this.back}>Back</_E.Button>

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
              <_E.Col basis="1/3"><_E.Button type="primary" onClick={this.enter}>Enter</_E.Button></_E.Col>
          </_E.Row>>

          <input id="coilInput" type="password" value={this.state.num} />

          </_E.Col>
      </_E.Row>


      /*<div className="Admin_Login" >

          <h2 id="instruction">{{ instructionMessage }}</h2>

          <img class="regularBtn" id="back" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="back()">

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

              <img ng-src="{{localizedImage('Button_Clear.png')}}" err-src="../Images/Button_Clear.png" ng-click="clear()">
              <img ng-src="{{localizedImage('Button_Enter.png')}}" err-src="../Images/Button_Enter.png" ng-click="enter()">

          </div>

          <input id="coilInput" type="password" value={{prompt()}}>


      </div>*/
    );
  }
}

export default Admin_Login
