//import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { Register, CheckRegistration } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	Register((err, result) => {

		if (err || !result) if (err) return reply({ status: 'err', error: err || 'failed to refresh, unknown error' }).code(500);
		
		var MI = CheckRegistration(true);
		
		return reply({ status: 'ok', msg: 'cloud config refreshed', data: MI }).code(200);

	}, false, true);
	
}
