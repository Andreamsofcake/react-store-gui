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
	
	var { customer, amount_cents, cart } = request.payload;
	
	debug('customerID: ' + customer );
	debug('spendAmountCents: ' + amount_cents );

	var MI = CheckRegistration(true);
	
	if (MI && MI.registrationData && MI.registrationData.client) {
		if (customer && amount_cents) {

var tx_data = {
	customer: customer,
	client: MI.registrationData.client,
	location: MI.registrationData.location,
	machine: MI.registrationData._id,
	vend_session: null,
	data_blob: null,
	transactionOriginatedFrom: 'avt',
	products: []
}

, sesh_data = {
	customer: customer,
	// sessionNew() picks these up from the public machine ID:
	// client: MI.registrationData.client,
	// location: MI.registrationData.location,
	// machine: MI.registrationData._id,
	public_machine_id: MI.registrationData.vendor_id,
	remote_session_id: 'test-sesh-id-' + (Math.random().toFixed(12) * 10)
}

			ProxyCall('vendSessionNew', {
				remoteSessionId: sesh_data.remote_session_id,
				machine: MI.registrationData.vendor_id
			}, (err, SESSION) => {

				if (err) throw err;
				if (!SESSION) { throw new Error('cannot make a session???'); }
				SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;

				ProxyCall('vendSessionUpdate', {
					session: SESSION._id,
					sessionData: sesh_data

				}, (err, ok) => {

					if (err) throw err;
					if (!ok) { throw new Error('cannot update a session???'); }

					console.log('made and updated a session... ' + SESSION._id);

					tx_data.vend_session = SESSION._id;
					cart.detail.forEach( D => {
						tx_data.products.push(D.productName); // AVT product has mongo ID as productName
					});

					tx_data.data_blob = cart;
					tx_data.total_amount_charged_cents = cart.summary.TotalPrice * 100;
					tx_data.total_amount_paid_cents = tx_data.amount_cents;

					tx_data.payments = [ {
						amount_paid_cents: tx_data.total_amount_paid_cents,
						payment_type: 'credits'
					} ];
				
					tx_data.local_ts = Date.now();
					tx_data.local_data = new Date(tx_data.local_ts).toUTCString();
				
					ProxyCall('transactionNew', {
						session: tx_data.vend_session,
						transactionData: tx_data
					}, (err, TX) => {
						if (err) throw err;
						if (!TX) { throw new Error('cannot create a transaction??'); }
						TX = TX.data && TX.data.item ? TX.data.item : TX;
						console.log('made a transaction... ' + TX._id);
						//createTransactions(count);

						ProxyCall('creditCustomerSpend', {
							customer,
							client: MI.registrationData.client,
							machine: MI.registrationData._id,
							amount_cents,
							transaction: TX._id

						}, (err, response) => {
		
							if (err) return reply({ status: 'err', error: err }).code(500);

							if (!response || !response.data || !response.data.item) {
								return reply({ status: 'ok', msg: 'failed to spend credit' }).code(404);
							}
				
							reply({ status: 'ok', msg: 'credit spend success', credit: response.data.item }).code(200);
		
						});

					});
				});
			});

		} else {
			return reply({ status: 'err', error: 'I need a customerID && spend amount' }).code(500);
		}
	} else {
		return reply({ status: 'err', error: 'machine is not configured properly yet, please contact your SDK rep.' }).code(500);
	}

}