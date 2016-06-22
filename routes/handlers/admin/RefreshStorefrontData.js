//import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { Data, ConfigData } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	Data( (err, result) => {

		if (err || !result) if (err) return reply({ status: 'err', error: err || 'failed to refresh, unknown error' }).code(500);
		
		return reply({ status: 'ok', msg: 'storefront data refreshed', data: ConfigData() }).code(200);

	});
	
}
