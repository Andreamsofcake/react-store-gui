import React, { Component } from 'react'
import { Link } from 'react-router'
//import './scss/App.scss'

import { isClient } from '../utils'

//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import * as _E from 'elemental'

import TsvSettingsStore from '../stores/TsvSettingsStore'

import ComEmulator from './ComEmulator'
import MachineIdTag from './MachineIdTag'
import CustomerStatusDisplay from './CustomerStatusDisplay'
import AdminLoginButton from './AdminLoginButton'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import StorefrontActions from '../actions/StorefrontActions'

import {
	init,
	registerKF,
	gotoDefaultIdlePage,
	updateCredit
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('App');

class App extends Component {
	
	constructor(props, context) {
		super(props, context);
		
		this.appTesting = true;
		
		Big.log('App Top');
		
		init();
		registerKF();
		
		StorefrontActions.loadStorefrontData();
		
		TsvActions.apiCall('fetchAllMachineSettings', (err, data) => {
			if (err) Big.throw(err);

			if (!data) {
				Big.error('fetchAllMachineSettings: no data returned');
				return;
			}
			
			if (!data.currencyFilter) { data.currencyFilter = 'currency'; }
			
			TsvSettingsStore.setCache('machineSettings', data);

            if (data.MachineCount && data.MachineCount > 1) {
                TsvSettingsStore.setConfig('bDualMachine', true);
            }

		});

		TsvActions.apiCall('fetchAllCustomSettings', (err, data) => {
			if (err) Big.throw(err);
			
			if (!data) {
				Big.error('fetchAllCustomSettings: no data returned');
				return;
			}

			var multipleLangs = (data.languageSupported && data.languageSupported.split(";").length > 1)
				, LANG = data.languageDefaulted || 'En'
				;

			// this skips the 0-9 keypad coil view:
			data.txtSearchScene = 'category_search';

			TsvSettingsStore.setCache('custommachinesettings', data);
			TsvSettingsStore.setConfig({
				supportLanguages: data.languageSupported || 'En',
				bDualLanguage: multipleLangs,
				bShowLanguageFlag: multipleLangs,
				bDisplayCgryNavigation2: data.bDisplayCgryNavigation || false,
				selectedLanguage: LANG
			});
			Translate.selectLanguage(LANG);
		});

		TsvActions.apiCall('fetchMachineIds', (err, data) => {
			if (err) Big.throw(err);

			if (!data) {
				Big.error('fetchMachineIds: no data returned');
				return;
			}
			
			TsvSettingsStore.setCache('machineList', data);
		});
		
		//TsvSettingsStore.setConfig('cgryNavTitle', Translate.translate('CategorySearch', 'NavTitle'));

        updateCredit();
        
        this._onTsvChange = this._onTsvChange.bind(this);

	}
	
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
		if (!TsvStore.getMachineInfo()) {
			TsvActions.getMachineInfo();
		}
        //TsvService.subscribe("notifyTSVReady", function, "app");
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method === 'notifyTSVReady') {
			Big.log("Got event notifyTSVReady, what is our current location? " + TsvSettingsStore.getCache('currentLocation'));
			if (TsvSettingsStore.getCache('currentLocation') === '/View0') {
				Big.log("Redirect to default idle page or reload");

				if (!TsvSettingsStore.getCache('custommachinesettings')) {
					//TsvService.reloadPage();
					window.location.reload();

				} else {
					registerKF();
					gotoDefaultIdlePage();
				}
			}
		}
	}
	
	logoClicked(e) {
		e.preventDefault();
		gotoDefaultIdlePage();
	}
	
	render() {
		let adminInPath = /^\/Admin/.test(this.props.location.pathname);
		return (
			<div>{/* style={{maxWidth: '48em', margin: '0 auto'}}*/}
			{!adminInPath ? (
				<AdminLoginButton testing={this.appTesting} />
				) : null}
			<CustomerStatusDisplay testing={this.appTesting} adminInPath={adminInPath} location={this.props.location} />
			
			<ComEmulator />
			<MachineIdTag />
			<_E.Row gutter={-20}>
				<_E.Col className="route-content">
					{this.props.children && React.cloneElement(this.props.children, { appTesting: this.appTesting }) || (<div>
						<_E.Button component={(<Link to="/Storefront">Storefront</Link>)} />
						</div>)}
				</_E.Col>
			</_E.Row>
			{/*<pre>{JSON.stringify(this.props.location, null, 4)}</pre>*/}
			</div>
		)
	}
}

export default App;
