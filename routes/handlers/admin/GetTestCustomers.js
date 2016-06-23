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

module.exports = function(request, reply) {
	
	var MI = CheckRegistration(true);
	
	if (MI && MI.registrationData && MI.registrationData.client) {
	
		ProxyCall('clientGetCustomers', {
			filter: { isTestCustomer: true },
			client: MI.registrationData.client // need to get client here....

		}, (err, response) => {
		
			if (err) return reply({ status: 'err', error: err }).code(500);

			if (!response || !response.data || !response.data.items) {
				return reply({ status: 'ok', msg: 'no users found' }).code(404);
			}
			
			reply({ status: 'ok', msg: 'users found', data: response.data.items }).code(200);
		
		});
	} else {
		return reply({ status: 'err', error: 'machine is not configured properly yet, please contact your SDK rep.' }).code(500);
	}
}
