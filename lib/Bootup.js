'use strict'
import fs from 'fs'
import path from 'path'
import mysql from 'mysql'
import RQ from 'request'
import MDL from './machineDataLoader'
//import SDK from 'sdk-core-lib'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:' + ACTION)
	, DELAY_TIME = process.env.BOOTUP_DELAY_TIME_MS || 60 * 5 * 1000
	, ACTIVATE_FILE = __dirname + '/.activate.json'
	, REGISTRATION_FILE = __dirname + '/.registration.json'
	, creds = {
		user: process.env.MYSQL_USER || false,
		password: process.env.MYSQL_PASSWORD || false,
		database: process.env.MYSQL_DATABASE || 'tsv',
		port: process.env.MYSQL_PORT || 3306,
		host: process.env.MYSQL_HOST || 'localhost'
	}
	;

if (!creds.user || !creds.password) {
	debug(creds);
	throw new Error('Bootup requires Mysql credentials in .env');
}

var connReady = false
	, conn = mysql.createConnection(creds)
	;

conn.connect((err, ok) => { if (!err) { connReady = true; } else { throw new Error(err); } });

export function Cascade(cb) {
	Activate(cb, true);
}

export function Activate(cb, cascade, force) {
	if (typeof cb !== 'function') {
		cb = () => {}; // make sure there's always a callback, even if empty
	}
	cascade = cascade || false;
	force = force || false;
	if (!connReady) {
		return setTimeout(() => { Activate(cb, cascade) }, 250);
	}

	try {
		if (!force) {
			fs.accessSync(ACTIVATE_FILE, fs.F_OK)
			var activated = fs.readFileSync(ACTIVATE_FILE).toString()
				, json = JSON.parse(activated)
				;
	
			if (json && json.success === true) {
				debug('activation exists.... continue');
				if (cascade) { return Register(cb, cascade); }
				return cb(null, true);
			}
		}

	} catch(e) {
		if (e.code !== 'ENOENT' || e.syscall !== 'access') {
			return cb(e);
		}
	}

	conn.query('select _value as activation_key from machinesettings where _key = "ActivationKey"', function(err, rows, fields) {
		if (err) cb (err);
		if (rows && rows.length && rows[0] && rows[0].activation_key) {

			if (process.env.CANNED_API_DATA) {
				debug('activation call success');
				var D = new Date()
					, body = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success"}
					, fileData = { success: true, activationResponse: body, datestamp: D.toString(), ts: Date.now() }
					;
				fs.writeFileSync(ACTIVATE_FILE, JSON.stringify(fileData) );
				if (cascade) { return Register(cb, cascade); }
				return cb(null, true);

			} else {
				RQ.post({
					url: 'http://localhost:8085/tsv/flashapi',
					body: [ 'activate', rows[0].activation_key ],
					json: true
				}, function(err, response, body) {
					if (err) cb(err);
					if (body && body.result === 'SUCCESS') {
						debug('activation call success');
						var D = new Date()
							, fileData = { success: true, activationResponse: body, datestamp: D.toString(), ts: Date.now() }
							;
						fs.writeFileSync(ACTIVATE_FILE, JSON.stringify(fileData));
						if (cascade) { return Register(cb, cascade); }
						return cb(null, true);
					} else {
						cb('error: machine activation failed');
					}
				});
			}

		} else {
			cb('error: cannot find activation key');
		}
	});

}

export function Register(cb, cascade, force) {
	if (typeof cb !== 'function') {
		cb = () => {}; // make sure there's always a callback, even if empty
	}
	cascade = cascade || false;
	force = force || false;
	if (!connReady) {
		return setTimeout(() => { Register(cb, cascade) }, 500);
	}

	try {
		if (!force) {
			fs.accessSync(REGISTRATION_FILE, fs.F_OK);
			var registered = fs.readFileSync(REGISTRATION_FILE).toString()
				, json = JSON.parse(registered)
				;
	
			if (json && json.success === true) {
				debug('registration exists.... continue');
				if (!json.registrationData || !json.registrationData.client || !json.registrationData.location) {
					// periodically reach out and check,
					// missing props means the machine was not recognized yet and needs configuring from cloud
					// check every five minutes, this info is necessary for transactions, customers, etc.
					setTimeout(() => { Register() }, DELAY_TIME );
				}
				if (cascade) { return Data(cb); }
				return cb(null, true);
			}
		}

	} catch(e) {
		if (e.code !== 'ENOENT' || e.syscall !== 'access') {
			return cb(e);
		}
	}

	conn.query('select _value as serial from machinesettings where _key = "MachineSerialNumber"', function(err, rows, fields) {
		if (err) cb (err);
		if (rows && rows.length && rows[0] && rows[0].serial) {

			// eventually fold this into SDK LIB so we can do __auth etc:
			var url = process.env.CLIENT_PORTAL_URL + '/machine-activate';
			RQ.post({
				url: url, // http://clients.sdkcore.com
				body: { vendor_id: rows[0].serial, machine_type: process.env.MACHINE_TYPE || 'avt' },
				json: true
			}, function(err, response, body) {
				if (err) cb(err);
				if (body && body.status == 'ok' && body.data) {
					debug('registration call success');
					var D = new Date()
						, fileData = { success: true, machine_id: rows[0].serial, registrationData: body.data, datestamp: D.toString(), ts: Date.now() }
						;
					fs.writeFileSync(REGISTRATION_FILE, JSON.stringify(fileData));
					if (cascade) { Data(cb); } else { cb(null, true); }
					if (!body.data.client || !body.data.location) {
						// periodically reach out and check,
						// missing props means the machine was not recognized yet and needs configuring from cloud
						// check every five minutes, this info is necessary for transactions, customers, etc.
						setTimeout(() => { Register() }, DELAY_TIME );
					}
				} else {
					debug(url);
					debug(body);
					debug(JSON.stringify({ vendor_id: rows[0].serial, machine_type: process.env.MACHINE_TYPE || 'avt' }));
					cb('error: machine registration failed');
				}
			});

		} else {
			cb('error: cannot find serial number for registration!');
		}
	});
}

export function CheckActivation(returnFile) {
	returnFile = returnFile || false;
	var success = true;
	try {
		fs.accessSync(ACTIVATE_FILE, fs.F_OK);
	} catch(e) {
		success = false;
	}
	if (returnFile && success) {
		var activate = fs.readFileSync(ACTIVATE_FILE).toString();
		return JSON.parse(activate);
	}
	return success;
}

export function CheckRegistration(returnFile) {
	returnFile = returnFile || false;
	var success = true;
	try {
		fs.accessSync(REGISTRATION_FILE, fs.F_OK);
	} catch(e) {
		success = false;
	}
	if (returnFile && success) {
		var registered = fs.readFileSync(REGISTRATION_FILE).toString();
		return JSON.parse(registered);
	}
	return success;
}

// get data 
export function Data(cb) {
	if (!cb) { throw new Error('I need a callback to push data and errors to!'); }
	var data;
	try {
		data = JSON.parse(fs.readFileSync( REGISTRATION_FILE ).toString());
	} catch(e) {
		debug('error, cannot load the machine_id from '+REGISTRATION_FILE+'!');
		cb(e);
		return;
	}
	if (data && data.machine_id) {
		return MDL(data.machine_id, cb);
	}
	cb('error: no machine_id found');
}