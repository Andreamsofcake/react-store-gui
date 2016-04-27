import React, { Component } from 'react'
import { Link } from 'react-router'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'

class Admin_Home extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

  }

  restart(){
      TsvActions.apiCall('restart');
      browserHistory.push("/view0");
  }

  shutdown(){
      TsvActions.apiCall('shutdown');
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
              <_E.Button type="primary" component={(<Link to="/Admin_Jofemar_Exerciser">{Translate.translate('Admin_Home','JofemarExerciser')}</Link>)} />
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
    )
  }
}

export default Admin_Home
