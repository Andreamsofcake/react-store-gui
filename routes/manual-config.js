import Joi from 'joi'

// HAY check out routes/index, load the routes automatically! (needs some organization and thought)
var baseRoutes = require('./base-routes')
	, customerRoutes = require('./customer-routes')
	, interfaceRoutes = require('./interface-routes')
	, sessionRoutes = require('./session-routes')
	, tsvRoutes = require('./tsv-proxy-routes')
	
	, ComBusEmulator = require('./handlers/ComBusEmulator')
	;

var devRoutes = [

	{
		method: 'GET',
		path: '/yar',
		handler: (req, rep) => {
			let k = 'numnums'
				, count = req.yar.get(k) || 0
				;
			if (req.query && req.query.reset == 1) {
				count = 0;
			} else {
				count += 1;
			}
			req.yar.set(k, count);
			rep('times hit: '+count);
		}
	},

	{
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
	},

	{
		method: 'post',
		path: '/api/emulator',
		handler: ComBusEmulator
	},

]

// order is important! cascading route matching (I think)
module.exports = [].concat(tsvRoutes, interfaceRoutes, customerRoutes, sessionRoutes, devRoutes, baseRoutes);