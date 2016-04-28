import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import * as _E from 'elemental'

import { Link, browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'

class AdminAutoMap extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

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
    browserHistory.push("/Admin/Home");
  }

  mapMachine(machineID){
    if (!RootscopeStore.getSession('bRunningAutoMap')) {
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
        RootscopeActions.setSession('bRunningAutoMap', false);
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
		RootscopeActions.setSession('bRunningAutoMap', false);
	}
	
	_onTsvChange(event) {
		if (event && event.method === 'notifyMapStatusChange') {

			let status = event.data[0];
			let info = event.data[1];
			let state = {
				status: status
			}

			switch (status) {
				case "Map":
					let coilMap = this.state.coilMap || [];
					if (this.state.coilMap.indexOf(info.coilNumber) == -1) {
						state.coilMap = coilMap.push(info.coilNumber);
					}
					break;

				case "End":
					RootscopeActions.setSession('bRunningAutoMap', false);
					console.warn('ok, should be pushing this coil map back out to the API!');
					console.log(this.state.coilMap);
					break;

				default:
					break;
			}
			this.setState(state);
		}
	}

  render() {
    return (
      <_E.Row className="automap" style={{maxWidth:'50%',margin: '1em auto'}}>

        	<h1 style={{fontWeight:300}}>Auto Map</h1>

        <_E.Col>
          <_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />

          <h2>{this.state.status}</h2>

          <_E.Row>
            <_E.Col>
              <_E.Row>
                  <_E.Col basis="1/2"><_E.Button size="lg" id="machine0"  onClick={this.mapMachine.bind(this, 0)}>{Translate.translate('AutoMap','Map1')}</_E.Button></_E.Col>

                  { this.state.bShowMachine2 ? this.renderShowMachine2() : null }

              </_E.Row>
            </_E.Col>
          </_E.Row>

          <_E.Row id="wrapper">
          	<p style={{marginTop:'3em',clear:'both'}}>Coil map:</p>
            <pre>{JSON.stringify(this.state.coilMap, null, 4)}</pre>
          </_E.Row>
        </_E.Col>
      </_E.Row>


    );

  }

  renderShowMachine2() {
    return(
      <_E.Col basis="1/2"><_E.Button size="lg" id="machine1" onClick={this.mapMachine.bind(this, 1)}>{Translate.translate('AutoMap','Map2')}</_E.Button></_E.Col>
    )
  }

}

export default AdminAutoMap
