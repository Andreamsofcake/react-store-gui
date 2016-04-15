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

	, importerFunc = require('./lib/importer')
//	, handler_dir = __dirname + '/route-handlers'
//	, handler_importer = importerFunc(handler_dir)
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

var socketdebug = require('debug')('vending-app-gui:websocket-comm');

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

// HAY see right above? load the routes automatically!
/*
	var UserAccount = require('./routes/UserAccount')
		, ModelListQuery = require('./routes/ModelListQuery')
		, ModelUiConfig = require('./routes/ModelUiConfig')
		, ModelItemSave = require('./routes/ModelItemSave')
		, ModelItemGet = require('./routes/ModelItemGet')
		;

	server.route({
		method: 'post',
		path: '/api/model-list-query',
		handler: ModelListQuery
	});

	server.route({
		method: 'post',
		path: '/api/model-ui-config',
		handler: ModelUiConfig
	});

	server.route({
		method: 'post',
		path: '/api/model-item-save',
		handler: ModelItemSave
	});

	server.route({
		method: 'post',
		path: '/api/model-item-get',
		handler: ModelItemGet
	});
*/

	var TsvProxy = require('./routes/TsvProxy')
		, ComBusEmulator = require('./routes/ComBusEmulator')
		, ActivateModule = require('./routes/ActivateModule')
		, CustomerMatchLogin = require('./routes/CustomerMatchLogin')
		, CustomerRegisterModule = require('./routes/CustomerRegisterModule')
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
						var pl = typeof ctx.req.payload === 'string' ? JSON.parse(ctx.req.payload) : ctx.req.payload;
						if (pl._ws_args) { pl = pl._ws_args; }
						//socketdebug( 'what is PL? ' + typeof pl );
						//socketdebug( pl );

						if (pl.subscribe_to_externals) {
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
		method: 'post',
		path: '/api/emulator',
		handler: ComBusEmulator
	});

	server.route({
		method: 'get',
		path: '/{route*}',
		handler: require('./app/Router.js')
	});

	server.start(function(err) {
		if (err) {
			console.log('server failed to listen! teach it a lesson.');
			console.log(err);
		} else {
			console.log('VENDING APP GUI server is listening');
		}
	});

});
