import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import Log from '../utils/BigLogger'
var Big = new Log('AdminActions');

var AdminActions = {
	
	getClientUsers() {
		axios.get('/api/get-client-users')
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.CLIENT_USERS_RECEIVED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to get client users, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to get client users, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to get client users, call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
		})
	},

	getTestCustomers() {
		let me = 'test customers';
		axios.get('/api/get-test-customers')
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TEST_CUSTOMERS_RECEIVED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to get '+me+', error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to get '+me+', no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to get '+me+', call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
		})
	},
	
	getInventorySlotmap() {
		let me = 'inventory slot map';
		axios.get('/api/inventory-slot-map')
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.INVENTORY_SLOTMAP_RECEVIED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to get '+me+', error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to get '+me+', no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to get '+me+', call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
		})
	},

	clearInventorySlotmap() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.INVENTORY_SLOTMAP_CLEAR,
			data: null
		});
	},
	
	refreshStorefrontData() {
		axios.get('/api/refresh-storefront-data')
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.STOREFRONT_DATA_REFRESHED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to refresh store data, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to refresh store data, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to refresh store data, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},
	
	registerClientUserPrintComplete( config ) {
		axios.post('/api/register-client-user-print-complete', 
			config  // .post() expects and passes this as a json object
		)
		.then(response => {
			// fire and forget this one
			if (response.data && response.data.status) {
				/*
				AppDispatcher.handleServerAction({
					actionType: config.ACTION || appConstants.TEST_REGISTER_PRINT,
					data: response.data
				});
				*/
				Big.log('Client User print registration complete');
				Big.log(response.data);
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to register print, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to register print, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to register print, call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
		})
	},

	registerPrint( config ) {
		axios.post('/api/print-reader/grab-and-register-print', 
			config  // .post() expects and passes this as a json object
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: config.ACTION || appConstants.TEST_REGISTER_PRINT,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to register print, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to register print, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to register print, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	matchPrint( config ) {
		axios.post('/api/print-reader/match-print', 
			config // .post() expects and passes this as a json object
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TEST_MATCH_PRINT,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to match print, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to match print, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to match print, call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
		})
	},
	
	clearApiResponses() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_API_RESPONSES
		});
	}

};

module.exports = AdminActions;
