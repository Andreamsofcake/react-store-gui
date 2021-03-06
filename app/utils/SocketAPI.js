import { isClient } from './index'

import Log from './BigLogger'
var Big = new Log('SocketAPI');

if (isClient) {

	// uncomment below to see verbose Socket.io logs
	// to turn it off, you have to manually set localStorage.debug = false, not just comment this back out
	//localStorage.debug = '*';

	/* set up websocket connection */
	var io = require('socket.io-client')
		, socket_connected = false
	//	, debug = true
		, websocket
		, queue = []
		, ActionHandlers = {} // see registerActionHandler() below
		, SocketHandler = {}
		, webhook_token
		;

	var websocket = io.connect();

	websocket.on('connect', function() {
		Big.log(' +++++++++++++ WEBSOCKET connected ');
		socket_connected = true;
		if (queue.length) {
			queue.forEach( Q => {
				Big.log('[WS] emit Q command: '+Q.command);
				Big.log(Q.data);
				websocket.emit(Q.command, Q.data);
			});
		}
	});

	websocket.on('message', function(response) {
		Big.log('general message from server:');
		Big.log(response);
	});

	websocket.on('set-webhook-token', function(token) {
		Big.log('webhook token from server:');
		Big.log(token);
		webhook_token = token;
	});

	// just a tester:
	window.onbeforeunload = function() {
		websocket.emit('beforeDisconnect', { msg: 'client is about to disconnect!', some: 'data' });
	}

	// allows binding one handler to all custom (i.e., not connect or disconnect etc) events:
	var onevent = websocket.onevent;
	websocket.onevent = function (packet) {
		var args = packet.data || [];
		onevent.call (this, packet);    // original call
		packet.data = ["*"].concat(args);
		onevent.call(this, packet);      // additional call to catch-all
	};

	websocket.on("*", (event,data) => {
		/*
		Big.log(' -----------------------------------------------------------------');
		Big.log('[ >>>>> SOCKET catch-all <<<<<< ] ... event, then data');
		Big.log(event);
		Big.log(data);
		Big.log(' -----------------------------------------------------------------');
		//*/
		var handle = event;
		//if (data && data.actionToken) { handle += ':' + actionToken }

		if (ActionHandlers[handle] && typeof ActionHandlers[handle] == 'function') {
			ActionHandlers[handle](data);
		} else {
			Big.log(' -----------------------------------------------------------------');
			Big.log('[ >>>>> SOCKET catch-all, nobody was registered to handle this <<<<<< ] ... event, then data');
			Big.log(handle);
			Big.log(data);
			Big.log(' -----------------------------------------------------------------');
		}
	});

	module.exports = {

		// pass in action="receive-foo-data" (server emitted action name) and the appropriate bound method from the ActionHandler
		// removes need for defining websocket.on('foo', function), also removes need to include all actions and processing logic here.
		// explore using PubSub for handling multiple listeners per socket pingback events
		// see: utils/PubSub.js
		registerActionHandler(action, handler, actionToken) {
			var handle = action;
			//if (actionToken) { handle += ':' + actionToken }
			Big.log('registering action handler for: '+handle);
			ActionHandlers[handle] = handler;
		},

		unregisterActionHandler(action, handler, actionToken) {
			Big.throw('unfinished function ... depends on PubSub / multiple listeners per action');
			var handle = action;
			//if (actionToken) { handle += ':' + actionToken }
			if (!handler) {
				// remove all
			} else {
				// remove single
				ActionHandlers[handle] = handler;
			}
		},

		testSocketConnection(TD) {
			TD = TD || { some: 'test_data' }; // Test Data to ping with
			SocketHandler.socket.emit('testResponse', TD);
		},

		socketSendCommand(cmd, data, handler, actionToken) {
			// optional auto-link up to ActionHandler
			if (handler && typeof handler == 'function') {
				this.registerActionHandler(cmd, handler, actionToken);
			}
			//data.actionToken = actionToken;
			SocketHandler.emit(cmd, data);
		},

		getWebhookToken() {
			return webhook_token;
		}

	};

	// aliases:
	module.exports.subscribe = module.exports.registerActionHandler;
	module.exports.unsubscribe = module.exports.unregisterActionHandler;
	module.exports.sub = module.exports.registerActionHandler;
	module.exports.unsub = module.exports.unregisterActionHandler;
	module.exports.send = module.exports.socketSendCommand;

	SocketHandler.socket = websocket;
	SocketHandler.isReady = function() { return socket_connected; }
	// alias:
	SocketHandler.emit = function(command, data) {
		if (socket_connected) {
			websocket.emit(command, data);
		} else {
			queue.push({ command, data });
		}
	}

	//window.SH = { SocketHandler, expo: module.exports };

} else {
	module.exports = false;
}
