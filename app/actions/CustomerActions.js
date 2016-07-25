import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import RootscopeActions from '../actions/RootscopeActions'

import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'

import Log from '../utils/BigLogger'
var Big = new Log('CustomerActions');

import {
	emptyCart,
} from '../utils/TsvUtils'

var CustomerActions = {

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
	
	adminVerifyAndLoadCustomerByMembershipId(user, adminPrintUser, membership_id) {
		axios.post('/api/admin-verify-and-load-customer-by-membership-id', { user, adminPrintUser, membership_id })
		.then(response => {
			if (response.data && response.data.customer) {

				/**** temporary call, due to session probs with IO ****/
				setCurrentCustomer(response.data);
				/**** END temporary call ****/

				AppDispatcher.handleServerAction({
					actionType: appConstants.CUSTOMER_VERIFIED_AND_LOADED,
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

	updateCurrentCustomerCredit(credit) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_CURRENT_CUSTOMER_CREDIT,
			data: credit
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
	},

/**** old testing regime methods... *****/

	membershipCardSwipe(loginToken) {
		SocketAPI.send('activate-module',
			{ action: 'scan-membership-card', module: 'license-scanner', gui: 'login', loginToken },
			(data) => {
				// we're not validating here, either the scan completed or failed... pass it through.
				// CustomerStore will decide if the event is ok or err
				AppDispatcher.handleServerAction({
					actionType: appConstants.MEMBERSHIP_CARD_SCANNED_TESTLOOP,
					data: data
				});
			}
		);
	},


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

module.exports = CustomerActions;

