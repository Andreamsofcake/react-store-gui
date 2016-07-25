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
	
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;

	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		return reply({ status: 'err', msg: 'machine is not properly registered, cannot create a session' }).code(500);	
	}
	
	var { session, event } = request.payload;
	
	if (!session || !event || !session._id) {
		return reply({ status: 'err', msg: 'missing required params' }).code(500);	
	}
	
	var events = session.events || [];
	// attempting to skip the horrendous updating of subdocuments with _id's:
	// (dropping them should just leave a clean stack of events)
	events.forEach( ACTION => {
		delete ACTION._id;
	});
	events.push(event);

	ProxyCall('vendSessionUpdate', {
		session: session._id,
		sessionData: {
			events,
			state: 'active'
		}

	}, (err, response) => {
	
		if (err) return reply({ status: 'err', error: err }).code(500);

		if (!response || !response.data || !response.data.item) {
			return reply({ status: 'ok', msg: 'failed to add shop event to session!' }).code(404);
		}
		
		reply({ status: 'ok', msg: 'added shop event to session', data: response.data.item }).code(200);
	
	});
}
