import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../../actions/TsvActions'
import {
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

class AdminVms extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    //TsvSettingsStore.setSession('currentView', 'AdminVms');
  }
  
  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
  }

  render() {
    return (
      <_E.Row className="component" style={{maxWidth:'50%',margin: '0 auto'}}>
        <_E.Col>
			<h1 style={{fontWeight:300}}>Inventory Manager</h1>
			<p>
				<_E.Button size="lg" onClick={ () => { window.location.reload() } }>Restart GUI</_E.Button>
				<_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
			</p>
      	</_E.Col>
      </_E.Row>


    );
  }

}

export default AdminVms
