import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import TsvService from '../../lib/TsvService'
//import RootscopeActions from '../actions/RootscopeActions'

import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	emptyCart,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('CustomerLoginActions');

var CustomerLoginActions = {

	loadCustomerByMembershipId(membership_id) {
		axios.post('/api/load-customer-by-membership-id', { membership_id })
		.then(response => {
			if (response.data && response.data.customer) {

				/**** temporary call, due to session probs with IO ****/
				setCurrentCustomer(response.data);
				/**** END temporary call ****/

				AppDispatcher.handleServerAction({
					actionType: appConstants.CUSTOMER_LOADED,
					data: response.data
				});
			}
		})
		.catch(error => {
			Big.error('failed to load customer by membership id???');
			Big.log(error);
		})
	},

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
			Big.error('failed to refresh customer???');
			Big.log(error);
		})
	},

	scanPrint(loginToken, simulatorPrintCustomer) {
		Big.log('scanPrint, check what we are passing');
		Big.log(loginToken, simulatorPrintCustomer);
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
			{ action: 'match', loginToken },
			(data) => {

				/**** temporary call, due to session probs with IO ****/
				setCurrentCustomer(data);
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
		emptyCart();
		axios.get('/api/reset-current-customer')
		.then(response => {
			AppDispatcher.handleServerAction({
				actionType: appConstants.CUSTOMER_LOGOUT
			});
		})
		.catch(error => {
			Big.error('failed to logout customer???');
			Big.log(error);
		})
	}


};

function setCurrentCustomer(data) {
	if (data && data.customer) {
		axios.post('/api/set-loggedin-customer', { customer: data.customer, credit: data.credit || false })
		.then(response => {
			Big.log('temp action: updated the current customer after login');
		})
		.catch(error => {
			Big.error('failed to set current customer???');
			Big.log(error);
		})
	}
}

module.exports = CustomerLoginActions;
