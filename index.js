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

	var TsvProxy = require('./routes/TsvProxy')
		, ComBusEmulator = require('./routes/ComBusEmulator')
		, ActivateModule = require('./routes/ActivateModule')
		, CustomerMatchLogin = require('./routes/CustomerMatchLogin')
		, CustomerRegisterModule = require('./routes/CustomerRegisterModule')
		, PrintReaderModule = require('./routes/PrintReaderModule')
		, MachineInfo = require('./routes/MachineInfo')
		, ClientSideSetup = require('./routes/ClientSideSetup')
		;

	server.route({
		method: 'post',
		path: '/tsv-proxy/flashapi',
		handler: TsvProxy.Flashapi,
		config: {
			plugins: {
				'hapi-io': {
					event: 'flash-api'
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	});

	server.route({
		method: 'post',
		path: '/tsv-proxy/flashapi/multievent',
		handler: TsvProxy.Multievent,
		config: {
			plugins: {
				'hapi-io': {
					event: 'flash-api-multi-event'
					, mapping: {
						//payload: ['_ws_args']
						//headers: ['accept'],
						//query: ['returnType']
					},
					post: (ctx, next) => {
						var payload = typeof ctx.req.payload === 'string' ? JSON.parse(ctx.req.payload) : ctx.req.payload;
						if (payload._ws_args) { payload = payload._ws_args; }
						//socketdebug( 'what is PL? ' + typeof pl );
						//socketdebug( pl );

						if (payload.subscribe_to_externals) {
							ctx.socket.join( 'flash-api-multi-event' );
							//socketdebug('subscribed socket to flash-api-multi-event' );
						} else {
							//socketdebug('DID NOT SUBSCRIBE TO flash-api-multi-event' );

						}
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	});

	server.route({
		method: 'post',
		path: '/api/activate-module',
		handler: ActivateModule,
		config: {
			plugins: {
				'hapi-io': {
					event: 'activate-module'
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	});

	server.route({
		method: 'post',
		path: '/api/customer-signup-data',
		handler: CustomerRegisterModule,
		config: {
			plugins: {
				'hapi-io': {
					event: 'customer-signup'
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	});

	server.route({
		method: 'post',
		path: '/api/customer-match-login',
		handler: CustomerMatchLogin,
		config: {
			plugins: {
				'hapi-io': {
					event: 'customer-match-login'
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	});

	server.route({
		method: 'get',
		path: '/api/customer-refresh',
		handler: (request, reply) => {
			var customer = request.yar.get('current_customer');
			reply({ status: 'ok', customer: customer });
		}
	});

	server.route({
		method: 'get',
		path: '/api/reset-current-customer',
		handler: (request, reply) => {
			request.yar.set('current_customer', null);
			reply({ status: 'ok' });
		}
	});

	// this is due to problem with session sharing between request/yar and IO
	// hope to link it properly soon!
	server.route({
		method: 'post',
		path: '/api/set-loggedin-customer',
		handler: (request, reply) => {
			if (request.payload.customer) {
				request.yar.set('current_customer', request.payload.customer);
			}
			reply({ status: 'ok' });
		}
	});
	
	server.route({
		method: 'get',
		path: '/kf-test',
		handler: (request, reply) => {
			RQ.get({
				url: 'http://localhost:8087'
			}, (err, response, body) => {
				console.log('kf test response.body:');
				console.log(response.body);
			})
			reply('testing yo').code(200);
		}
	});

	server.route({
		method: 'post',
		path: '/api/print-reader/{action}',
		handler: PrintReaderModule,
		config: {
			plugins: {
				'hapi-io': {
					event: 'api-print-reader' // optional, currently only used by ajax in the client
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	});

	server.route({
		method: 'post',
		path: '/api/big-log/{method}',
		handler: (request, reply) => {
			serverdebug('got big-log POST request, method: ' + request.params.method);
			//serverdebug(request.payload);
			reply({ status: 'ok' });
		}
	});

	server.route({
		method: 'get',
		path: '/api/big-log/{method}',
		handler: (request, reply) => {
			serverdebug('got big-log GET request, method: ' + request.params.method);
			//serverdebug(request.query);
			reply({ status: 'ok' });
		}
	});

	server.route({
		method: 'post',
		path: '/api/emulator',
		handler: ComBusEmulator
	});

	server.route({
		method: 'get',
		path: '/api/machine-info',
		handler: MachineInfo
	});

	server.route({
		method: 'get',
		path: '/{route*}',
		//handler: require('./app/Router.js')
		handler: ClientSideSetup // skipping server side rendering, causing visual flutters
	});

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
			
			var bootupfunc = (err, ok) => {
				//if (err) throw err;
				if (err) {
					// check and see where it fails
					var activated = Bootup.CheckActivation()
						, registered = Bootup.CheckRegistration()
						, next
						;
					if (!activated) {
						// activation fail
						next = Bootup.Activate;
						serverdebug('Bootup failed at activation');
					} else if (!registered) {
						// register fail
						next = Bootup.Register;
						serverdebug('Bootup failed at register');
					} else {
						// data load fail...
						next = Bootup.Data;
						serverdebug('Bootup failed at data loader');
					}
					setTimeout(() => { next(bootupfunc, true); }, process.env.BOOTUP_DELAY_TIME_MS || 5000);

				} else {
					serverdebug('Bootup responded, data:');
					serverdebug(ok);
				}
			}
			
			Bootup.Cascade(bootupfunc);
		}
	});

});
