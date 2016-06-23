'use strict'
import fs from 'fs'
import path from 'path'
import mysql from 'mysql'
import RQ from 'request'
//import MDL from './machineDataLoader'
//import { testProxy, apiProxyCall } from './encryptedProxy'
import MDLE from './machineDataLoaderEncrypted'
import { DataImportToTsv } from './DataImport'
import encrypt from 'simple-encryptor'
//import SDK from 'sdk-core-lib'

var filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:' + ACTION)
	, DELAY_TIME = process.env.BOOTUP_DELAY_TIME_MS || 60 * 5 * 1000
	, ACTIVATE_FILE = __dirname + '/.activate.json'
	, REGISTRATION_FILE = __dirname + '/.registration.json'
	, encryptor = encrypt( process.env.BASE_ENCRYPTION_KEY )
	, creds = {
		user: process.env.MYSQL_USER || false,
		password: process.env.MYSQL_PASSWORD || false,
		database: process.env.MYSQL_DATABASE || 'tsv',
		port: process.env.MYSQL_PORT || 3306,
		host: process.env.MYSQL_HOST || 'localhost'
	}
	, databomb
	;

if (!creds.user || !creds.password) {
	debug(creds);
	throw new Error('Bootup requires Mysql credentials in .env');
}

var connReady = false
	, conn // = mysql.createConnection(creds)
	;

function makeMysqlConnection() {

	conn = mysql.createConnection(creds);

	// attach error handler so mysql doesn't trash the whole app process:
	conn.on('error', function(err) {
		console.log("--------------------->>>>\nERROR! something something something dark side mysql\n---------------------");
		console.log(err);
		console.log("--------------------->>>>");
		// blindly reconnect on error until we know what the "server disconnected" error looks like.
		connReady = false;
		makeMysqlConnection();
	});

	conn.connect((err, ok) => { if (!err) { connReady = true; } else {
		//throw new Error(err);
		console.log("--------------------->>>>\nERROR! failed to connect to mysql\n---------------------");
		console.log(err);
		console.log("--------------------->>>>");
	} });

}

