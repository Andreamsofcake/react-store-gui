import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { CheckRegistration } from '../lib/Bootup'

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

	try {
		var execSync = require('child_process').execSync;
		registrystring = "" + execSync("reg query HKLM\\software\\wow6432node\\teamviewer /v ClientID");
		registrywords = registrystring.split('REG_DWORD');
		data.teamViewerID = parseInt(registrywords[1]);
	} catch(e) {
		
	}

// 2. Machine ID
	var MI = CheckRegistration(true);
	if (MI) {
		data.vendor_id = MI.registrationData.vendor_id;
		data._id = MI.registrationData._id;
		//data.MI = MI;
	}
	return reply({ status: 'ok', data }).code(200);
	
}
