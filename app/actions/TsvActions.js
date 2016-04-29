import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'
import { browserHistory } from 'react-router'
import TsvActionList from './TsvActionList'

//import TsvService from '../../lib/TsvService'
//import * as Translate from '../../lib/Translate'

function _callback(callback, response) {
	if (callback) {
		callback(null, response);
	} else {
		AppDispatcher.handleServerAction({
			actionType: appConstants.FLASH_API,
			data: response
		});
	}
}

function _callbackError(callback, error) {
	if (callback) {
		callback(error);
	} else {
		console.warn('skipping AppDispatch for FLASH_API error... error:');
		console.log(error);
		/*
		AppDispatcher.handleServerAction({
			actionType: appConstants.FLASH_API
			data: response
		});
		*/
	}
}

var TsvActions = {
	
	serverHandshake() {
		// essentially, registers a handler for this event by sending to it once:
		SocketAPI.send('flash-api-multi-event', { _ws_args: { subscribe_to_externals: true } }, (response) => {
			console.warn('SOCKET multi-event response');
			console.log(JSON.stringify(response));
			// we can get multiple responses at a time:
			if (response && response instanceof Array && response[0] instanceof Array) {
				if (response.length > 1) {
					response.forEach( R => {
						//setTimeout(
						_R_(R);
					});
				} else {
					_R_(response[0]);
				}
			}
			function _R_(response) {
				if (response) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.FLASH_API_MULTIEVENT,
						data: response
					});
				} else {
					console.error('[flash-api-multi-event] pinged, but nothing there?');
					console.log(response);
					console.warn(' ((( you should look into the linkDown / failCount stuff from old TsvService ... ))) ');
					// if above response is truly an error, track it a few times then if "link is really down", supposed to be in idle state
				}
			}
		});
	},
	
	reconnectHandshake(ms) {
		ms = ms || 10000
		setTimeout(TsvActions.serverHandshake, ms);
	},

	apiCall() {
		var args = Array.prototype.slice.call(arguments)
			, callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
			, requestJson = JSON.stringify(args)
			;
		
		if (TsvActionList.indexOf(args[0]) === -1) {
			_callbackError(callback, 'unsupported api action requested: ' + args[0]);
		}

		var flash_api_url = 'http://localhost:8087/tsv-proxy/flashapi';
		if (typeof window !== 'undefined') {
			if (window.location.port !== 8087) {
				flash_api_url = location.protocol + '//' + location.host + '/tsv-proxy/flashapi';
			}
		}
		
		axios.post(flash_api_url, requestJson, {
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => {

			if (response.data || response.statusText === 'OK') {
				_callback(callback, response.data || response);

			} else {
				_callbackError(callback, response.data && response.data.error ? response.data.error : 'unknown error, check logs');
				/*
				if (response.data && response.data.error) {
					console.error('[TsvService] failed to post to flashapi, error:');
					console.log(response.data.error);
					callback(response.data.error);
				} else {
					console.error('[TsvService] failed to post to flashapi, no data returned. full response:');
					console.log(response);
					callback('unknown error, check logs');
				}
				*/
			}
		})
		.catch(error => {
			//console.log("Flash call failed " + textStatus + " - " + errorThrown);
			console.warn("Flash call failed - error:");
			console.log(error);
			console.log(args);
			throw error;
			_callbackError(error);
		})

	},
};

module.exports = TsvActions;
