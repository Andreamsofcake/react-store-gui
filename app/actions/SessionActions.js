import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import TsvSettingsStore from '../stores/TsvSettingsStore'

import Log from '../utils/BigLogger'
var Big = new Log('SessionActions');

var SessionActions = {
	
	createSession() {
		axios.post('/api/vend-session/new',
			{}
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SESSION_CREATED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to create session, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to create session, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to create session, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	updateSession( session, sessionData ) {
		axios.post('/api/vend-session/update', 
			{ session, sessionData }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SESSION_UPDATED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to update session, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to update session, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to update session, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	addProductView( session, product ) {
		throw new Error('not ready yet, probably will stick in the cart somehow?');
		axios.post('/api/vend-session/update', 
			{ session, sessionData }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SESSION_UPDATED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to update session, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to update session, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to update session, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	addUserToSession( session, user ) {
		axios.post('/api/vend-session/add-user', 
			{ session, user }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.ADDED_USER_TO_SESSION,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to add user to session, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to add user to session, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to add user to session, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	closeSession( session, cart, transaction ) {
		axios.post('/api/vend-session/close', 
			{ session, cart, transaction }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SESSION_CLOSED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to close session, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to close session, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to close session, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	dropSession( session, cart ) {
		axios.post('/api/vend-session/drop', 
			{ session, cart }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SESSION_DROPPED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to drop session, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to drop session, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to drop session, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	createTransaction( transactionData, session ) {
		axios.post('/api/transaction/new',
			{ transactionData, session }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TRANSACTION_CREATED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to create transaction, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to create transaction, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to create transaction, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	updateTransaction( transaction, transactionData ) {
		axios.post('/api/transaction/update', 
			{ transaction, transactionData }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TRANSACTION_UPDATED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to update transaction, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to update transaction, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to update transaction, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},
	
	// temporary method, may become permanent with correct logic changes:
	spendCustomerCredit(customer, amount_cents, transaction) {

/***
construct some temporary objects for testing here...
**/

		var cart = TsvSettingsStore.getCache('shoppingCart');
		
		axios.post('/api/spend-customer-credit',
			{ customer, amount_cents, cart } // transaction taken out, we are quickly generating on the server
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.CREDIT_PURCHASE_COMPLETED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to update transaction, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to update transaction, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to update transaction, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},
	
	updateCurrentCustomerCredit(credit) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_CURRENT_CUSTOMER_CREDIT,
			data: credit
		});
	}


};

module.exports = SessionActions;
