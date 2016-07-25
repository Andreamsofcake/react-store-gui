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

	var { transaction, event } = request.payload;
	
	var list = transaction.events || [];
	
	list.push(event);

	ProxyCall('transactionUpdate', {
		transaction,
		transactionData: {
			state: 'abandoned',
			events: list
		}

	}, (err, TRANSACTION) => {
		if (err) {
			return reply({ status: 'err', msg: err }).code(500);	
		} else if (!TRANSACTION) {
			return reply({ status: 'err', msg: 'failed to update the transaction' }).code(500);	
		}
		TRANSACTION = TRANSACTION.data && TRANSACTION.data.item ? TRANSACTION.data.item : TRANSACTION;
		return reply({ status: 'ok', data: TRANSACTION }).code(200);
	});
}
