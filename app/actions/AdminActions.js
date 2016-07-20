import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import Log from '../utils/BigLogger'
var Big = new Log('AdminActions');

var AdminActions = {
	
	getClientUsers() {
		let me = 'client users';
		axios.get('/api/get-client-users')
		.then(response => {
			
			Big.log('getClientUsers() returned...');
			
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.CLIENT_USERS_RECEIVED,
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
		let me = 'storefront data';
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
			Big.throw(error);
		})
	},
	
	addBiometricRecord( config ) {
		let me = 'biometric record';
		axios.post('/api/client-user-add-biometric',
			config  // .post() expects and passes this as a json object
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: config.ACTION || appConstants.CLIENTUSER_BIOMETRIC_RECORD_ADDED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to add '+me+', error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to add '+me+', no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to add '+me+', call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
			throw error;
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
		axios.post('/api/print-reader/grab-match-print', 
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
			actionType: appConstants.CLEAR_TEST_PRINT_API_RESPONSES
		});
	}

};

module.exports = AdminActions;
