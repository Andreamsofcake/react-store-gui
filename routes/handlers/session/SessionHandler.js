import uuid from 'node-uuid'
import SDK from 'sdk-core-lib'
import path from 'path'
//import fs from 'fs'
import { CheckRegistration, ProxyCall } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	if (!request.params || !request.params.action) {
		reply({ status: 'err', msg: 'no action found! (hint, check your /url/structure)' }).code(500);	
	}
	
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		return reply({ status: 'err', msg: 'machine is not properly registered, cannot create a session' }).code(500);	
	}

	switch (request.params.action) {
	
		case 'new':
			//var { sessionData } = request.payload;
			// all data is on server side for a new session...
			var remoteSessionId = uuid.v4(); // guaranteed random uuid
			
			ProxyCall('vendSessionNew', {
				remoteSessionId,
				machine: MI.vendor_id
			}, (err, SESSION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!SESSION) {
					return reply({ status: 'err', msg: 'failed to create the session' }).code(500);	
				}
				SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;
				return reply({ status: 'ok', data: { SESSION } }).code(200);
			});

			break;

		case 'update':
			var { session, sessionData } = request.payload;
			sessionData.state = 'active';

			ProxyCall('vendSessionUpdate', {
				session, sessionData
			}, (err, SESSION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!SESSION) {
					return reply({ status: 'err', msg: 'failed to update the session' }).code(500);	
				}
				SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;
				return reply({ status: 'ok', data: { SESSION } }).code(200);
			});

			break;

		case 'add-user':
		case 'add-customer':
			var { session, user } = request.payload;
			if (!user || !user._id) {
				return reply({ status: 'err', msg: err }).code(500);	
			}

			ProxyCall('vendSessionUpdate', {
				session,
				sessionData: {
					customer: user._id,
					state: 'active'
				}
			}, (err, SESSION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!SESSION) {
					return reply({ status: 'err', msg: 'failed to add a user the session' }).code(500);	
				}
				SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;
				return reply({ status: 'ok', data: { SESSION } }).code(200);
			});

			break;

		case 'close':
			var { session, cart, transaction } = request.payload;
			if (!transaction || !transaction._id) {
				return reply({ status: 'err', msg: err }).code(500);	
			}

			ProxyCall('vendSessionUpdate', {
				session,
				sessionData: {
					cart,
					state: 'complete',
					consumed: true,
					transaction: transaction._id
				}
			}, (err, SESSION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!SESSION) {
					return reply({ status: 'err', msg: 'failed to close the session' }).code(500);	
				}
				SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;
				return reply({ status: 'ok', data: { SESSION } }).code(200);
			});
			break;

		// could eventually distinguish between "cancelled" (active cancel/logout) and "abandoned" (timeout)
		case 'drop':
			var { session, cart } = request.payload;
			ProxyCall('vendSessionUpdate', {
				session,
				sessionData: {
					cart,
					state: 'abandoned',
					consumed: true
				}
			}, (err, SESSION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!SESSION) {
					return reply({ status: 'err', msg: 'failed to drop the session' }).code(500);	
				}
				SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;
				return reply({ status: 'ok', data: { SESSION } }).code(200);
			});
			break;

	}
	
}
