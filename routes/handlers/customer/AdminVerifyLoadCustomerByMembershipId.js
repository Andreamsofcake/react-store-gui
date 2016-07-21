//import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'

import { ProxyCall, CheckRegistration } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	, simulatorDelay = 3000
	;

module.exports = function(request, reply) {
	
	var { membership_id, adminPrintUser, user } = request.payload;
	
	debug('membership_id: ' + membership_id );
	
	var MI = CheckRegistration(true);
	
	if (MI && MI.registrationData && MI.registrationData.client) {
		if (membership_id && adminPrintUser && user && user._id && adminPrintUser.userid) {
			
			var checkMembership = user.client_membership_ids.filter( ID => { return ID.client == MI.registrationData.client } );
			if (!checkMembership || !checkMembership.length) {
				if (err) return reply({ status: 'err', error: 'cannot client-verify a Customer that is not a member of the Client' }).code(500);
			}

			/*
			// below call will add verification, and also bring back the updated customer record... no need to "get by membership" afterwards
			ProxyCall('customerGetByClientMembership', {
				membership_id,
				client: MI.registrationData.client

			}, (err, response) => {
			*/
			
			ProxyCall('customerAddClientVerification', {
				
				customer: user,
				verificationData: {
					client: MI.registrationData.client,
					verified_id: adminPrintUser.userid.replace('admin-', '') // machine GUI tags admin user ids in the bio-graph with admin-*
				}
				
			}, (err, response) => {

				if (err) return reply({ status: 'err', error: err }).code(500);

				if (!response || !response.data || !response.data.item) {
					return reply({ status: 'ok', msg: 'no user found' }).code(404);
				}
				
				var customer = response.data.item;
				
				// ok, let's get credit for the customer:
				// (eventually should ComboCall this in the Proxy)
				ProxyCall('creditCustomerGetByClient', {
					customer: customer._id,
					client: MI.registrationData.client
				}, (err, response) => {
					
					if (err && typeof err === 'object' && err.error) {
						err = err.error;
					}
					
					//debug('oasdhkfllkHSilHL');
					//debug(response);
					
					if (err && err !== 'credit not found') return reply({ status: 'err', error: err }).code(500);
					if (!response || !response.data || !response.data.item) {
						return reply({ status: 'ok', msg: 'customer found', customer, credit: { current_credit_cents: 0 } }).code(200);
					}
					reply({ status: 'ok', msg: 'customer found', customer, credit: { current_credit_cents: response.data.item.current_credit_cents } }).code(200);
				});
		
			});
		} else {
			return reply({ status: 'err', error: 'I need a membership ID' }).code(500);
		}
	} else {
		return reply({ status: 'err', error: 'machine is not configured properly yet, please contact your SDK rep.' }).code(500);
	}

}