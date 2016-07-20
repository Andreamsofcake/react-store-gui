import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
//import { browserHistory } from 'react-router'

import Log from '../utils/BigLogger'
var Big = new Log('CardReaderActions');

var CardReaderActions = {
	
	scanMembershipCard( config ) {
		axios.post('/api/card-reader/scan-membership-card', 
			config
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.MEMBERSHIP_CARD_SCANNED,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to scan card, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to scan card, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to scan card, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},

	matchMembershipCard( config ) {
		axios.post('/api/card-reader/match-membership-card', 
			config
		)
		.then(response => {
			// uh, daaaaaable check?
			if (response.data && response.data.status && response.data.status == 'ok') {
				AppDispatcher.handleServerAction({
					actionType: appConstants.MEMBERSHIP_CARD_MATCHED,
					data: response.data
				});
			} else {
				AppDispatcher.handleServerAction({
					actionType: appConstants.MEMBERSHIP_CARD_NOT_MATCHED,
					data: null
				});

				Big.error('call failed for match membership card, full response:');
				Big.log(response);
			}
		})
		.catch(error => {
			Big.error('failed to match membership card, call chain error probably check component tree');
			Big.log(error);
			Big.throw(error);
		})
	},
	
	clearApiResponses() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_CARD_MODULE_API_RESPONSES
		});
	},

	clearDataBuffer() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_CARD_MODULE_BUFFER
		});
	}

};

module.exports = CardReaderActions;
