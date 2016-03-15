import React, { Component } from 'react'
import { Link } from 'react-router'
//import './scss/App.scss'

import { isClient } from '../utils'

import TsvService from '../lib/TsvService'
import { * } as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'

class App extends Component {
	
	construct(props, context) {
		super(props, context);
		
		TsvService.registerKF();
		
		TSVService.fetchAllMachineSettings(null, function(err, data) {
			if (err) throw err;
			RootscopeActions.setCache('machineSettings', data);

            if (data.MachineCount && data.MachineCount > 1) {
                RootscopeActions.setConfig('bDualMachine', true);
            }

			var currencyType = data.currencyFilter || 'currency';
			
			TSV.setCurrencyFilterType(currencyType);

			RootscopeActions.setConfig('currencyFilter', function(model) {
				return $filter(currencyType)(model);
			});

		});

		TSVService.fetchAllCustomSettings(null, function(err, data) {
			if (err) throw err;
			
			var multipleLangs = (data.languageSupported && data.languageSupported.split(";").length > 1)
				, LANG = data.languageDefaulted || 'En'
				;
			
			RootscopeActions.setCache('custommachinesettings', data);
			RootscopeActions.setConfig('supportLanguages', data.languageSupported || 'En');
			RootscopeActions.setConfig('bDualLanguage', multipleLangs);
			RootscopeActions.setConfig('bShowLanguageFlag', multipleLangs);
			RootscopeActions.setConfig('bDisplayCgryNavigation2', data.bDisplayCgryNavigation || false);
			RootscopeActions.setConfig('selectedLanguage', LANG);
			Translate.selectLanguage(LANG);
		});

		TSVService.fetchMachineIds(null, function(err, data) {
			if (err) throw err;
			RootscopeActions.setCache('machineList', data);
		});
		
		RootscopeActions.setConfig('cgryNavTitle', Translate.translate('Category_Search', 'NavTitle'));

        TSVService.subscribe("notifyTSVReady", function() {
            console.log("Got event notifyTSVReady");
            if (RootscopeStore.getCache('currentLocation') === '/view0') {
                console.log("Redirect to default idle page or reload");

                if (TSVService.cache.custommachinesettings === undefined) {
                    TsvService.reloadPage();

                } else {
                    TsvService.registerKF();
                    TSVService.gotoDefaultIdlePage();
                }
            }
        }, "app");
        
        RootscopeActions.updateCredit();

	}
	
	logoClicked(e) {
		e.preventDefault();
		TSVService.gotoDefaultIdlePage();
	}
	
	render() {

		return (
			<div>
				<div className="row route-content">
					<div className="large-11 columms">
					{this.props.children}
					</div>
				</div>
			</div>
		)
	}
}

export default App;
