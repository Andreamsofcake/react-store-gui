import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var { loginToken, action, module, gui } = request.payload;
	
	debug('login token: ' + loginToken + ', module: '+module+' ('+action+')' );
	
	switch (module) {
		case 'print-scanner':
			if (process.env.CANNED_API_DATA) {
				if (request.payload.simulatorPrintCustomer) {
					// ACK no sessions????
					/*
					let simulatorMatch = request.yar.get('simulatorMatch_'+loginToken) || {};
					simulatorMatch.print = request.payload.simulatorPrintCustomer
					request.yar.set('simulatorMatch_'+loginToken, simulatorMatch);
					*/
					var simulatorMatch;
					try {
						simulatorMatch = fs.readFileSync('simulatorMatch_'+loginToken);

						debug('[inside loader] what is simulatorMatch???? typeof: ' + typeof simulatorMatch );
						debug(simulatorMatch);

						simulatorMatch = simulatorMatch.toString();
						debug(simulatorMatch);
					} catch (e) {
						simulatorMatch = false;
					}

					debug('what is simulatorMatch???? typeof: ' + typeof simulatorMatch );
					debug(simulatorMatch);

					simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
					simulatorMatch.print = request.payload.simulatorPrintCustomer
					fs.writeFileSync('simulatorMatch_'+loginToken, JSON.stringify(simulatorMatch));

					debug('set simulatorMatch_'+loginToken+' to: '+ JSON.stringify(simulatorMatch));
					return reply({ status: 'ok', msg: 'TESTING: set simulatorPrintCustomer' }).code(200);
				}
				return reply({ status: 'err', msg: 'TESTING: no simulatorPrintCustomer found to track' }).code(404);
			} else {
				reply({ status: 'err', msg: 'actual print scanning not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
			}
			break;

		case 'license-scanner':
			if (process.env.CANNED_API_DATA) {
				if (request.payload.simulatorLicenseName) {
					// ACK no sessions????
					/*
					let simulatorMatch = request.yar.get('simulatorMatch_'+loginToken) || {};
					simulatorMatch.license = request.payload.simulatorLicenseName
					request.yar.set('simulatorMatch_'+loginToken, simulatorMatch);
					*/
					var simulatorMatch;
					try {
						simulatorMatch = fs.readFileSync('simulatorMatch_'+loginToken);
						simulatorMatch = simulatorMatch.toString();
					} catch (e) {
						simulatorMatch = false;
					}

					debug('what is simulatorMatch???? typeof: ' + typeof simulatorMatch );
					debug(simulatorMatch);

					simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
					simulatorMatch.license = request.payload.simulatorLicenseName
					fs.writeFileSync('simulatorMatch_'+loginToken, JSON.stringify(simulatorMatch) );

					debug('set simulatorMatch_'+loginToken+' to: '+ JSON.stringify(simulatorMatch));
					return reply({ status: 'ok', msg: 'TESTING: set simulatorLicenseName' }).code(200);
				}
				return reply({ status: 'err', msg: 'TESTING: no simulatorLicenseName found to track' }).code(404);
			} else {
				reply({ status: 'err', msg: 'actual license scanning not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
			}
			break;
	}
	
}
