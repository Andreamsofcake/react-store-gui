import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import Log from '../utils/BigLogger'
var Big = new Log('PrintReaderActions');

var PrintReaderActions = {
	
	grabPrint( config ) {
		axios.post('/api/print-reader/grab-print', 
			config
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants['PRINT_SCANNED_'+config.sequence],
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to grab print, error:');
					Big.log(response.data.error);
				} else {
					if (response.data && response.data.requestFlushed) {
						return;
					}
					Big.error('failed to grab print, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			if (error.data && error.data.apiResponse.indexOf('retry scan') > -1) {

				Big.warn('PRINT_SCAN_FAILED');
				Big.log(error.data);

				AppDispatcher.handleServerAction({
					actionType: appConstants.PRINT_SCAN_FAILED,
					data: error.data
				});

			} else if (error.data && error.data.apiResponse.indexOf('retry from start') > -1) {

				Big.warn('PRINT_SCAN_ENROLLENT_FAILED');
				Big.log(error.data);

				AppDispatcher.handleServerAction({
					actionType: appConstants.PRINT_SCAN_ENROLLENT_FAILED,
					data: error.data
				});

			} else {
				Big.error('failed to grab print, call chain error probably check component tree');
				Big.log(error);
				Big.throw(error);
			}
		})
	},

	registerPrint( config ) {
		axios.post('/api/print-reader/register-print', 
			config  // .post() expects and passes this as a json object
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: config.ACTION || appConstants.PRINT_REGISTERED,
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
			//Big.throw(error);
			throw error; // Big.* loses the call stack :(
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
					actionType: response.data.matchedUser ? appConstants.PRINT_MATCHED : appConstants.PRINT_NOT_MATCHED,
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
			if (error.data && error.data.apiResponse) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.PRINT_NOT_MATCHED,
					data: error.data
				});
			} else {
				Big.error('failed to match print, call chain error probably check component tree');
				Big.log(error);
				//Big.throw(error);
			}
		})
	},
	
	clearApiResponses() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_PRINT_MODULE_API_RESPONSES
		});
	},
	
	clearDataBuffer() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_PRINT_MODULE_DATA
		});
	}

};

module.exports = PrintReaderActions;
