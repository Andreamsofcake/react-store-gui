import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var { user_id, client_id, location_id, machine_id, token } = request.payload;

	switch (request.params.action) {
		case 'grab-and-register-print':
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

		case 'match-print':
			var msgs = [];
			RQ.post({
				url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/grabprint1',
				json: true,
				body: {}
			}, (err, response, body) => {
				console.log('grab response:');
				console.log(body);

				if (err) {
					return reply({ status: 'err', check1a: true, apiResponses: [err] }).code(500);
				}
				if (!body || body.status !== 'ok') { 
					return reply({ status: 'err', check2a: true, apiResponses: [body.data || body.msg] }).code(500);
				}
				let M = body.data;
				if (body.msg) M += ': ' + body.msg;
				msgs.push(M);

				RQ.post({
					url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/matchprint',
					json: true,
					body: {
						userid: user_id || null
					}
				}, (err, response, body) => {
					console.log('matchprint response:');
					console.log(body);
					if (err) {
						return reply({ status: 'err', check1: true, apiResponses: msgs.concat(err) }).code(500);
					}
					if (!body || body.status !== 'ok') { 
						return reply({ status: 'err', check2: true, apiResponses: msgs.concat(body.data || body.msg) }).code(500);
					}
					let M = body.data;
					if (body.msg) M += ': ' + body.msg;
					msgs.push(M);
					return reply({ status: 'ok', apiResponses: msgs }).code(200);
				});
			});
			break;
	}
	
}
