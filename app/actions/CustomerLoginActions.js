import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import TsvService from '../../lib/TsvService'
//import RootscopeActions from '../actions/RootscopeActions'

import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

var CustomerLoginActions = {

	refreshCustomer() {
		axios.get('/api/customer-refresh')
		.then(response => {
			if (response.data && response.data.customer) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.CUSTOMER_REFRESH,
					data: response.data
				});
			}
		})
		.catch(error => {
			console.error('[CustomerLoginActions] failed to refresh customer???');
			console.log(error);
		})
	},

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

				/**** temporary call, due to session probs with IO ****/
				if (data && data.customer) {
					axios.post('/api/set-loggedin-customer', { customer: data.customer })
					.then(response => {
						console.log('temp action: updated the current customer after login');
					})
					.catch(error => {
						console.error('[CustomerLoginActions] failed to set current customer???');
						console.log(error);
					})
				}
				/**** END temporary call ****/
				
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
		TsvService.emptyCart(null, () => {});
		axios.get('/api/reset-current-customer')
		.then(response => {
			AppDispatcher.handleServerAction({
				actionType: appConstants.CUSTOMER_LOGOUT
			});
		})
		.catch(error => {
			console.error('[CustomerLoginActions] failed to logout customer???');
			console.log(error);
		})
	}


};

module.exports = CustomerLoginActions;
