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
    TsvService.fetchMachineIds(RootscopeActions.setCache('machineList'));
    this.state = {
      instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
      machineID: 0,
      num: "",
      maxChars: RootscopeStore.getConfig('bDualMachine') ? 3 : 2,
      bEnterCoil: true,
      showKeypad: false
    }

    if(RootscopeStore.getCache('machineList').length > 1){
        /*
          Create dropdown with machine list

          addMachineOptions(){
              var x = document.getElementById("selectMachine");

              for(var i=0; i< TSVService.cache.machineList.length; i++) {
                  var option = document.createElement("option");
                  option.text = $scope.translate("Machine") + " " + (Number(TSVService.cache.machineList[i]) + 1);
                  x.add(option);
              }
            }
        */
        this.setState({
          bShowDropDownForMachines: true,
        })
    }
  }

  fillMachine(){
      TsvService.fillMachine(this.state.machineID.toString());
  }

  fillCoil(){
    if(this.state.num != ""){
        this.setState({
          vpbc: TsvService.adminValidateProductByCoil(this.state.num);
        })

        switch (this.state.vpbc.result) {
            case "UNKNOWN":
                this.setState({
                  instructionMessage: Translate.translate('Admin_Inventory', 'UnknownProduct')
                });
                setTimeout( () => {
                    this.setState({
                      instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
                      bEnterCoil: true,
                      num: ""
                    });
                }, 3000);
                break;
            case "INVALID_PRODUCT":
              this.setState({
                instructionMessage: Translate.translate('Admin_Inventory', 'InvalidProduct')
              });
              setTimeout( () => {
                  this.setState({
                    instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
                    bEnterCoil: true,
                    num: ""
                  });
              }, 3000);
              break;
            default:
              this.setState({
                instructionMessage: Translate.translate('Admin_Inventory', 'EnterStockAmount'),
                coilNumber: this.state.num,
                num: "",
                bEnterCoil: false,
              });
              TsvService.fillCoil(this.state.coilNumber);
              break;
        }
    }
  }

  backToAdminHome() {
    this.setState({
      num: ""
    });
      if(this.state.bEnterCoil){
          browserHistory.push("/Admin_Home");
      }else{
        this.setState({
          bEnterCoil: true
        })
      }
  }

  addStock(){
      if(this.state.num != ""){
          TsvService.addStock(this.state.coilNumber, this.state.num);
          this.setState({
            vpbc: TsvService.adminValidateProductByCoil(this.state.coilNumber),
            num: "";
          });

          setTimeout( () => {
              this.setState({
                instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
                bEnterCoil: true,
                num: ""
              });
          }, 2000);
      }
  }

  removeStock(){
      if(this.state.num != ""){
          TsvService.removeStock(this.state.coilNumber, this.state.num);
          this.setState({
            vpbc: TsvService.adminValidateProductByCoil(this.state.coilNumber),
            stockCount: "Stock Count: " + this.state.vpbc.inventoryCount,
            num: "";
          });

          setTimeout( () => {
              this.setState({
                instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
                bEnterCoil: true,
                num: ""
              });
          }, 2000);
      }
  }

  clear() {
    this.setState({
      num: ""
    })
  }

  enter() {
    this.setState({
      vpbc: TsvService.adminValidateProductByCoil(this.state.num);
    })

    switch (this.state.vpbc.result) {
        case "UNKNOWN":
            this.setState({
              instructionMessage: Translate.translate('Admin_Inventory', 'UnknownProduct')
            });
            setTimeout( () => {
                this.setState({
                  instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
                  bEnterCoil: true,
                  num: ""
                });
            }, 3000);
            break;
        case "INVALID_PRODUCT":
          this.setState({
            instructionMessage: Translate.translate('Admin_Inventory', 'InvalidProduct')
          });
          setTimeout( () => {
              this.setState({
                instructionMessage: Translate.translate('Admin_Inventory', 'EnterCoil'),
                bEnterCoil: true,
                num: ""
              });
          }, 3000);
          break;
        default:
          this.setState({
            instructionMessage: Translate.translate('Admin_Inventory', 'EnterStockAmount'),
            coilNumber: this.state.num,
            num: "",
            bEnterCoil: false,
          });
          break;
    }

  }
  press(digit) {
    if(this.state.num.length < this.state.maxChars){
        this.setState({
          num: this.state.num + digit
        });
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

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (

      <_E.Row className="inventory">

          <_E.Col>

            <h2 id="instruction">{ this.instructionMessage }</h2>

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
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button type="warning" onClick={this.clear}>Clear</_E.Button></_E.Col>
            </_E.Row>
                { !this.state.bEnterCoil ? this.renderEnterCoilAmount() : null }
                { this.state.bEnterCoil ? this.renderEnterButton() : null }
            <_E.Row>
              <_E.Col><_E.Demobox>{this.prompt}</_E.Demobox></_E.Col>
            </_E.Row>


            { this.state.bEnterCoil ? this.renderFillMachine() : null }

          </_E.Col>

            { !this.state.bEnterCoil ? this.renderProductInfo() : null }


          <_E.Button id="back" onClick={this.back}>Back</_E.Button>

          { this.state.bEnterCoil ? this.renderFillCoilButton() : null }

      </_E.Row>

    );

    /*

    <div class="inventory">

        <h2 id="instruction">{{ instructionMessage }}</h2>

        <div id="keypadStock">

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

    </div>


    */
  }

  renderEnterCoilAmount(){
    return(
      <_E.Row>
          <_E.Col basis="1/4"><_E.Button type="success" onClick={this.addStock}><Glyph icon="plus" /></_E.Button></_E.Col>
          <_E.Col basis="1/4"><_E.Button type="danger" onClick={this.removeStock}><Glyph icon="dash" /></_E.Button></_E.Col>
      </_E.Row>
    )
  }

  renderEnterButton() {
    return(
      <_E.Row>
        <_E.Col basis="1/3"><_E.Button type="primary" onClick={this.enter}>Enter</_E.Button></_E.Col>
      </_E.Row>
    )
  }

  renderFillMachine(){
    return(
      <_E.Col>
        <_E.Row>
          { this.state.bShowDropDownForMachines ? this.renderShowDropDownForMachines() : null }
            <_E.Button id="fillMachine" onClick={this.fillMachine}>{Translate.translate('Admin_Inventory', 'FillMachine')}</_E.Button>
            <p id="displayMachine">{Translate.translate('Admin_Inventory','FillAllCoilsForMachine')} { this.state.machineID + 1 }</p>
        </_E.Row>
      </_E.Col>
    )
  }

  renderShowDropDownForMachines() {
    return(
      <_E.FormSelect name="selectMachine" value={this.state.machineID} options={[{ label: 'Production', value: 'Production' }, { label: 'Certification', value: 'Certification'}]} />
    )
    /*<select id="selectMachine" data-ng-show="bShowDropDownForMachines"></select>*/
  }

  renderProductInfo() {
    return(
      <_E.Col>
          <img src={this.state.vpbc.imagePath} />
          <p>{this.state.vpbc.productName}</p>
          <p>Coil: {this.state.coilNumber} Stock Count: {this.state.vpbc.inventoryCount}</p>
      </_E.Col>
    )
  }

  renderFillCoilButton() {
    return(
        <img class="regularBtn" id="fillImg" src={Translate.localizedImage('Button_Fill.png')} onClick={this.fillCoil} />
    )
  }

}

export default Admin_Inventory
