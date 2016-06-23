import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	, RQ = require('request')
	;

module.exports = function(request, reply) {
	
	var { loginToken, signupToken, action, module, gui } = request.payload;
	
	switch (gui) {
	
		case 'login':
			debug('login token: ' + loginToken + ', module: '+module+' ('+action+')' );
			switch (module) {
				case 'print-scanner':
					if (process.env.CANNED_API_DATA) {
						if (request.payload.simulatorPrintCustomer) {
							// ACK no sessions????
							/*
							let simulatorMatch = request.yar.get('simulatorMatch_' + loginToken) || {};
							simulatorMatch.print = request.payload.simulatorPrintCustomer
							request.yar.set('simulatorMatch_' + loginToken, simulatorMatch);
							*/
							var simulatorMatch;
							try {
								simulatorMatch = fs.readFileSync('simulatorMatch_' + loginToken);
								simulatorMatch = simulatorMatch.toString();
							} catch (e) {
								simulatorMatch = false;
							}

							simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
							simulatorMatch.print = request.payload.simulatorPrintCustomer
							fs.writeFileSync('simulatorMatch_' + loginToken, JSON.stringify(simulatorMatch));

							debug('set simulatorMatch_' + loginToken + ' to: '+ JSON.stringify(simulatorMatch));
							return reply({ status: 'ok', msg: 'TESTING: set simulatorPrintCustomer' }).code(200);
						}
						return reply({ status: 'err', msg: 'TESTING: no simulatorPrintCustomer found to track' }).code(404);
					} else {
						reply({ status: 'err', msg: 'actual print scanning not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
					}
					break;

				case 'camera':
					if (process.env.CANNED_API_DATA) {
						if (request.payload.simulatorPhotoCustomer) {
							// ACK no sessions????
							/*
							let simulatorMatch = request.yar.get('simulatorMatch_' + loginToken) || {};
							simulatorMatch.print = request.payload.simulatorPrintCustomer
							request.yar.set('simulatorMatch_' + loginToken, simulatorMatch);
							*/
							var simulatorMatch;
							try {
								simulatorMatch = fs.readFileSync('simulatorMatch_' + loginToken);
								simulatorMatch = simulatorMatch.toString();
							} catch (e) {
								simulatorMatch = false;
							}

							simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
							simulatorMatch.photo = request.payload.simulatorPhotoCustomer;
							fs.writeFileSync('simulatorMatch_' + loginToken, JSON.stringify(simulatorMatch));

							debug('set simulatorMatch_' + loginToken + ' to: '+ JSON.stringify(simulatorMatch));
							return reply({ status: 'ok', msg: 'TESTING: set simulatorPhotoCustomer' }).code(200);
						}
						return reply({ status: 'err', msg: 'TESTING: no simulatorPhotoCustomer found to track' }).code(404);
					} else {
						reply({ status: 'err', msg: 'actual photo taking not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
					}
					break;

				case 'm280':
				case 'license-scanner':
					if (process.env.CANNED_API_DATA) {
						if (request.payload.simulatorLicenseName) {
							// ACK no sessions????
							/*
							let simulatorMatch = request.yar.get('simulatorMatch_' + loginToken) || {};
							simulatorMatch.license = request.payload.simulatorLicenseName
							request.yar.set('simulatorMatch_' + loginToken, simulatorMatch);
							*/
							var simulatorMatch;
							try {
								simulatorMatch = fs.readFileSync('simulatorMatch_' + loginToken);
								simulatorMatch = simulatorMatch.toString();
							} catch (e) {
								simulatorMatch = false;
							}

							simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
							simulatorMatch.license = request.payload.simulatorLicenseName
							fs.writeFileSync('simulatorMatch_' + loginToken, JSON.stringify(simulatorMatch) );

							debug('set simulatorMatch_' + loginToken + ' to: '+ JSON.stringify(simulatorMatch));
							return reply({ status: 'ok', msg: 'TESTING: set simulatorLicenseName' }).code(200);
						}
						return reply({ status: 'err', msg: 'TESTING: no simulatorLicenseName found to track' }).code(404);
					} else {
						if (action === 'scan-membership-card') {

							RQ.post({
								url: 'http://localhost:8001/api/v1/bio/eseek/m280/grabcard',
								body: {},
								json: true
							}, (err, response, body) => {
								if (err) return reply({ status: 'err', err: err }).code(500);
						
								if (body && body.status === 'ok' && body.data) {
									reply({ status: 'ok', membership_id: body.data }).code(200);
							
								} else {
									reply({ status: 'ok', msg: body.msg || 'invalid card' }).code(500);
								}
							});

						} else {
							reply({ status: 'err', msg: 'actual license scanning not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
						}
					}
					break;
			}
			break;

		case 'signup':
			debug('signup token: ' + signupToken + ', module: '+module+' ('+action+')' );
			switch (module) {
				case 'print-scanner':
					if (process.env.CANNED_API_DATA) {
						if (request.payload.simulatorPrintCustomer) {
							// ACK no sessions????
							/*
							let simulatorMatch = request.yar.get('simulatorMatch_' + signupToken) || {};
							simulatorMatch.print = request.payload.simulatorPrintCustomer
							request.yar.set('simulatorMatch_' + signupToken, simulatorMatch);
							*/
							var simulatorMatch;
							try {
								simulatorMatch = fs.readFileSync('simulatorMatch_' + signupToken);
								simulatorMatch = simulatorMatch.toString();
							} catch (e) {
								simulatorMatch = false;
							}

							simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
							simulatorMatch.print = request.payload.simulatorPrintCustomer
							fs.writeFileSync('simulatorMatch_' + signupToken, JSON.stringify(simulatorMatch));

							debug('set simulatorMatch_' + signupToken + ' to: '+ JSON.stringify(simulatorMatch));
							return reply({ status: 'ok', msg: 'TESTING: set simulatorPrintCustomer' }).code(200);
						}
						return reply({ status: 'err', msg: 'TESTING: no simulatorPrintCustomer found to track' }).code(404);
					} else {
						reply({ status: 'err', msg: 'actual print scanning not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
					}
					break;

				case 'camera':
					if (process.env.CANNED_API_DATA) {
						if (request.payload.simulatorPhotoCustomer) {
							// ACK no sessions????
							/*
							let simulatorMatch = request.yar.get('simulatorMatch_' + signupToken) || {};
							simulatorMatch.print = request.payload.simulatorPrintCustomer
							request.yar.set('simulatorMatch_' + signupToken, simulatorMatch);
							*/
							var simulatorMatch;
							try {
								simulatorMatch = fs.readFileSync('simulatorMatch_' + signupToken);
								simulatorMatch = simulatorMatch.toString();
							} catch (e) {
								simulatorMatch = false;
							}

							simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
							simulatorMatch.print = request.payload.simulatorPhotoCustomer
							fs.writeFileSync('simulatorMatch_' + signupToken, JSON.stringify(simulatorMatch));

							debug('set simulatorMatch_' + signupToken + ' to: '+ JSON.stringify(simulatorMatch));
							return reply({ status: 'ok', msg: 'TESTING: set simulatorPhotoCustomer' }).code(200);
						}
						return reply({ status: 'err', msg: 'TESTING: no simulatorPhotoCustomer found to track' }).code(404);
					} else {
						reply({ status: 'err', msg: 'actual photo taking not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
					}
					break;

				case 'm280':
				case 'license-scanner':
					if (process.env.CANNED_API_DATA) {
						if (request.payload.simulatorLicenseName) {
							// ACK no sessions????
							/*
							let simulatorMatch = request.yar.get('simulatorMatch_' + signupToken) || {};
							simulatorMatch.license = request.payload.simulatorLicenseName
							request.yar.set('simulatorMatch_' + signupToken, simulatorMatch);
							*/
							var simulatorMatch;
							try {
								simulatorMatch = fs.readFileSync('simulatorMatch_' + signupToken);
								simulatorMatch = simulatorMatch.toString();
							} catch (e) {
								simulatorMatch = false;
							}

							simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
							simulatorMatch.license = request.payload.simulatorLicenseName
							fs.writeFileSync('simulatorMatch_' + signupToken, JSON.stringify(simulatorMatch) );

							debug('set simulatorMatch_' + signupToken + ' to: '+ JSON.stringify(simulatorMatch));
							return reply({ status: 'ok', msg: 'TESTING: set simulatorLicenseName' }).code(200);
						}
						return reply({ status: 'err', msg: 'TESTING: no simulatorLicenseName found to track' }).code(404);
					} else {
						reply({ status: 'err', msg: 'actual license scanning not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
					}
					break;
			}
			break;

	}
	
}
