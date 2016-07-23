import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import appConstants from '../../constants/appConstants'
import TsvStore from '../../stores/TsvStore'
import TsvActions from '../../actions/TsvActions'
import {
	emptyCart,
	KillGuiTimer,
	GuiTimer
} from '../../utils/TsvUtils'

class AdminHome extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
	this.state = {
		machineInfo: TsvStore.getMachineInfo()
	}
	this._onTsvStoreChange = this._onTsvStoreChange.bind(this);

    //TsvSettingsStore.setSession('currentView', 'AdminBillAcceptor');
    TsvActions.apiCall('disableLoginDevices');
    emptyCart();
  }

  restart(){
      TsvActions.apiCall('restart');
      browserHistory.push("/View0");
  }

  shutdown(){
      TsvActions.apiCall('shutdown');
  }

  // Add change listeners to stores
  componentDidMount() {
	KillGuiTimer();
	TsvStore.addChangeListener(this._onTsvStoreChange);
	if (!this.state.machineInfo) {
		TsvActions.getMachineInfo();
	}
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }
  
  _onTsvStoreChange(event) {
  	if (event.type === appConstants.MACHINE_INFO) {
  		this.setState({
  			machineInfo: TsvStore.getMachineInfo()
  		});
  	}
  }

  render() {
    return (
      <_E.Row className="admin_home" style={{maxWidth:'85%',margin: '1em auto'}}>
        <_E.Col>
        	
		  <h1 style={{fontWeight:300}}>Admin Home</h1>
		  
		  {this.state.machineInfo ? (
		  	<p style={{textAlign:'center'}}>
		  		Team Viewer ID: <strong>{this.state.machineInfo.teamViewerID}</strong><br />
		  		Machine ID: <strong>{this.state.machineInfo._id}</strong><br />
		  		AVT ID: <strong>{this.state.machineInfo.vendor_id}</strong>
		  	</p>
		  ) : (
		  	<p>Loading machine info, one moment please....</p>
		  )}

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'right'}}><_E.Button type="primary" size="lg" component={(<Link to="/Admin/StorefrontData">Storefront Data</Link>)} /></_E.Col>
              <_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'left'}}><_E.Button type="primary" size="lg" component={(<Link to="/Admin/Inventory2">{Translate.translate('AdminHome','Inventory')}</Link>)} /></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'right'}}><_E.Button type="primary" size="lg" component={(<Link to="/Admin/PrintRegistry">Employee Print Registry</Link>)} /></_E.Col>
              <_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'left'}}><_E.Button type="primary" size="lg" component={(<Link to="/Admin/JofemarExerciser">Test Vend</Link>)} /></_E.Col>{/*Translate.translate('AdminHome','JofemarExerciser')*/}
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'right'}}></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button type="primary" size="lg" component={(<Link to="/Storefront">Back to Storefront / Shopping</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'left'}}></_E.Col>
          </_E.Row>

          <_E.Row><p style={{margin: '3em', borderBottom: '4px solid #1571E1', width: '100%'}}>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'right'}}><_E.Button type="primary" component={(<Link to="/Admin/AutoMap">{Translate.translate('AdminHome','AutoMap')}</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button type="primary" component={(<Link to="/Admin/CheckFaults">{Translate.translate('AdminHome','CheckFaults')}</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'left'}}><_E.Button type="primary" component={(<Link to="/Admin/ComponentControl">{Translate.translate('AdminHome','ComponentControl')}</Link>)} /></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'right'}}><_E.Button type="primary" component={(<Link to="/Admin/PrintReaderTest">{Translate.translate('AdminHome','PrintReaderTest')}</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button type="primary" component={(<Link to="/Admin/BillAcceptor">{Translate.translate('AdminHome','BillAcceptor')}</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'left'}}><_E.Button type="primary" component={(<Link to="/Admin/CardScanTest">Test Card Scanner</Link>)} /></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'right'}}><_E.Button type="primary" component={(<Link to="/Admin/Vms">GUI Manager</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button type="primary" component={(<Link to="/Admin/SystemInfo">{Translate.translate('AdminHome','SystemInfo')}</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'left'}}><_E.Button type="primary" component={(<Link to="/Admin/Settings">{Translate.translate('AdminHome','MachineSettings')}</Link>)} /></_E.Col>
          </_E.Row>

          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row><p>{' '}</p></_E.Row>
          <_E.Row>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'right'}}><_E.Button onClick={this.restart}>Restart TSV</_E.Button></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button component={(<Link to="/Admin/Activate">{Translate.translate('AdminHome','Activate')}</Link>)} /></_E.Col>
              <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'left'}}><_E.Button onClick={this.shutdown}>Shutdown TSV</_E.Button></_E.Col>
          </_E.Row>


        </_E.Col>
      </_E.Row>
    )
  }
}

export default AdminHome
