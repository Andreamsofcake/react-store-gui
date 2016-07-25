import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import SessionStore from '../stores/SessionStore'
import CustomerStore from '../stores/CustomerStore'
import TransactionStore from '../stores/TransactionStore'
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

	updateSession( sessionData ) {

		let session = SessionStore.getCurrentSession();
		if (!session) return false;

		axios.post('/api/vend-session/update', 
			{ sessionData, session }
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

	addUserToSession() {
		
		let session = SessionStore.getCurrentSession()
			, user = CustomerStore.getCustomer()
			;
		
		if (!session || !user) return false;

		axios.post('/api/vend-session/add-user', 
			{ user, session }
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

	addShopEvent( event ) {

		let session = SessionStore.getCurrentSession();
		if (!session) return false;

		axios.post('/api/vend-session/add-shop-event', 
			{ event, session }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.SESSION_UPDATED, // don't think we need a separate action type tracker for this.
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

	closeSession( event, action ) {

		let session = SessionStore.getCurrentSession()
			, transaction = TransactionStore.getCurrentTransaction()
			, cart = TsvSettingsStore.getCache('shoppingCart')

			// allow override on close response action, mainly for reg and login cancellations
			, ACTION = action || appConstants.SESSION_CLOSED

			;

		// should throw an error here instead:
		if (!session) return false;

		axios.post('/api/vend-session/close', 
			{ event, session, cart, transaction }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: ACTION,
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

	// should happen on a Shop Timeout
	dropSession( event ) {

		let session = SessionStore.getCurrentSession()
			, transaction = TransactionStore.getCurrentTransaction()
			, cart = TsvSettingsStore.getCache('shoppingCart')
			;

		// should throw an error here instead:
		if (!session) return false;

		axios.post('/api/vend-session/drop', 
			{ event, session, cart, transaction }
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

	closeSessionTransaction( event ) {

		let session = SessionStore.getCurrentSession()
			, transaction = TransactionStore.getCurrentTransaction()
			, cart = TsvSettingsStore.getCache('shoppingCart')
			;

		// should throw an error here instead:
		if (!session) return false;

		axios.post('/api/vend-session/close-session-transaction', 
			{ event, session, cart, transaction }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				response.data.transaction = transaction; // pass through
				AppDispatcher.handleServerAction({
					actionType: appConstants.TRANSACTION_AND_SESSION_CLOSED,
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

	// should happen on a Shop Timeout
	dropSessionTransaction( event ) {

		let session = SessionStore.getCurrentSession()
			, transaction = TransactionStore.getCurrentTransaction()
			, cart = TsvSettingsStore.getCache('shoppingCart')
			;

		// should throw an error here instead:
		if (!session) return false;

		axios.post('/api/vend-session/drop-session-transaction', 
			{ event, session, cart, transaction }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				response.data.transaction = transaction; // pass through
				AppDispatcher.handleServerAction({
					actionType: appConstants.TRANSACTION_AND_SESSION_DROPPED,
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
	
	kill() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.KILL_SESSION,
			data: null
		});
	}

};

module.exports = SessionActions;
