import path from 'path'
//import fs from 'fs'
import { CheckRegistration, ProxyCall } from '../../../lib/Bootup'
import AddCartDetailsToTransaction from './AddCartDetailsToTransaction'

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

	/*
	var { transactionData } = request.payload;
	all data is on server side for a new transaction...

	FIXME: need to make this a single call to the encrypted proxy
	instead of transactionNew then vendSessionUpdate
	maybe transaction has the session id in it,
	and the proxy can make both calls because it "knows" what to do?

	oops, already attaching special handling to a single method call...
	however, maybe we want to do SomethingCompletelyArbitraryThatIsntALibMethod later, so keep the idea in comments. :-)
	below commented-out-code 'comboCall' is experimental idea on expanded call
	*/

	var { session, cart } = request.payload;

	var epochms = Date.now()
		, transactionData = {
		customer: session.customer,
		client: MI.client,
		location: MI.location,
		machine: MI._id,
		vend_session: session._id,
		transactionOriginatedFrom: MI.type || 'avt', // FIXME need to config this! in MI.stuff (config'd but keeping the || until we're beyond beta)
		data_blob: null,
		products: [],
		local_ts: epochms,
		local_date: new Date(epochms).toUTCString(),
		state: 'new',
	}
	
	transactionData = AddCartDetailsToTransaction(cart, transactionData);
	
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
	
}
