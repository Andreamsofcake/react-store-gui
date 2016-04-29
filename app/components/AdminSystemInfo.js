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

class System_Info extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
    	versionInfos: null
    }
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvActions.apiCall('enumerateComponents', (err, data) => {
    	console.log('enumerateComponents');
    	console.log(data);
       this.setState({ versionInfos: data })
    })
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
  	if (!this.state.versionInfos) {
  		return (
  			<h2>Loading, one moment please...</h2>
  		);
  	}
    return (
      <_E.Row className="systemInfo" style={{maxWidth:'50%',margin: '0 auto'}}>
        <_E.Col>
        	<h1 style={{fontWeight:300}}>System Info</h1>
        </_E.Col>
        <_E.Col>
          <_E.Row >
            <_E.Col>
              {this.state.versionInfos ? this.state.versionInfos.map((versionInfo, $index) => {
                  return (
                    <_E.Row key={$index}>
                      <_E.Col basis="1/2">{ versionInfo.name }</_E.Col>
                      <_E.Col basis="1/2">{ versionInfo.versionString }</_E.Col>
                    </_E.Row>
                  )}
                ) : null}
            </_E.Col>
          </_E.Row>
        </_E.Col>
        <_E.Col>
          <_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
        </_E.Col>
      </_E.Row>

    );
  }

}

export default System_Info
