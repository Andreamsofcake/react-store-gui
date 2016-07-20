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
			Big.error('failed to match print, call chain error probably check component tree');
			Big.log(error);
			//Big.throw(error);
		})
	},
	
	clearApiResponses() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_PRINT_MODULE_API_RESPONSES
		});
	}

};

module.exports = PrintReaderActions;
