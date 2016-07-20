//import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { ProxyCall, CheckRegistration } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

/*
	token: this.state.token,
	clientUser: this.currentClientUser,
	apiResponses: apiResponses,
	type: 'fingerprint'
*/

module.exports = function(request, reply) {
	
	var MI = CheckRegistration(true)
		, { token, clientUser, apiResponses, type } = request.payload
		;
	
	if (!token || !clientUser || !apiResponses || !type) {
		return reply({ status: 'err', error: 'missing required params' }).code(500);
	}
	
	if (MI && MI.registrationData && MI.registrationData.client) {
	
		ProxyCall('clientUserAddBiometric', {
			user: clientUser,
			client: MI.registrationData.client, // need to get client here....
			biometricData: {
				apiResponses,
				type,
				location_data: {
					location: MI.registrationData.location
				}
			}

		}, (err, response) => {
		
			if (err) return reply({ token, status: 'err', error: err }).code(500);

			if (!response || !response.data || !response.data.item) {
				return reply({ token, status: 'ok', msg: 'failed to add biometric record' }).code(404);
			}
			
			reply({ token, status: 'ok', msg: 'biometric record added', data: response.data.item }).code(200);
		
		});
	} else {
		return reply({ token, status: 'err', error: 'machine is not configured properly yet, please contact your SDK rep.' }).code(500);
	}
}
