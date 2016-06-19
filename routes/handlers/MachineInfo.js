import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { CheckRegistration, TeamViewerID } from '../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
// 1. TeamViewer ID
	var data = {
		teamViewerID: 'unknown',
		vendor_id: 'unknown',
		_id: 'unknown',
	};

	var TV = TeamViewerID();
	if (TV) {
		data.teamViewerID = TV;
	}

// 2. Machine ID
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (MI) {
		data.vendor_id = MI.vendor_id;
		data._id = MI._id;
		//data.MI = MI;
	}
	return reply({ status: 'ok', data }).code(200);
	
}