makeMysqlConnection();

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

	if (process.env.SKIP_ACTIVATION) {
		if (cascade) { return Register(cb, cascade); }
		return cb(null, true);
	} else {
		conn.query('select _value as activation_key from machinesettings where _key = "ActivationKey"', (err, rows, fields) => {
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
					}, (err, response, body) => {
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
							debug('machine activation failed, key: ' + rows[0].activation_key);
							cb('error: machine activation failed');
						}
					});
				}

			} else {
				cb('error: cannot find activation key');
			}
		});
	}

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
	
	var teamViewer_id = TeamViewerID();

	try {
		if (!force) {
			fs.accessSync(REGISTRATION_FILE, fs.F_OK);
			var registered = fs.readFileSync(REGISTRATION_FILE).toString()
				, json = JSON.parse(registered)
				;
	
			if (json && json.success === true) {
				debug('registration exists.... continue [try block]');
				if (!json.registrationData || !json.registrationData.client || !json.registrationData.location || !json.registrationData.teamViewer_id) {
					// periodically reach out and check,
					// missing props means the machine was not recognized yet and needs configuring from cloud
					// check every five minutes, this info is necessary for transactions, customers, etc.
					setTimeout(() => { Register(cb, false, true) }, DELAY_TIME );
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

	conn.query('select _value as serial from machinesettings where _key = "MachineSerialNumber"', (err, rows, fields) => {
		if (err) cb (err);
		if (rows && rows.length && rows[0] && rows[0].serial) {

			// eventually fold this into SDK LIB so we can do __auth etc:
			var url = process.env.DATA_API_PROXY_URL + '/machine/register'
				, sendData = { vendor_id: rows[0].serial, machine_type: process.env.MACHINE_TYPE || 'avt', teamViewer_id }
				, digest = encryptor.encrypt(sendData)
				//, { nonce, machineKey } = getNonceAndMachineKey()
				;
			RQ.post({
				url: url, // http://clients.sdkcore.com
				body: {
					digest
				},
				headers: {
					'SDK-machine-key': rows[0].serial // 'foo'
				},
				json: true
			}, (err, response, body) => {
				if (err) cb(err);
				if (body && body.status == 'ok' && body.data) {
					debug('registration call success');
					debug(body.data);
					var D = new Date()
						, fileData = { success: true, machine_id: rows[0].serial, registrationData: body.data, datestamp: D.toString(), ts: Date.now() }
						;
					fs.writeFileSync(REGISTRATION_FILE, JSON.stringify(fileData));
					if (cascade) { Data(cb); } else { cb(null, true); }
					if (!body.data.client || !body.data.location || !body.data.teamViewer_id) {
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

export function CheckActivation(returnData) {
	returnData = returnData || false;
	var success = true;
	try {
		fs.accessSync(ACTIVATE_FILE, fs.F_OK);
	} catch(e) {
		success = false;
	}
	if (returnData && success) {
		var activate = fs.readFileSync(ACTIVATE_FILE).toString();
		return JSON.parse(activate);
	}
	return success;
}

export function CheckRegistration(returnData) {
	returnData = returnData || false;
	var success = true;
	try {
		fs.accessSync(REGISTRATION_FILE, fs.F_OK);
	} catch(e) {
		success = false;
	}
	if (returnData && success) {
		var registered = fs.readFileSync(REGISTRATION_FILE).toString();
		return JSON.parse(registered);
	}
	return success;
}

export function TeamViewerID() {
	var teamViewerID = 'unknown';
	try {
		var execSync = require('child_process').execSync;
		registrystring = "" + execSync("reg query HKLM\\software\\wow6432node\\teamviewer /v ClientID");
		registrywords = registrystring.split('REG_DWORD');
		teamViewerID = parseInt(registrywords[1]);
	} catch(e) {
		
	}
	return teamViewerID;
}

// get data 
export function Data(cb) {
	if (!cb) { throw new Error('I need a callback to push data and errors to!'); }
	var MI = CheckRegistration(true);
	var oldMI = MI;
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		debug('Error, machine is not configured properly yet.');
		debug(MI);
		debug(oldMI);
		//cb('error, cannot load the machine_id from '+REGISTRATION_FILE+'!');
		return cb('Error, machine is not configured properly yet. Please contact your SDK admin or sales rep!');
	}
	debug('try to get some data...');

	MDLE(MI, (err, data) => {
		if (err) return cb(err);
		debug('ok, lettuce DataImportToTsv:');
		debug('data keys: '+Object.keys(data));
		
		databomb = data;
		
		DataImportToTsv( data, conn, (err, ok) => {
			debug('DataImportToTsv responded...');
			debug(err);
			debug(ok);
			if (err) return cb(err);
			cb(null, ok);
		});

	});
}

export function ConfigData() {
	return databomb || false;
}

// test encrypted proxy
export function ProxyTest(data, cb) {
	if (!cb) { throw new Error('I need a callback to push data and errors to!'); }
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		debug('Error, machine is not configured properly yet.');
		//cb('error, cannot load the machine_id from '+REGISTRATION_FILE+'!');
		return cb('Error, machine is not configured properly yet. Please contact your SDK admin or sales rep!');
	}
	//return testProxy({some: 'data'}, getEncryptors(MI), cb);
	var encryptors = getEncryptors(MI);
	return makeRequest(encryptors, encryptors.dataEncryptor.encrypt({some: 'test data'}), cb);
}

export function ProxyCall(handler, data, cb) {
	if (!cb) { throw new Error('I need a callback to push data and errors to!'); }
	if (!handler) { throw new Error('I need a handler for processing (HINT: string, SDK lib method name)!'); }
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (!MI || !MI.vendor_id || !MI.client || !MI.location) {
		debug('Error, machine is not configured properly yet.');
		//cb('error, cannot load the machine_id from '+REGISTRATION_FILE+'!');
		return cb('Error, machine is not configured properly yet. Please contact your SDK admin or sales rep!');
	}
	//return apiProxyCall(method, data, getEncryptors(MI), cb);
	var encryptors = getEncryptors(MI);
	makeRequest(encryptors, encryptors.dataEncryptor.encrypt({ handler, data }), cb);
}

export function DecodeProxyCall(digest, nonce) {
	/*
	debug('digest decoded with key: ' + encryptors.encryptionKey);
	debug('decode: '+digest);
	return encryptors.dataEncryptor.decrypt(digest);
	*/
	//*
	var MI = CheckRegistration(true);
	MI = MI && MI.registrationData ? MI.registrationData : false;
	if (MI) {
		debug('[DecodeProxyCall] received nonce: '+nonce);
		debug('[DecodeProxyCall] get encryptors');
		var encryptors = getEncryptors(MI, nonce);
		debug('digest decoded with key: ' + encryptors.encryptionKey);
		debug('[DecodeProxyCall] returning decoded digest');
		return encryptors.dataEncryptor.decrypt(digest);
	}
	return null;
	//*/
}

/*export */function dataEncryptionKey(MI, nonce) {
	if (!MI) {
		MI = CheckRegistration(true);
		MI = MI && MI.registrationData ? MI.registrationData : false;
	}
	var dateBuild = new Date(nonce);
	if (MI && MI.client && MI.location && MI.vendor_id) {
		/*****

			DEVNOTE: we cannot encrypt the key to build the digest,
			because this encryption library will encrypt data differently EVERY TIME (which is a good thing)
			and thus we cannot create the same key on two sides from the data string

			return encryptor.encrypt(dateBuild.getUTCHours() + '|' + dateBuild.getUTCMinutes() + '|' + dateBuild.getUTCSeconds() + '|' + dateBuild.getUTCMilliseconds() + '|' + MI._id + '|'  + MI.client + '|' + MI.location + '|' + MI.vendor_id);

		****/

		//return dateBuild.getUTCHours() + '|' + dateBuild.getUTCMinutes() + '|' + dateBuild.getUTCSeconds() + '|' + dateBuild.getUTCMilliseconds() + '|' + MI._id + '|'  + MI.client + '|' + MI.location + '|' + MI.vendor_id;
		// better key generation, prepping for shuffle:
		var keyParts = [
			dateBuild.getUTCHours(),
			dateBuild.getUTCMinutes(),
			dateBuild.getUTCSeconds(),
			dateBuild.getUTCMilliseconds(),
			MI._id,
			MI.client,
			MI.location,
			MI.vendor_id
		];
		return keyParts.join('|');
	}
	return false;
}

export function getEncryptors(MI, nonce) {
	var nonce = nonce || Date.now()
		, machineKey = encryptor.encrypt(MI.vendor_id)
		, encryptionKey = dataEncryptionKey(MI, nonce)
		, dataEncryptor = encrypt( encryptionKey )
		;
	debug('[getEncryptors] encryption key created: ' + encryptionKey);
	debug('[getEncryptors] machine key created: ' + machineKey);
	return { nonce, machineKey, dataEncryptor, encryptionKey }
}

function makeRequest(encryptors, digest, cb) {

	var { nonce, machineKey } = encryptors
		, url = process.env.DATA_API_PROXY_URL + '/machine/api-proxy'
		;
	
	debug('posting digest');
	debug(digest);
	
	RQ.post({
		url: url, // http://clients.sdkcore.com
		body: { digest, nonce },
		headers: { 'SDK-machine-key': machineKey },
		json: true
	}, (err, response, body) => {
		if (err) cb(err);
		if (body && body.digest && body.nonce) {
			debug('ok, we have a body and stuff ... try to decode');
			body = DecodeProxyCall(body.digest, body.nonce);
			debug('decoded:');
			debug(body);
			if (body && body.status == 'ok' && body.data) {
				debug('call success');
				return cb(null, body);
			}
			return cb(body);
		}
		debug(url);
		debug(body);
		cb('error: encryption proxy request failed');

	});

}

function testProxy(data, encryptors, cb) {
	makeRequest(encryptors, encryptors.dataEncryptor.encrypt(data), cb);
}

function apiProxyCall(handler, data, encryptors, cb) {
	makeRequest(encryptors, encryptors.dataEncryptor.encrypt({ handler, data }), cb);
}
