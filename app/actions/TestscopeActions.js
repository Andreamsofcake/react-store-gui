import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'

import * as Translate from '../../lib/Translate'

import Log from '../utils/BigLogger'
var Big = new Log('TestscopeActions');

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
					Big.error('failed to post foo, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to post foo, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to post foo, call chain error probably check component tree');
			Big.log(error);
		})
	},

};

module.exports = TestscopeActions;
