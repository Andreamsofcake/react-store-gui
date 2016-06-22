require('babel-register')({
  presets: ['es2015', 'react'],
});

require('dotenv');

var Hapi = require('hapi')
	, Joi = require('joi')
	, Inert = require('inert')
	, Path = require('path')
//	, mongoose = require('mongoose')
//	, hapi_redis = require('hapi-redis')
//	, hapi_mongoose = require('./lib/hapi-mongoose')
//	, utils = require('./lib/utils')
	, fs = require('fs')

	, SDK = require('sdk-core-lib')
	, Bootup = require('./lib/Bootup')
	, RQ = require('request')

	, importerFunc = require('./lib/importer')
//	, handler_dir = __dirname + '/route-handlers'
//	, handler_importer = importerFunc(handler_dir)

	, socketdebug = require('debug')('vending-app-gui:websocket-comm')
	, serverdebug = require('debug')('vending-app-gui:server-comm')

	;

/****

	>

	improve this with Hapi Glue sometime soon
	https://github.com/hapijs/glue

	>

	authorization: make a custom plugin based on hapi-auth-basic
	so we can capture the inbound postbody.auth {} object from the library

	>

****/


var server = new Hapi.Server();
server.connection({
	host: 'localhost'
	, port: process.env.SERVER_PORT || 8087
	/*, routes: {
		files: {
			relativeTo: Path.join(__dirname, 'public')
		}
	}*/
});

server.register(Inert, () => {});
/*
var io = require('socket.io')(server.listener);

io.on('connection', function (socket) {

    socket.emit('Oh hii!');

    socket.on('burp', function () {
        socket.emit('Excuse you!');
    });
});
*/

//*
if (!process.env.COOKIE_PASSWORD) {
	throw new Error('no cookie password found in env!');
}

/*
console.log('yep, we have a cookie password: '+process.env.COOKIE_PASSWORD);
//*/

server.register([
//*
// don't need yar in the Vending Machine app!
// FALSE: using now for tracking
	{
		register: require('yar'),
		options: {
			storeBlank: false,
			cookieOptions: {
				password: process.env.COOKIE_PASSWORD,
				isSecure: false
			}
		}
	} ,
//*/
	{
		register: require('hapi-io'),
		options: {
			//socketio: { OPTIONS CONFIG }
		}
	}
], err => {

	if (err) throw /* GIANT_TANTRUM() */ err;

	['assets', 'js', 'css', 'gfx'].forEach( DIR => {

		server.route({
			method: 'GET',
			path: '/'+DIR+'/{filename*}',
			handler: {
				directory: {
					path: 'public/'+DIR,
					redirectToSlash: true,
					index: true
				}
			}
		});

	});

	// allows some pre-config on server.app by delayed requiring:
	//var routes = require('./route-handlers/routes')(route_handlers, server);
	//server.route(routes);

// HAY see right above? load the routes automatically! (requires more organization)

	var routes = require('./routes/manual-config');
	
	routes.forEach( R => {
		server.route(R);
	});
/*
	var TsvProxy = require('./routes/TsvProxy')
		, ComBusEmulator = require('./routes/ComBusEmulator')
		, ActivateModule = require('./routes/ActivateModule')
		, CustomerMatchLogin = require('./routes/CustomerMatchLogin')
		, CustomerRegisterModule = require('./routes/CustomerRegisterModule')
		, PrintReaderModule = require('./routes/PrintReaderModule')
		, MachineInfo = require('./routes/MachineInfo')
		, ClientSideSetup = require('./routes/ClientSideSetup')
		;
*/
	server.start(function(err) {
		if (err) {
			console.log('server failed to listen! teach it a lesson.');
			console.log(err);
		} else {
			console.log('VENDING APP GUI server is listening');
			
			/********


					and right about here is where you can
					set up the ping loop on the NetTSV, that you feed via websocket
					
					ACTUALLY NO:
					
					it should be in TsvProxy, triggered after the app first websockets out for multievent
					(it's definitely ready at that time)


			****************************************/
			
			var bootupfunc = (err, configData) => {
				//if (err) throw err;
				if (err) {
					// check and see where it fails
					
					serverdebug(err);
					
					var activated = Bootup.CheckActivation(true)
						, registered = Bootup.CheckRegistration(true)
						, next
						;

					registered = registered && registered.registrationData ? registered.registrationData : false;
					
					if (!activated) {
						// activation fail
						next = Bootup.Activate;
						serverdebug('Bootup failed at activation');
						serverdebug(activated);
					} else if (!registered || !registered.client) {
						// register fail
						next = Bootup.Register;
						serverdebug('Bootup failed at register');
						serverdebug(registered);
					} else {
						// data load fail...
						next = Bootup.Data;
						serverdebug('Bootup failed at data loader');
					}
					setTimeout(() => { next(bootupfunc, true, true); }, process.env.BOOTUP_DELAY_TIME_MS || 5000);

				} else {
					serverdebug('Bootup responded, data:');
					serverdebug(err);
					serverdebug( configData );
					//serverdebug( JSON.stringify(configData, null, 4) );
					fs.writeFileSync('bootup-data-retrieval.json', JSON.stringify(configData, null, 4));
					var registered = Bootup.CheckRegistration(true);
					registered = registered && registered.registrationData ? registered.registrationData : false;
					if (!registered || !registered.client || !registered.location) {
						serverdebug('machine is not fully registered yet, start looping...');
						Bootup.Register(null, false, true);
					}
				}
			}
			
			Bootup.Cascade(bootupfunc);

			// testing stuff below here:

			/*

			Bootup.ProxyTest({ some: 'data' }, (err, ok) => {
				serverdebug('ProxyTest responded...');
				serverdebug(err);
				serverdebug(ok);
			});
			//* /
			
			var MI = Bootup.CheckRegistration(true);
			MI = MI && MI.registrationData ? MI.registrationData : false;
			
			Bootup.ProxyCall('machineGetById', {
				id: MI._id
			}, (err, data) => {
				if (err) {
					serverdebug('proxy call failed');
					serverdebug(err);
				} else if (!data) {
					serverdebug('proxy call no data returned');
					serverdebug(err);
				} else {
					serverdebug('proxy call OK');
					serverdebug(data);
				}
			});
			*/

		}
	});

});
