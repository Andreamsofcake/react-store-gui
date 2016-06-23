import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import appConstants from '../constants/appConstants'

import AdminStore from '../stores/AdminStore'
import AdminActions from '../actions/AdminActions'
import StorefrontActions from '../actions/StorefrontActions'

import {
	emptyCart,
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

class AdminStorefrontData extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
		refreshingData: false,
    };

    this._onAdminStoreChange = this._onAdminStoreChange.bind(this);

  }
  
    // Add change listeners to stores
  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
  	AdminStore.addChangeListener(this._onAdminStoreChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	AdminStore.removeChangeListener(this._onAdminStoreChange);
  }
  
  _onAdminStoreChange(event) {
  	if (event.type === appConstants.STOREFRONT_DATA_REFRESHED) {
  		this.setState({
  			refreshingData: false
  		});
  		// refresh the client once this is done:
  		StorefrontActions.loadStorefrontData();
  	}
  }
  
  startRefresh(e) {
  	if (e) e.preventDefault();
	this.setState({
		refreshingData: true
	});
	AdminActions.refreshStorefrontData();
  }
  
  renderRefreshButton() {
  	if (!this.state.refreshingData) {
  		return ( <_E.Button type='primary' size="lg" onClick={this.startRefresh.bind(this)}>Refresh Store Data</_E.Button> );
  	}
  	return ( <p><em>refresh in progress, wait a moment please</em></p> );
  }

  render() {

    return (
      <_E.Row className="AdminStorefrontData" style={{width: '60%', margin: '1em auto', textAlign:'center'}}>
        <_E.Col>

        	<h1 style={{fontWeight:300}}>Refresh Storefront Data</h1>
        	
        	<p style={{fontSize: '1.3em'}}>
        	This function will pull in new Products, Categories, and Planogram
        	<br />(product setup grid) from the Client Portal for this machine.
        	<br /><br />
        	Please note that doing this can have an affect on
        	<br />physical placement of products,
        	<br />so be mindful of what you are doing.
        	</p>

			  <p style={{margin: '40px auto'}}>{' '}</p>
          
			  <_E.Row>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}></_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>{this.renderRefreshButton()}</_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}></_E.Col>
			  </_E.Row>
			  
			  <p style={{margin: '40px auto'}}>{' '}</p>
          
			  <_E.Row>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}></_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} /></_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}></_E.Col>
			  </_E.Row>

          </_E.Col>

      </_E.Row>
    );
  }
}

export default AdminStorefrontData
