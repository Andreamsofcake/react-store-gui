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

class AdminVms extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //RootscopeActions.setSession('currentView', 'AdminVms');
  }
  
  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
  }

/*
  lastHeartbeatTime() {
    TsvActions.apiCall('lastHeartbeatTime', (err, lastBeat) => {
      this.setState({
        lastHeartbeatTime: lastBeat
      })
    });
  }

  heartBeatNow() {
    TsvActions.apiCall('heartBeatNow', () => {
      this.lastHeartbeatTime();
    });
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvActions.apiCall('enumerateComponents', (err, data) => {
       this.setState({ versionInfos: data })
    })
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }
*/

  render() {
    return (
      <_E.Row className="component" style={{maxWidth:'50%',margin: '0 auto'}}>
        <_E.Col>
          <_E.Button size="lg" onClick={ () => { window.location.reload() } }>Restart GUI</_E.Button>
          <_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
      	</_E.Col>
      </_E.Row>


    );
  }

}

export default AdminVms
