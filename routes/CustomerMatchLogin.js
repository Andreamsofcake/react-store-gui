import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	, simulatorDelay = 2000
	;

module.exports = function(request, reply) {
	
	var loginToken = request.payload.loginToken
		;
	
	debug('login token: ' + loginToken );
	
	if (process.env.CANNED_API_DATA) {
		
		// ACK no sessions/???
		//let simulatorMatch = request.yar.get('simulatorMatch_'+loginToken);
		var simulatorMatch;
		try {
			simulatorMatch = fs.readFileSync('simulatorMatch_'+loginToken);
			simulatorMatch = simulatorMatch.toString();
		} catch (e) {
			// nada
		}

		if (simulatorMatch) {
			simulatorMatch = JSON.parse(simulatorMatch);
		}

		debug('what are we trying to match with?' + JSON.stringify(simulatorMatch));

		if (simulatorMatch && simulatorMatch.license === simulatorMatch.print) {

			/*
			// to complete round of testing: need to load a customer from the DB!
			let customerID;
			switch (simulatorMatch.license) {
				case 'KrisKhan':
					customerID = 'alkjsdbfjaslufasdlfasdf';
					break;
				case 'MaryJaneSmith':
					customerID = 'alkjsdbfjaslufasdlfasdf';
					break;
				case 'BuddyGalore':
					customerID = 'alkjsdbfjaslufasdlfasdf';
					break;
			}
			
			if (customerID) {
			
				SDK.customerGetById( customerID, (err, customer) {
					if (err) {
						return reply({ status: 'err', msg: err }).code(500);
					}
					
					if (!customer) {
						return reply({ status: 'err', msg: 'customer not matched' }).code(404);
					}
					
					let strippedDown = {
						firstname: customer.firstname,
						lastname: customer.lastname,
						email: customer.email,
						mobile_phone: customer.mobile_phone
					}
					return reply({ status: 'ok', customer: strippedDown }).code(200);
				});
			} else {
				return reply({ status: 'err', msg: 'simulator failed to find a matching test account' }).code(500);
			}
			*/
			
			let fake = {
				firstname: 'Kent',
				lastname: 'Steiner',
				email: 'kent@sdkcore.com',
				mobile_phone: '480 433 6701',
			}

			// artificial delay on response for UI testing:
			setTimeout(() => {
				return reply({ status: 'ok', customer: fake }).code(200);
			}, simulatorDelay)

		} else {
			setTimeout(() => {
				return reply({ status: 'err', msg: 'customer not matched' }).code(404);
			}, simulatorDelay)
		}
		
	} else {
		// TBD process to handle the user's login...
		// probably async, definitely using remote cloud
		
		// SEE ABOVE about strippedDown ....
		
		reply({ status: 'err', msg: 'actual customer matching not implemented yet, check your .env file for CANNED_API_DATA' }).code(500);
	}
	

}