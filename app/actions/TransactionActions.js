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
var Big = new Log('TransactionActions');

var TransactionActions = {
	
	createTransaction() {

		let session = SessionStore.getCurrentSession()
			, cart = TsvSettingsStore.getCache('shoppingCart')
			, customer = CustomerStore.getCustomer()
			;

		axios.post('/api/transaction/new',
			{ session, cart }
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

	updateTransaction( transactionData ) {
		
		let transaction = TransactionStore.getCurrentTransaction();
		
		axios.post('/api/transaction/update', 
			{ transactionData, transaction }
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
	spendCustomerCredit( amount_cents ) {

		let customer = CustomerStore.getCustomer()
			, transaction = TransactionStore.getCurrentTransaction()
			;

		axios.post('/api/transaction/spend-customer-credit',
			{ amount_cents, customer, transaction } // transaction taken out, we are quickly generating on the server
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

	completeTransaction( event ) {
		
		let transaction = TransactionStore.getCurrentTransaction();
		
		axios.post('/api/transaction/complete', 
			{ event, transaction }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TRANSACTION_COMPLETED,
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

	dropTransaction( event ) {
		
		let transaction = TransactionStore.getCurrentTransaction();
		
		axios.post('/api/transaction/drop', 
			{ event, transaction }
		)
		.then(response => {
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TRANSACTION_DROPPED,
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
	
	kill() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.KILL_TRANSACTION,
			data: null
		});
	}

};

module.exports = TransactionActions;
