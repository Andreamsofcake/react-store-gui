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
	
	var { session, user } = request.payload;
	
	if (!session || !user || !session._id) {
		return reply({ status: 'err', msg: 'missing required params' }).code(500);	
	}

	ProxyCall('vendSessionUpdate', {
		session: session._id,
		sessionData: {
			customer: user,
			state: 'active'
		}

	}, (err, response) => {
	
		if (err) return reply({ status: 'err', error: err }).code(500);

		if (!response || !response.data || !response.data.item) {
			return reply({ status: 'ok', msg: 'failed to add user to session!' }).code(404);
		}
		
		reply({ status: 'ok', msg: 'added user to session', data: response.data.item }).code(200);
	
	});
}
