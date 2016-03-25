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
    this.state = {
      versionInfos: TsvService.enumerateComponents()
    }

  }

  back(){
    browserHistory.push("/Admin_Home")
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="check_faults">

          <select id="selectMachine" data-ng-show="bShowDropDownForMachines"></select>

          <img className="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

          <_E.Row id="wrapper">

              <table className="faults">

                  <tr className="faults">
                      <th className="faults">{{translate("FaultCode")}}</th>
                      <th className="faults">{{translate("EventID")}}</th>
                      <th className="faults">{{translate("Description")}}</th>
                  </tr>

                  <tr className="faults" ng-repeat='fault in faults'>
                      <td className="faults">{{ fault.faultCode }}</td>
                      <td className="faults">{{ fault.vmsEventID }}</td>
                      <td style="word-break: break-all" className="faults">{{ fault.faultDescription }}</td>
                  </tr>

              </table>

          </_E.Row>

          <button data-ng-click="clearFaults()">{{translate("Clear")}}</button>

      </div>

    );
    /*
    <div class="check_faults">

        <select id="selectMachine" data-ng-show="bShowDropDownForMachines"></select>

        <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

        <div id="wrapper">

            <table class="faults">

                <tr class="faults">
                    <th class="faults">{{translate("FaultCode")}}</th>
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
