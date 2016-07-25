import path from 'path'
//import fs from 'fs'
import { CheckRegistration, ProxyCall } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;

	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		return reply({ status: 'err', msg: 'machine is not properly registered, cannot create a session' }).code(500);	
	}

	var { amount_cents, customer, transaction } = request.payload;

	ProxyCall('creditCustomerSpend', {
		customer,
		client: MI.registrationData.client,
		machine: MI.registrationData._id,
		amount_cents,
		transaction: transaction._id

	}, (err, response) => {

		if (err) return reply({ status: 'err', error: err }).code(500);

		if (!response || !response.data || !response.data.item) {
			return reply({ status: 'ok', msg: 'failed to spend credit' }).code(404);
		}

		reply({ status: 'ok', msg: 'credit spend success', credit: response.data.item, transaction: response.data.transaction }).code(200);

	});
}
