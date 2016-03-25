import React, { Component } from 'react'
import { Link } from 'react-router'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Home extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Admin_Home');

  }


  restart(){
      TsvService.restart();
      browserHistory.push("/view0");
  }

  shutdown(){
      TsvService.shutdown();
  }


  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row class="admin_home">
        <_E.Col>

              <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />


              <_E.Button type="primary" component={(<Link to="/Admin_Inventory">{Translate.translate('Admin_Home','Inventory')}</Link>)} />


              <_E.Button type="primary" component={(<Link to="/Admin_System_Info">{Translate.translate('Admin_Home','SystemInfo')}</Link>)} />

              {/*<_E.Button onClick={this.jofemarExerciser}>

                  {Translate.translate('Admin_Home','JofemarExerciser')}

              </_E.Button>*/}


              <_E.Button type="primary" component={(<Link to="/Admin_Settings">{Translate.translate('Admin_Home','MachineSettings')}</Link>)} />


              <_E.Button type="primary" component={(<Link to="/Admin_Vms">{Translate.translate('Admin_Home','Vms')}</Link>)} />


              <_E.Button type="primary" component={(<Link to="/Admin_Auto_Map">{Translate.translate('Admin_Home','AutoMap')}</Link>)} />


              <_E.Button type="primary" component={(<Link to="/Admin_Check_Faults">{Translate.translate('Admin_Home','CheckFaults')}</Link>)} />


              <_E.Button onClick={this.restart}>

                  {Translate.translate('Admin_Home','Restart')}

              </_E.Button>

              <_E.Button onClick={this.shutdown()}>

                  {Translate.translate('Admin_Home','ShutDown')}

              </_E.Button>
        </_E.Col>
      </_E.Row>
  }
    /*

    <div class="admin_home">

            <figure data-ng-click="backhome()">

                <img src="../Images/home.png" alt = "Home">

                <figcaption>{{translate('Admin_Home','Home')}}</figcaption>

            </figure>

            <figure data-ng-click="inventory()">

                <img src="../Images/inventory.png" alt="INVENTORY">

                <figcaption>{{translate('Inventory')}}</figcaption>

            </figure>

            <figure data-ng-click="systemInfo()">

                <img src="../Images/system.png" alt="SYSTEM">

                <figcaption>{{translate('SystemInfo')}}</figcaption>

            </figure>

            <figure data-ng-click="jofemarExerciser()">

                <img src="../Images/jofemar.png" alt="JOFEMAR">

                <figcaption>{{translate('JofemarExerciser')}}</figcaption>

            </figure>

            <figure data-ng-click="machineSettings()">

                <img src="../Images/componentControl.png" alt="MACHINE SETTINGS">

                <figcaption>{{translate('MachineSettings')}}</figcaption>

            </figure>

            <figure data-ng-click="vms()">

                <img src="../Images/vms.png" alt="VMS">

                <figcaption>{{translate('Vms')}}</figcaption>

            </figure>

            <figure data-ng-click="autoMap()">

                <img src="../Images/autoMap.png" alt="AUTO MAP">

                <figcaption>{{translate('AutoMap')}}</figcaption>

            </figure>

            <figure data-ng-click="checkFaults()">

                <img src="../Images/checkFaults.png" alt="CHECK FAULTS">

                <figcaption>{{translate('CheckFaults')}}</figcaption>

            </figure>

            <figure data-ng-click="restart()">

                <img src="../Images/restart.png" alt="RESTART">

                <figcaption>{{translate('Restart')}}</figcaption>

            </figure>

            <figure data-ng-click="shutdown()">

                <img src="../Images/shutdown.png" alt="SHUTDOWN">

                <figcaption>{{translate('ShutDown')}}</figcaption>

            </figure>

    </div>

    */
}

export default Admin_Home
