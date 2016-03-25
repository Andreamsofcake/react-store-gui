import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Check_Faults extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    RootscopeActions.setSession('currentView', 'Admin_Check_Faults');
    RootscopeActions.setCache('currentLocation', '/Admin_Check_Faults');
    this.state = {
      bRunningClearFaults: false,
      machineID: 0,
      faults: TsvService.getFaultCodes(this.state.machineID.toString())
    }
    if (RootscopeStore.getCache('machineList').length > 1) {
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
          document.getElementById('selectMachine').onchange = function () {
              $scope.machineID = document.getElementById("selectMachine").selectedIndex;
              $scope.faults = TSVService.getFaultCodes($scope.machineID.toString());
              //document.getElementById("displayFaults").innerHTML = "Fill All coils for machine "+$scope.machineID.toString();
          };
      */
      this.setState({
        bShowDropDownForMachines: true,
      })
    }

  }

  back(){
    browserHistory.push("/Admin_Home")
  }

  clearFaults(){
      if(!this.state.bRunningClearFaults){
        this.setState({
          bRunningClearFaults:true
        })
        TsvService.clearMachineFaults(this.state.machineID.toString());
      }
  }

  // Add change listeners to stores
  componentDidMount() {

      TsvService.subscribe("notifyResetComplete", (machineID) => {
        this.setState({
          bRunningClearFaults: false,
          faults = TsvService.getFaultCodes(machineID.toString())
        })
      }, "app.checkFaults");
  }

  // Remove change listers from stores
  componentWillUnmount() {

    TsvService.unsubscribe("notifyResetComplete", "app.checkFaults");

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

          <_E.Button id="back" onClick={this.back}>Back</_E.Button>

          <_E.Row id="wrapper">

              <_E.Col>

                  <_E.Row className="faults">
                      <_E.Col basis="1/3" className="faults">{Translate.translate('Admin_Check_Faults', 'FaultCode')}</_E.Col>
                      <_E.Col basis="1/3" className="faults">{Translate.translate('Admin_Check_Faults','EventID')}</_E.Col>
                      <_E.Col basis="1/3" className="faults">{Translate.translate('Admin_Check_Faults','Description')}</_E.Col>
                  </_E.Row>

                  {this.state.faults.map((fault, $index) => {
                      return (
                        <_E.Row key={$index}>
                          <_E.Col basis="1/3" className="faults">{ fault.faultCode }</_E.Col>
                          <_E.Col basis="1/3" className="faults">{ fault.vmsEventID }</_E.Col>
                          <_E.Col basis="1/3" className="faults">{ fault.faultDescription }</_E.Col>
                        </_E.Row>
                      )}
                    )}

              </_E.Col>

          </_E.Row>

          <_E.Button type="warning" onClick={this.clearFaults}>{Translate.translate('Admin_Check_Faults','Clear')}</_E.Button>

      </div>

    );
    /*
    <div class="check_faults">

        <select id="selectMachine" data-ng-show="bShowDropDownForMachines"></select>

        <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

        <div id="wrapper">

            <table class="faults">

                <tr class="faults">
                    <_E.Col class="faults">{{translate("FaultCode")}}</_E.Col>
                    <th class="faults">{{translate("EventID")}}</th>
                    <th class="faults">{{translate("Description")}}</th>
                </tr>

                <tr class="faults" ng-repeat='fault in faults'>
                    <td class="faults">{{ fault.faultCode }}</td>
                    <td class="faults">{{ fault.vmsEventID }}</td>
                    <td style="word-break: break-all" class="faults">{{ fault.faultDescription }}</td>
                </tr>

            </table>

        </div>

        <button data-ng-click="clearFaults()">{{translate("Clear")}}</button>

    </div>
    */
  }

}

export default Admin_Check_Faults
