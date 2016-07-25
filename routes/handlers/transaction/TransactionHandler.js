import SDK from 'sdk-core-lib'
import path from 'path'
import { CheckRegistration, ProxyCall } from '../../../lib/Bootup'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	if (!request.params || !request.params.action) {
		reply({ status: 'err', msg: 'no action found! (hint, check your /url/structure)' }).code(500);	
	}
	
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		return reply({ status: 'err', msg: 'machine is not properly registered, cannot create a transaction' }).code(500);	
	}

	switch (request.params.action) {
	
		case 'new':
			//var { transactionData } = request.payload;
			// all data is on server side for a new transaction...
			
			// FIXME: need to make this a single call to the encrypted proxy
			// instead of transactionNew then vendSessionUpdate
			// maybe transaction has the session id in it,
			// and the proxy can make both calls because it "knows" what to do?
			
			// oops, already attaching special handling to a single method call...
			// however, maybe we want to do SomethingCompletelyArbitraryThatIsntALibMethod later, so keep the idea in comments. :-)
			// below commented-out-code 'comboCall' is experimental idea on expanded call

			var { session } = request.payload;

			if (!MI || !MI._id || !MI.vendor_id || !MI.client || !MI.location) {
				return reply({ status: 'err', msg: 'machine is not properly registered, cannot create a transaction' }).code(500);	
			}

			var transactionData = {
				customer: session.customer,
				client: MI.client,
				location: MI.location,
				machine: MI._id,
				vend_session: session._id,
				transactionOriginatedFrom: 'avt', // FIXME need to config this! in MI.stuff
				//data_blob: null,
				//products: []
			}
			
			/*
			ProxyCall('comboCall', {
				call: 'transactionNew',
				data: {
					session: session._id,
					transactionData
				}
			}, (err, TRANSACTION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!TRANSACTION) {
					return reply({ status: 'err', msg: 'failed to create the transaction' }).code(500);	
				}
				TRANSACTION = TRANSACTION.data && TRANSACTION.data.item ? TRANSACTION.data.item : TRANSACTION;
				return reply({ status: 'ok', data: TRANSACTION }).code(200);
			});
			*/

			//*
			ProxyCall('transactionNew', {
				session: session._id,
				transactionData
			}, (err, TRANSACTION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!TRANSACTION) {
					return reply({ status: 'err', msg: 'failed to create the transaction' }).code(500);	
				}
				TRANSACTION = TRANSACTION.data && TRANSACTION.data.item ? TRANSACTION.data.item : TRANSACTION;

				/*
				ProxyCall('vendSessionUpdate', {
					session,
					sessionData: {
						transaction: TRANSACTION._id,
						state: 'active'
					}
				}, (err, SESSION) => {
					if (err) {
						return reply({ status: 'err', msg: err }).code(500);	
					} else if (!SESSION) {
						return reply({ status: 'err', msg: 'failed to add a user the session' }).code(500);	
					}
					SESSION = SESSION.data && SESSION.data.item ? SESSION.data.item : SESSION;
					return reply({ status: 'ok', data: { SESSION } }).code(200);
				});
				*/
				return reply({ status: 'ok', data: TRANSACTION }).code(200);
			});
			//*/
			break;

		case 'update':
			// FIXME: a little scary to have the GUI managing the transaction object, but OK for now.
			var { transaction, transactionData } = request.payload;

			ProxyCall('transactionUpdate', {
				transaction,
				transactionData
			}, (err, TRANSACTION) => {
				if (err) {
					return reply({ status: 'err', msg: err }).code(500);	
				} else if (!TRANSACTION) {
					return reply({ status: 'err', msg: 'failed to update the transaction' }).code(500);	
				}
				TRANSACTION = TRANSACTION.data && TRANSACTION.data.item ? TRANSACTION.data.item : TRANSACTION;
				return reply({ status: 'ok', data: TRANSACTION }).code(200);
			});
			break;


	}
	
}
