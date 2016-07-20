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

import { ProxyCall, CheckRegistration } from '../../../lib/Bootup'

module.exports = function(request, reply) {
	
	var MI = CheckRegistration(true);
	if (MI && MI.registrationData && MI.registrationData) { MI = MI.registrationData; }
	
	if (!MI) {
		return reply({ status: 'err', err: 'machine is not configured??? contact sdk rep!' }).code(500);
	}

	switch (request.params.action) {

		case 'scan-membership-card':
			//curl -s -H "Content-Type: application/json" -X POST -d "{}" http://127.0.0.1:8001/api/v1/bio/eseek/m280/grabcard

			var { token } = request.payload;

			if (!token) {
				return reply({ status: 'err', apiResponses: ['scan-membership-card requires a token'] }).code(500);
			}

			RQ.post({
				url: 'http://localhost:8001/api/v1/bio/eseek/m280/grabcard',
				body: {}, // type === SDK member card?
				json: true
			}, (err, response, body) => {
				if (err) return reply({ status: 'err', err: err }).code(500);
		
				if (body && body.status === 'ok' && body.data) {
					reply({ token, status: 'ok', apiResponse: body.msg || 'valid card', membership_id: body.data }).code(200);
			
				} else {
					reply({ token, status: 'err', apiResponse: body.msg || 'invalid card', msg: body.msg || 'invalid card' }).code(500);
				}
			});
			break;

		case 'match-membership-card':
			var { token, membership_id } = request.payload;

			if (!token || !membership_id) {
				return reply({ status: 'err', apiResponses: ['match-membership-card requires a token and membership_id'] }).code(500);
			}

			ProxyCall('customerGetByClientMembership', {
				client: MI.registrationData.client, // need to get client here....
				membership_id: membership_id

			}, (err, response) => {
		
				if (err) return reply({ status: 'err', error: err }).code(500);

				if (!response || !response.data || !response.data.item) {
					return reply({ status: 'ok', msg: 'no user matched' }).code(404);
				}
			
				reply({ status: 'ok', msg: 'user matched', data: response.data.item }).code(200);
		
			});

			break;

		default:
			return reply({ status: 'err', err: 'unknown action: ' + request.params.action }).code(500);
			break;
	}
	
}
