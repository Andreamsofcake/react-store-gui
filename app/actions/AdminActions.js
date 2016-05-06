import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

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
					console.error('[AdminActions] failed to register print, error:');
					console.log(response.data.error);
				} else {
					console.error('[AdminActions] failed to register print, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[AdminActions] failed to register print, call chain error probably check component tree');
			console.log(error);
			throw Error(error);
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
					console.error('[AdminActions] failed to match print, error:');
					console.log(response.data.error);
				} else {
					console.error('[AdminActions] failed to match print, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[AdminActions] failed to match print, call chain error probably check component tree');
			console.log(error);
			throw Error(error);
		})
	},
	
	clearApiResponses() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_API_RESPONSES
		});
	}

};

module.exports = AdminActions;
