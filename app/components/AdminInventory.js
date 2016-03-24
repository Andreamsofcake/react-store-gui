import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Inventory extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Admin_Inventory');


  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (

      <_E.Row class="inventory">

          <h2 id="instruction">{{ instructionMessage }}</h2>

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


            </_E.Col>

              <img src="../Images/minus.png" ng-click="removeStock()" ng-show="!bEnterCoil">

              <div id="coilInput2"><p>{{prompt()}}</p></div>

              <img src="../Images/add.png" ng-click="addStock()" ng-show="!bEnterCoil">

              <img ng-src="{{localizedImage('Button_Enter.png')}}" err-src="../Images/Button_Enter.png" ng-show="bEnterCoil" ng-click="enter()">

          </div>


          <div ng-show="bEnterCoil">

              <select id="selectMachine" data-ng-show="bShowDropDownForMachines"></select>

              <button id="fillMachine" data-ng-click="fillMachine()">{{translate('FillMachine')}}</button>

              <p id="displayMachine">{{translate('FillAllCoilsForMachine')}} {{ machineID + 1 }}</p>

          </div>

          <div id="prdInfo" ng-show="!bEnterCoil">

              <img ng-src={{vpbc.imagePath}} err-src="../Images/ProductImageNotFound.png">

              <p>{{ vpbc.productName }}</p>

              <p>Coil: {{ coilNumber }}   Stock Count: {{ vpbc.inventoryCount }}</p>

          </div>

          <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

          <img class="regularBtn" id="fillImg" ng-src="{{localizedImage('Button_Fill.png')}}" err-src="../Images/Button_Fill.png" ng-show="bEnterCoil " ng-click="fillCoil()">

      </_E.Row>

    );
  }

}

export default Admin_Inventory
