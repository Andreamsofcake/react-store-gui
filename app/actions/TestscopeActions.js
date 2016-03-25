import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

var TestscopeActions = {
	
	sendEmulatorCommand( cmd ) {
		axios.post('/api/emulator', 
			{ emulator_command: cmd } // .post() expects and passes this as a json object
		)
		.then(response => {
			if (response.data && response.data) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.TEST_EMULATOR_RESULT,
					data: response.data
				});
			} else {
				if (response.data && response.data.error) {
					console.error('[TestscopeActions] failed to post foo, error:');
					console.log(response.data.error);
				} else {
					console.error('[TestscopeActions] failed to post foo, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[TestscopeActions] failed to post foo, call chain error probably check component tree');
			console.log(error);
		})
	},

};

module.exports = TestscopeActions;
