import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import * as _E from 'elemental'

import { Link, browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

class AdminAutoMap extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
      bShowMachine2 : false,
      status: "Idle",
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
        	status: 'Starting AutoMap',
			coilMap: [],
			slots: [],
			lastSlot: null
        })
    }
  }


  // Add change listeners to stores
	componentDidMount() {
		startGeneralIdleTimer(this.props.location.pathname);
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
					if (info && info.coilNumber) {
						let coilMap = this.state.coilMap || [];
						let slots = this.state.slots || [];
						console.warn('ok wtf is coilMap? '+typeof coilMap);
						console.log(coilMap);
						if (coilMap.indexOf(info.coilNumber) === -1) {
							coilMap.push(info.coilNumber);
							state.coilMap = coilMap;
							slots.push(info);
							state.slots = slots;
							state.lastSlot = info;
						}
					}
					break;

				case "End":
					// invariant! dang it
					setTimeout(() => {
						RootscopeActions.setSession('bRunningAutoMap', false);
					}, 150);
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

          <_E.Row>
			  <_E.Col md="33%" lg="33%"><_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} /></_E.Col>
			  <_E.Col md="33%" lg="33%"><_E.Button size="lg" id="machine0"  onClick={this.mapMachine.bind(this, 0)}>{Translate.translate('AutoMap','Map1')}</_E.Button></_E.Col>
			  <_E.Col md="33%" lg="33%">{ this.state.bShowMachine2 ? this.renderShowMachine2() : null }</_E.Col>
          </_E.Row>

          <h2>Map status: {this.state.status}</h2>

          <_E.Row id="wrapper">
          	{this.renderMap()}
          </_E.Row>
        </_E.Col>
      </_E.Row>


    );

  }

  renderMap() {
  	
  	if (this.state.status == 'End') {
  		return (
			<div>
			<_E.Row>
				{this.renderMapRows()}
			</_E.Row>

          	<p style={{marginTop:'3em',clear:'both'}}>Slots:</p>
            <pre>{JSON.stringify(this.state.slots, null, 4)}</pre>
            </div>
  		);
  	} else if (this.state.status) {
  		var rnd = parseInt(Math.random() * 10)
  			, dots = ''
  			;
  		for (var i=1;i<rnd;i+=1) { dots += '.'; }
  		return (
  			<div>
  				<h3>Mapping in progress{dots}</h3>
  				<p>Last status: {this.state.status}</p>
			<_E.Row>
				{this.renderMapRows()}
			</_E.Row>
  			</div>
  		);
  	} else {
  		return (
  			<div>
  				<h3>Mapping Process Idle</h3>
  			</div>
  		);
  	}
  }
  
  renderMapRows() {
  	var mapRows = this.parseGrid(this.state.coilMap);
  	if (!mapRows || !mapRows.length) {
  		return (
  			<p><em>No map rows found</em></p>
  		);
  	}
  	 var rows = mapRows.map((row, $index) => {
          var width = 100/row.length
              var col = row.map((slot, $index) => {
                return (
                  <_E.Col key={$index} md={width+"%"} lg={width+"%"}>
                  	<div style={{width: '100%', borderRadius: '4px', border: '2px solid black', margin: '1em', padding: '0.5em', textAlign: 'center'}}>
	                    {slot}
	                </div>
                  </_E.Col>
                )
              })
              return col
            }
        )
    return rows;
  }

// borrowed from ClientPortal/PlanogramBuilder:
   parseGrid(coilMap){
        var slots = coilMap;
        var rows = [];
     slots.map( function(NODE) {
       var thisRow = parseInt(NODE / 10)
         , thisCol = NODE % 10 // not sure if we need this
         ;
       if (!rows[thisRow]) { rows[thisRow] = []; }
       rows[thisRow].push( NODE );
      });
      return rows;
      /*
      var state = this.state;
      state.slots = slots;
      state.rows = rows;
      state.pSlotConfig = data;
      state.planogram.planogramSlotConfiguration = data._id;
      this.setState(state);
      */
   }

  renderShowMachine2() {
    return(
      <_E.Col basis="1/2"><_E.Button size="lg" id="machine1" onClick={this.mapMachine.bind(this, 1)}>{Translate.translate('AutoMap','Map2')}</_E.Button></_E.Col>
    )
  }

}

export default AdminAutoMap
