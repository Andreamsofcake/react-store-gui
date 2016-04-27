import React, { Component } from 'react'
import { Link } from 'react-router'
//import './scss/App.scss'

import { isClient } from '../utils'
import { updateCredit } from '../utils/TsvUtils'

//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import * as _E from 'elemental'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'

import ComEmulator from './ComEmulator'
import CustomerStatusDisplay from './CustomerStatusDisplay'
import AdminLoginButton from './AdminLoginButton'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	init,
	registerKF,
	gotoDefaultIdlePage
} from '../utils/TsvUtils'

import { foo } from '../utils/Test'

class App extends Component {
	
	constructor(props, context) {
		super(props, context);
		
		this.appTesting = true;
		
		console.log('App Top');
		foo();
		//console.log( RootscopeStore.getShowCredit() );
		
		init();
		registerKF();
		
		TsvActions.apiCall('fetchAllMachineSettings', (err, data) => {
			if (err) throw err;

			if (!data) {
				console.error('[fetchAllMachineSettings] no data returned');
				return;
			}
			
			if (!data.currencyFilter) { data.currencyFilter = 'currency'; }
			
			RootscopeActions.setCache('machineSettings', data);

            if (data.MachineCount && data.MachineCount > 1) {
                RootscopeActions.setConfig('bDualMachine', true);
            }

		});

		TsvActions.apiCall('fetchAllCustomSettings', (err, data) => {
			if (err) throw err;
			
			if (!data) {
				console.error('[fetchAllCustomSettings] no data returned');
				return;
			}

			var multipleLangs = (data.languageSupported && data.languageSupported.split(";").length > 1)
				, LANG = data.languageDefaulted || 'En'
				;

			// this skips the 0-9 keypad coil view:
			data.txtSearchScene = 'category_search';

			RootscopeActions.setCache('custommachinesettings', data);
			RootscopeActions.setConfig({
				supportLanguages: data.languageSupported || 'En',
				bDualLanguage: multipleLangs,
				bShowLanguageFlag: multipleLangs,
				bDisplayCgryNavigation2: data.bDisplayCgryNavigation || false,
				selectedLanguage: LANG
			});
			Translate.selectLanguage(LANG);
		});

		TsvActions.apiCall('fetchMachineIds', (err, data) => {
			if (err) throw err;

			if (!data) {
				console.error('[fetchMachineIds] no data returned');
				return;
			}
			
			RootscopeActions.setCache('machineList', data);
		});
		
		//RootscopeActions.setConfig('cgryNavTitle', Translate.translate('Category_Search', 'NavTitle'));

        updateCredit();
        
        this._onTsvChange = this._onTsvChange.bind(this);

	}
	
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
        //TsvService.subscribe("notifyTSVReady", function, "app");
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method === 'notifyTSVReady') {
			console.log("Got event notifyTSVReady");
			if (RootscopeStore.getCache('currentLocation') === '/View0') {
				console.log("Redirect to default idle page or reload");

				if (!RootscopeStore.getCache('custommachinesettings')) {
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

		return (
			<div>{/* style={{maxWidth: '48em', margin: '0 auto'}}*/}
			<AdminLoginButton testing={this.appTesting} />
			<CustomerStatusDisplay />
			<ComEmulator />
			<_E.Row gutter={-20}>
				<_E.Col className="route-content">
					{this.props.children && React.cloneElement(this.props.children, { appTesting: this.appTesting }) || (<div>
						<_E.Button component={(<Link to="/Storefront">Storefront</Link>)} />
						</div>)}
				</_E.Col>
			</_E.Row>
			</div>
		)
	}
}

export default App;
