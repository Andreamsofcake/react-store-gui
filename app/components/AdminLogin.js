import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class AdminLogin extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'AdminLogin');
    this.state = {

    };

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="AdminLogin" >

          <h2 id="instruction">{{ instructionMessage }}</h2>

          <img className="regularBtn" id="back" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="back()">

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


      </_E.Row>


      /*<div className="AdminLogin" >

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

export default AdminLogin
