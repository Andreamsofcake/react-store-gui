import React, { Component } from 'react'
import { Link } from 'react-router'
//import './scss/App.scss'

import { isClient } from '../utils'

import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'
import * as _E from 'elemental'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'

import ComEmulator from './ComEmulator'
import CustomerStatusDisplay from './CustomerStatusDisplay'
import AdminLoginButton from './AdminLoginButton'

class App extends Component {
	
	constructor(props, context) {
		super(props, context);
		
		this.appTesting = true;
		
		TsvService.init();
		TsvService.registerKF();
		
		TsvService.fetchAllMachineSettings(null, function(err, data) {
			if (err) throw err;

			if (!data) {
				console.error('[fetchAllMachineSettings] no data returned');
				return;
			}
			
			RootscopeActions.setCache('machineSettings', data);

            if (data.MachineCount && data.MachineCount > 1) {
                RootscopeActions.setConfig('bDualMachine', true);
            }

			var currencyType = data.currencyFilter || 'currency';
			
			TsvService.setCurrencyFilterType(currencyType);

			RootscopeActions.setConfig('currencyFilter', function(model) {
				return $filter(currencyType)(model);
			});

		});

		TsvService.fetchAllCustomSettings(null, function(err, data) {
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
			RootscopeActions.setConfig('supportLanguages', data.languageSupported || 'En');
			RootscopeActions.setConfig('bDualLanguage', multipleLangs);
			RootscopeActions.setConfig('bShowLanguageFlag', multipleLangs);
			RootscopeActions.setConfig('bDisplayCgryNavigation2', data.bDisplayCgryNavigation || false);
			RootscopeActions.setConfig('selectedLanguage', LANG);
			Translate.selectLanguage(LANG);
		});

		TsvService.fetchMachineIds(null, function(err, data) {
			if (err) throw err;

			if (!data) {
				console.error('[fetchMachineIds] no data returned');
				return;
			}
			
			RootscopeActions.setCache('machineList', data);
		});
		
		RootscopeActions.setConfig('cgryNavTitle', Translate.translate('Category_Search', 'NavTitle'));

        TsvService.subscribe("notifyTSVReady", function() {
            console.log("Got event notifyTSVReady");
            if (RootscopeStore.getCache('currentLocation') === '/View0') {
                console.log("Redirect to default idle page or reload");

                if (!RootscopeStore.getCache('custommachinesettings')) {
                    TsvService.reloadPage();

                } else {
                    TsvService.registerKF();
                    TsvService.gotoDefaultIdlePage();
                }
            }
        }, "app");
        
        RootscopeActions.updateCredit();

	}
	
	logoClicked(e) {
		e.preventDefault();
		TsvService.gotoDefaultIdlePage();
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
