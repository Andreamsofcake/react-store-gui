import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'

class Admin_Auto_Map extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Admin_Auto_Map');
    RootscopeActions.setSession('bRunningAutoMap', false);

    this.state = {
      bShowMachine2 : false,
      status: "",
      coilMap:[]
    }

    if(RootscopeStore.getCache('machineList').length > 1){
        this.state.bShowMachine2 = true;
    }
	this._onTsvChange = this._onTsvChange.bind(this);
  }


  backToAdminHome() {
    browserHistory.push("/Admin_Home");
  }

  mapMachine(machineID){

    if(!RootscopeStore.getSession('bRunningAutoMap'){
        RootscopeActions.setSession('bRunningAutoMap', true);
        TsvActions.apiCall('runAutoMap', machineID, -1);
        this.setState({
          coilMap: []
        })
    }
  }


  // Add change listeners to stores
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
        //TsvService.subscribe("notifyTSVReady", function, "app");
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method === 'notifyMapStatusChange') {

			let status = event.data[0];
			let info = event.data[1];
			let state = {
				status: status
			}

			switch(status){
				case "Map":
					let coilMap = this.state.coilMap;
					if (this.state.coilMap.indexOf(info.coilNumber) == -1) {
						state.coilMap = coilMap.push(info.coilNumber);
					}
					break;
				case "End":
					RootscopeActions.setSession('bRunningAutoMap', false);
					break;
				default:
					break;
			}
			this.setState(state);
		}
	}

  render() {
    return (
      <_E.Row class="automap">
        <_E.Col>
          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />

          <h2>{this.state.status}</h2>

          <_E.Row>
            <_E.Col>
              <_E.Row>
                  <_E.Col basis="1/2"><_E.Button id="machine0"  onClick={this.mapMachine.bind(this, 0)}>{Translate.translate('Admin_Auto_Map','Map1')}</_E.Button></_E.Col>

                  { this.state.bShowMachine2 ? this.renderShowMachine2() : null }

              </_E.Row>
            </_E.Col>
          </_E.Row>
          <_E.Row id="wrapper">
              {JSON.stringify(this.state.coilMap)}
          </_E.Row>
        </_E.Col>
      </_E.Row>


    );

  }

  renderShowMachine2() {
    return(
      <_E.Col basis="1/2"><_E.Button id="machine1" onClick={this.mapMachine.bind(this, 1)}>{Translate.translate('Admin_Auto_Map','Map2')}</_E.Button></_E.Col>
    )
  }

}

export default Admin_Auto_Map
