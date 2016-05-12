//import SDK from 'sdk-core-lib'
import RQ from 'request'
import * as CANDY from './CannedRouteResponses/TsvProxy'
var debug = require('debug')('vending-app-gui:tsv-proxy');

var isPingingMultievent = false
	, multieventErrors = 0
	, maxMultieventErrors = 10
	, USE_HARDWARE_API = process.env.USE_HARDWARE_API || false
	;

// inbound process.env is string, not bool settings
USE_HARDWARE_API = USE_HARDWARE_API && USE_HARDWARE_API.toLowerCase() === 'true' ? true : false;

module.exports = {

	Multievent: function(request, reply) {

		debug('[multievent], payload follows');
		
		if (request.payload._ws_args) {
			debug('WEBSOCKET PAYLOAD, use the ._ws_args');
			request.payload = request.payload._ws_args;
		}

		debug(request.payload);
		
		if (request.payload.subscribe_to_externals) {
			if (USE_HARDWARE_API) {
				// may move this flag mgmt / setting into multieventProxyPing() func:
				isPingingMultievent = true;
				multieventErrors = 0;
				var io = request.server.plugins['hapi-io'].io;
				return multieventProxyPing(io);
			} else {
				debug('request made to link to Tsv Proxy, but we are not USE_HARDWARE_API: '+USE_HARDWARE_API);
			}
		}

		//var data = { status: 'ok', msg: 'Multievent test response', tryReconnects: false, payload: request.payload };
		var data = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success", tryReconnects: false, payload: request.payload };
		return reply( data ).code(200);
	},

	Flashapi: function(request, reply) {

		debug('[flashapi], payload follows');

		if (request.payload._ws_args) {
			debug('WEBSOCKET PAYLOAD, use the ._ws_args');
			request.payload = request.payload._ws_args;
		}

		debug(request.payload);
		
		var isCanned = false;

		if (process.env.CANNED_API_DATA) {
			if (CANDY.shouldCan(request, reply)) {
				debug('method is registered for canned response');
				isCanned = true;
				return CANDY.cannedApiResponse(request, reply);
			}
		}
		
		// switch to process.env.USE_HARDWARE_API when ready
		if (!isCanned) {
			if (USE_HARDWARE_API) {
				return runTsvFlashApi(request, reply);
			} else {
				debug('method was NOT canned, but we are not USE_HARDWARE_API: '+USE_HARDWARE_API);
			}
		}
		
		//var data = { status: 'ok', msg: 'Flashapi test response', payload: request.payload };
		var data = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success", payload: request.payload };
		return reply( data ).code(200);
	}

}

function runTsvFlashApi(request, reply) {
	
	var payload = CANDY.getPayload(request, reply);
	
	RQ.post({
		url: 'http://localhost:8085/tsv/flashapi',
		body: payload,
		json: true
	}, function(err, response, body) {
		if (err) {
			debug('FLASHAPI Proxy error:');
			debug(err);
			// DEV NOTE:: You cannot call reply().code() on an error, error will already be set?
			return reply( err );
		}
		debug('FLASHAPI Proxy ok/response:');
		debug(body);
		return reply( body ).code(200);
	});
}

function multieventProxyPing(io) {
	RQ.post({
		url: 'http://localhost:8085/tsv/flashapi/multievent',
		json: true
	}, function(err, response, body) {
		
		if (err || !body) {
			multieventErrors += 1;
			if (multieventErrors > maxMultieventErrors) {
				debug('LINK DOWN DOWN DOWN');
				io.to('flash-api-multi-event').emit('flash-api-multi-event', [ [ 'linkdown' ] ]);
				isPingingMultievent = false;
			}

		} else {

			if (body && body.length && body[0] !== 'noEvent') {
				debug('FLASHAPI Proxy multievent response!');
				try {
					// allow logging of smaller responses, don't want a dirty log! (can't copy out of it so who cares)
					if (JSON.stringify(body).length < 100) {
						debug(body);
					}
				} catch (e) {
					// nada
				}

				// windoze no likey, must send to all sockets:
				//io.to('flash-api-multi-event').emit('flash-api-multi-event', [ body ]);
				io.sockets.emit('flash-api-multi-event', body);
			}
			
		}

		if (isPingingMultievent) {
			setTimeout(() => { multieventProxyPing(io) }, 250);
		}
	
	});
}
