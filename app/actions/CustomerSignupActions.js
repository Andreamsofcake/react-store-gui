import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import TsvService from '../../lib/TsvService'
//import RootscopeActions from '../actions/RootscopeActions'

import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

var CustomerSignupActions = {

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
			console.error('[CustomerSignupActions] failed to refresh customer???');
			console.log(error);
		})
	},

	captureEmail(signupToken, email) {
		SocketAPI.send('customer-signup',
			{ action: 'capture-email', gui: 'signup', signupToken, email },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.EMAIL_CAPTURED_SIGNUP,
					data: data
				});
			}
		);
	},

	captureMobileNumber(signupToken, mobileNumber) {
		SocketAPI.send('customer-signup',
			{ action: 'capture-mobile-number', gui: 'signup', signupToken, mobileNumber },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.MOBILE_NUMBER_CAPTURED_SIGNUP,
					data: data
				});
			}
		);
	},
	
	adminVerify(signupToken, simulatorPrintAdmin) {
		SocketAPI.send('customer-signup',
			{ action: 'admin-verify', gui: 'signup', signupToken, simulatorPrintAdmin },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.ADMIN_VERIFIED_SIGNUP,
					data: data
				});
			}
		);
	},

	scanPrint(signupToken, simulatorPrintCustomer) {
		SocketAPI.send('activate-module',
			{ action: 'scan-print', module: 'print-scanner', gui: 'signup', signupToken, simulatorPrintCustomer },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.PRINT_SCANNED_SIGNUP,
					data: data
				});
			}
		);
	},

	scanLicense(signupToken, simulatorLicenseName) {
		SocketAPI.send('activate-module',
			{ action: 'scan-license', module: 'license-scanner', gui: 'signup', signupToken, simulatorLicenseName },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.LICENSE_SCANNED_SIGNUP,
					data: data
				});
			}
		);
	},

	swipeLicense(signupToken, simulatorLicenseName) {
		SocketAPI.send('activate-module',
			{ action: 'swipe-license', module: 'license-scanner', gui: 'signup', signupToken, simulatorLicenseName },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.LICENSE_SWIPED_SIGNUP,
					data: data
				});
			}
		);
	},

	dipLicense(signupToken, simulatorLicenseName) {
		SocketAPI.send('activate-module',
			{ action: 'dip-license', module: 'license-scanner', gui: 'signup', signupToken, simulatorLicenseName },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.LICENSE_DIPPED_SIGNUP,
					data: data
				});
			}
		);
	},

	startRegistering(signupToken) {
		SocketAPI.send('customer-signup',
			{ action: 'register', signupToken },
			(data) => {

				/**** temporary call, due to session probs with IO ****/
				if (data && data.customer) {
					axios.post('/api/set-loggedin-customer', { customer: data.customer })
					.then(response => {
						console.log('temp action: updated the current customer after signup');
					})
					.catch(error => {
						console.error('[CustomerSignupActions] failed to set current customer???');
						console.log(error);
					})
				}
				/**** END temporary call ****/
				
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.CUSTOMER_REGISTERED_SIGNUP,
					data: data
				});
			}
		);
	},
	
	clearSteps() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CUSTOMER_RESET_SIGNUP
		});
	}

};

module.exports = CustomerSignupActions;
