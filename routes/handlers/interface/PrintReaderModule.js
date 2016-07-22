import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

// FingerprintReader is a thin wrapper around the hardware driver, mainly for managing access to /grabprint
import FingerprintReader from '../../../lib/Drivers/FingerprintReader'
import { CheckRegistration } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var MI = CheckRegistration(true);
	if (MI && MI.registrationData && MI.registrationData) { MI = MI.registrationData; }

	switch (request.params.action) {

/***** main print match/grab methods ******/

		case 'grab-print':
			
			var { sequence, token } = request.payload;
			sequence = parseInt(sequence);

			if (!sequence || !token) {
				return reply({ status: 'err', apiResponses: ['grab-print requires a sequence and a token'] }).code(500);
			}
			
			if (sequence < 1 || sequence > 3) {
				return reply({ status: 'err', apiResponses: ['grab-print requires a sequence between 1 and 3'] }).code(500);
			}
			
			return FingerprintReader.grabPrint(reply, { sequence, token });
			break;


		case 'match-print':

			var { matchProps, token } = request.payload;
			
			if (!matchProps || !matchProps.user || !token) {
				return reply({ status: 'err', apiResponses: ['register-print requires matchProps with a user, and a token'] }).code(500);
			}
			
			return FingerprintReader.matchPrint(reply, { matchProps, token });
			break;


		case 'register-print':

			var { registerUser, token } = request.payload;
			
			if (!registerUser || !token) {
				return reply({ status: 'err', apiResponses: ['register-print requires a registerUser and a token'] }).code(500);
			}

			if (typeof registerUser === 'object') {
				registerUser = registerUser._id;
			}
			
			return FingerprintReader.registerPrint(reply, { registerUser, token });
			break;


/***** admin/test functions below here ******/

		case 'grab-and-register-print':
			
			var { user_id, client_id, location_id, machine_id, token } = request.payload;
			
			// probably ONLY used by admin, but we shall see...
			// depends on what I can do to generate a user_id before print scanning,
			// maybe doable as we can scan the license / card first
			if (!user_id || !client_id || !location_id || !machine_id) {
				return reply({ status: 'err', apiResponses: ['grab-and-register-print requires a user ID!'] }).code(500);
			}

			var msgs = [];
			// FIRST print
			RQ.post({
				url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/grabprint1',
				json: true,
				body: {}
			}, (err, response, body) => {
				console.log('grab1 response:');
				console.log(body);
				if (err) {
					return reply({ status: 'err', apiResponses: [err] }).code(500);
				}
				if (!body || body.status !== 'ok') { 
					return reply({ status: 'err', apiResponses: [body.data || body.msg] }).code(500);
				}
				let M = body.data;
				if (body.msg) M += ': ' + body.msg;
				msgs.push(M);

			// SECOND print
				RQ.post({
					url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/grabprint2',
					json: true,
					body: {}
				}, (err, response, body) => {
					console.log('grab2 response:');
					console.log(body);
					if (err) {
						return reply({ status: 'err', apiResponses: [err] }).code(500);
					}
					if (!body || body.status !== 'ok') { 
						return reply({ status: 'err', apiResponses: [body.data || body.msg] }).code(500);
					}
					let M = body.data;
					if (body.msg) M += ': ' + body.msg;
					msgs.push(M);

			// THIRD print
					RQ.post({
						url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/grabprint3',
						json: true,
						body: {}
					}, (err, response, body) => {
						console.log('grab3 response:');
						console.log(body);
						if (err) {
							return reply({ status: 'err', apiResponses: [err] }).code(500);
						}
						if (!body || body.status !== 'ok') { 
							return reply({ status: 'err', apiResponses: [body.data || body.msg] }).code(500);
						}
						let M = body.data;
						if (body.msg) M += ': ' + body.msg;
						msgs.push(M);

						RQ.post({
							url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/addprint',
							json: true,
							body: {
								userid: user_id,
								clientid: client_id,
								locationid: location_id,
								machineid: machine_id,
							}

						}, (err, response, body) => {
							console.log('addprint response:');
							console.log(body);
							if (err) {
								return reply({ status: 'err', apiResponses: msgs.concat(err) }).code(500);
							}
							if (!body || body.status !== 'ok') { 
								return reply({ status: 'err', apiResponses: msgs.concat(body.data || body.msg) }).code(500);
							}
							let M = body.data;
							if (body.msg) M += ': ' + body.msg;
							msgs.push(M);
							return reply({ status: 'ok', apiResponses: msgs }).code(200);
						})
					});

				});

			});
			break;

		case 'grab-match-print':

			var { user_id, client_id, location_id, machine_id, token } = request.payload;

			var msgs = [];
			RQ.post({
				url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/grabprint1',
				json: true,
				body: {}
			}, (err, response, body) => {
				console.log('grab response:');
				console.log(body);
/*
fs.writeFileSync('grabprint1-response-body.txt', err || response && response.body || 'no grabprint1 response.body!');

let foo = body;
try {
	if (typeof foo === 'string') {
		foo = JSON.parse(foo);
	}
} catch (e) {
	foo = 'cannot parse the json: ' + e;
}
msgs.push('grabprint response follows');
msgs.push(foo);
*/
				if (err) {
					return reply({ status: 'err', check1a: true, apiResponses: [err] }).code(500);
				}
				if (!body || body.status !== 'ok') { 
					return reply({ status: 'err', check2a: true, apiResponses: [body.data || body.msg] }).code(500);
				}
				let M = body.data;
				if (body.msg) M += ': ' + (typeof body.msg == 'object' ? JSON.stringify(body.msg) : body.msg);
				msgs.push(M);

				RQ.post({
					url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/matchprint',
					json: true,
					body: {
						userid: user_id || null,
						clientid: null,
						locationid: null,
						machineid: null,
					}
				}, (err, response, body) => {
					console.log('matchprint response:');
					console.log(body);
/*
fs.writeFileSync('matchprint-response-body.txt', err || response && response.body || 'no matchprint response.body!' );

let foo = body;
try {
	if (typeof foo === 'string') {
		foo = JSON.parse(foo);
	}
} catch (e) {
	foo = 'cannot parse the json: ' + e;
}
msgs.push('matchprint response follows');
msgs.push(foo);
*/
					if (err) {
						return reply({ status: 'err', check1: true, apiResponses: msgs.concat(err) }).code(500);
					}
					if (!body || body.status !== 'ok') { 
						let M = body.data;
						if (body.msg) M += ': ' + (typeof body.msg == 'object' ? JSON.stringify(body.msg) : body.msg);
						return reply({ status: 'err', check2: true, apiResponses: msgs.concat(M) }).code(500);
					}
					let M = body.data;
					if (body.msg) M += ': ' + (typeof body.msg == 'object' ? JSON.stringify(body.msg) : body.msg);
					msgs.push(M);
					return reply({ status: 'ok', apiResponses: msgs }).code(200);
				});
			});
			break;

		default:
			return reply({ status: 'err', err: 'unknown action: ' + request.params.action }).code(500);
			break;
	}
	
}
