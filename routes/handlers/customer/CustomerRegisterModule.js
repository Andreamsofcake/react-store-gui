import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	, simulatorDelay = 3000
	;

module.exports = function(request, reply) {
	
	var signupToken = request.payload.signupToken
		, action = request.payload.action
		;
	
	debug('signup token: ' + signupToken );
	
	if (process.env.CANNED_API_DATA) {
		
		// ACK no sessions/???
		//let simulatorMatch = request.yar.get('simulatorMatch_'+signupToken);
		var simulatorMatch;
		try {
			simulatorMatch = fs.readFileSync('simulatorMatch_'+signupToken);
			simulatorMatch = simulatorMatch.toString();
		} catch (e) {
			// nada
		}

		simulatorMatch = simulatorMatch ? JSON.parse(simulatorMatch) : {};
		
		switch (action) {
			case 'capture-email':
				let email = request.payload.email;
				if (email) {
					simulatorMatch.email = email;
					fs.writeFileSync('simulatorMatch_' + signupToken, JSON.stringify(simulatorMatch) );
					return reply({ status: 'ok', msg: 'captured customer email' }).code(200);
				}
				return reply({ status: 'err', msg: 'no email found to capture' }).code(404);
				break;

			case 'capture-mobile-number':
				let mobileNumber = request.payload.mobileNumber;
				if (mobileNumber) {
					simulatorMatch.mobileNumber = mobileNumber;
					fs.writeFileSync('simulatorMatch_' + signupToken, JSON.stringify(simulatorMatch) );
					return reply({ status: 'ok', msg: 'captured customer mobileNumber' }).code(200);
				}
				return reply({ status: 'err', msg: 'no mobileNumber found to capture' }).code(404);
				break;
			
			case 'admin-verify':
				switch (request.payload.simulatorPrintAdmin) {
					case 'Admin':
						return reply({ status: 'ok', msg: 'Admin recognized!' }).code(200);
						break;
					case 'NotAdmin':
					default:
						return reply({ status: 'err', msg: 'Admin not recognized' }).code(404);
						break;
				}
				break;
			
			case 'register':
				debug('what are we trying to register with?' + JSON.stringify(simulatorMatch));
				if (simulatorMatch && simulatorMatch.license === simulatorMatch.print) {
			
					fs.unlinkSync('simulatorMatch_' + signupToken);
					let fake;

					switch (simulatorMatch.license) {
						case 'KrisKhan':
							fake = {
								firstname: 'Kris',
								lastname: 'Khan',
							}
							break;
						case 'MaryJaneSmith':
							fake = {
								firstname: 'Mary Jane',
								lastname: 'Smith',
							}
							break;
						case 'BuddyGalore':
							fake = {
								firstname: 'Buddy',
								lastname: 'Galore',
							}
							break;
					}
					
					fake.mobile_phone = simulatorMatch.mobileNumber;
					fake.email = simulatorMatch.email;
			
					// artificial delay on response for UI testing:
					setTimeout(() => {
						return reply({ status: 'ok', customer: fake }).code(200);
					}, simulatorDelay)

				} else {
					setTimeout(() => {
						return reply({ status: 'err', msg: 'customer not registered' }).code(404);
					}, simulatorDelay)
				}
				break;
		}

	} else {
		// TBD process to handle the user's signup...
		// probably async, definitely using remote cloud
		
		// SEE ABOVE about strippedDown ....
		
		reply({ status: 'err', msg: 'actual customer registering not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
	}
	

}