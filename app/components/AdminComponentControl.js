import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('AdminComponentControl');

class AdminComponentControl extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
      versionInfos: null
    }

  }

  restartGUI() {
    if (typeof window !== 'undefined') {
	    window.location.reload();
	} else {
		Big.error('cannot reset GUI, I have no window???');
	}
  }

  back(){
    browserHistory.push("/Admin/Home")
  }

  // Add change listeners to stores
  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
	TsvActions.apiCall('enumerateComponents', (err, data) => {
      if (err) Big.throw(err);
      Big.log('enumerateComponents called back.... data:');
      Big.log(data);
      this.setState({
      	versionInfos: data
      });
	});
  }

  lastHeartbeatTime(e) {
  	if (e) { e.preventDefault(); }
  	startGeneralIdleTimer(this.props.location.pathname);
	TsvActions.apiCall('lastHeartbeatTime', (err, lastBeat) => {
		Big.log('lastHeartbeatTime ok, what does this look like?');
		Big.log(lastBeat);
		if (lastBeat && typeof lastBeat === 'object') {
			lastBeat = lastBeat.heartbeatTime;
		}
		this.setState({
		  lastHeartbeatTime: lastBeat
		})
	});
  }

  heartBeatNow(e) {
  	e.preventDefault();
    TsvActions.apiCall('heartBeatNow', (err, lastBeat) => {
    	if (lastBeat && typeof lastBeat === 'object') {
    		lastBeat = lastBeat.heartbeatTime;
    	}
		this.lastHeartbeatTime(null);
    });
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="vms" style={{maxWidth:'50%',margin: '1em auto'}}>
        	<h1 style={{fontWeight:300}}>Component Control</h1>
        <_E.Col>
          <p>
          <_E.Button onClick={this.heartBeatNow.bind(this)}>{/*Translate.translate('AdminComponentControl','HeartBeatNow')*/}Send Heartbeat</_E.Button>
          {' '}
          <_E.Button onClick={this.lastHeartbeatTime.bind(this)}>{/*Translate.translate('AdminComponentControl','LastHeartBeatTime')*/}Get Last Heartbeat</_E.Button>
          </p>
          
              <p>{' '}</p>
              <p style={{fontSize:'1.3em'}}>Last heartbeat: {this.state.lastHeartbeatTime || 'not retrieved yet'}</p>

	          {this.renderVersionInfos()}

          <_E.Button type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
        </_E.Col>
      </_E.Row>


    );

  }
  
  renderVersionInfos() {
  	if (!this.state.versionInfos || !this.state.versionInfos.length) {
  		return (
  			<h2>Loading version info, one moment please...</h2>
  		);
  	}
	var stuff = this.state.versionInfos.map((foo, $index) => {
			return (
			  <p key={$index}>{foo.name}: {foo.versionString} (built on: {foo.buildDate})</p>
			)
		}
	  );
	return stuff;
  	
  }

}

export default AdminComponentControl
