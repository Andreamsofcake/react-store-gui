import SDK from 'sdk-core-lib'
import path from 'path'
//import fs from 'fs'
//import RQ from 'request'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:route-handler:' + ACTION)
	;

module.exports = {
	
	post: (request, reply) => {
		debug('got POST request, method: ' + request.params.method);
		//debug(request.payload);
		reply({ status: 'ok' });
	},

	get: (request, reply) => {
		debug('got GET request, method: ' + request.params.method);
		//debug(request.query);
		reply({ status: 'ok' });
	},
}
