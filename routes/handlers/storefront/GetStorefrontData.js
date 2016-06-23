import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { ConfigData } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var sfd = ConfigData();
	if (!sfd) {
		return reply({ status: 'err', error: 'no storefront data found.' }).code(404);
	}
	return reply({ status: 'ok', data: sfd }).code(200);
	
}
