import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
//import RootscopeActions from '../actions/RootscopeActions'

import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

var CustomerLoginActions = {

	scanPrint(loginToken, simulatorPrintCustomer) {
		SocketAPI.send('activate-module',
			{ action: 'scan-print', module: 'print-scanner', gui: 'login', loginToken, simulatorPrintCustomer },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.PRINT_SCANNED_LOGIN,
					data: data
				});
			}
		);
	},

	scanLicense(loginToken, simulatorLicenseName) {
		SocketAPI.send('activate-module',
			{ action: 'scan-license', module: 'license-scanner', gui: 'login', loginToken, simulatorLicenseName },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.LICENSE_SCANNED_LOGIN,
					data: data
				});
			}
		);
	},

	swipeLicense(loginToken, simulatorLicenseName) {
		SocketAPI.send('activate-module',
			{ action: 'swipe-license', module: 'license-scanner', gui: 'login', loginToken, simulatorLicenseName },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.LICENSE_SWIPED_LOGIN,
					data: data
				});
			}
		);
	},

	dipLicense(loginToken, simulatorLicenseName) {
		SocketAPI.send('activate-module',
			{ action: 'dip-license', module: 'license-scanner', gui: 'login', loginToken, simulatorLicenseName },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.LICENSE_DIPPED_LOGIN,
					data: data
				});
			}
		);
	},

	startMatching(loginToken) {
		SocketAPI.send('customer-match-login',
			{ loginToken },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.CUSTOMER_MATCHED_LOGIN,
					data: data
				});
			}
		);
	},
	
	clearSteps() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CUSTOMER_RESET_LOGIN
		});
	},
	
	customerLogout() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CUSTOMER_LOGOUT
		});
	}


};

module.exports = CustomerLoginActions;
