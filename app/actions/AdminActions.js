import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import Log from '../utils/BigLogger'
var Big = new Log('AdminActions');

var AdminActions = {
	
	registerPrint( config ) {
		axios.post('/api/print-reader/grab-and-register-print', 
			config  // .post() expects and passes this as a json object
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TEST_REGISTER_PRINT,
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
			if (response.data && response.data) {
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
			Big.throw(error);
		})
	},
	
	clearApiResponses() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_API_RESPONSES
		});
	}

};

module.exports = AdminActions;
