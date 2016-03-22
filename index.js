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

var server = new Hapi.Server();
server.connection({
	host: 'localhost'
	, port: process.env.SERVER_PORT || 8086
	/*, routes: {
		files: {
			relativeTo: Path.join(__dirname, 'public')
		}
	}*/
});

server.register(Inert, () => {});

var io = require('socket.io')(server.listener);

io.on('connection', function (socket) {

    socket.emit('Oh hii!');

    socket.on('burp', function () {
        socket.emit('Excuse you!');
    });
});

/*
if (!process.env.COOKIE_PASSWORD) {
	throw new Error('no cookie password found in env!');
}
*/

server.register([
/*
// don't need yar in the Vending Machine app!
	{
		register: require('yar'),
		options: {
			storeBlank: false,
			cookieOptions: {
				password: process.env.COOKIE_PASSWORD,
				isSecure: false
			}
		}
	}
*/
], err => {

	if (err) throw /* GIANT_TANTRUM() */ err;


	server.route({
		method: 'GET',
		path: '/assets/{filename*}',
		handler: {
			directory: {
				path: 'public/assets',
				redirectToSlash: true,
				index: true
			}
		}
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
		method: 'GET',
		path: '/auth/user-account',
		handler: UserAccount
	});

	server.route({
		method: 'POST',
		path: '/auth/user-account',
		handler: UserAccount
	});

	server.route({
		method: 'GET',
		path: '/auth/logout',
		handler: (req, rep) => { req.yar.reset(); rep.redirect('/') }
	});

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

	/*
	server.route({
		method: 'post',
		path: '/api/{action*}',
		handler: GeneralSdkQuery
	});
	*/

	/*
	server.route({
		method: 'post',
		path: '/api/{action*}',
		handler: UnknownApiCall
	});

	server.route({
		method: 'get',
		path: '/index-test.html',
		handler: { file: 'index-test.html' }
	});
	*/

	server.route({
		method: 'get',
		path: '/{route*}',
		handler: require('./app/Router.js')
		//handler: function(request, reply) { reply({ hello: 'world' }) }
	});

	server.start(function(err) {
		if (err) {
			console.log('server failed to listen! teach it a lesson.');
			console.log(err);
		} else {
			console.log('CLIENT PORTAL server is listening');
		}
	});

});