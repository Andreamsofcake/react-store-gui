import Joi from 'joi'

var CustomerRegisterModule = require('./handlers/CustomerRegisterModule')
	, CustomerMatchLogin = require('./handlers/CustomerMatchLogin')
	;

module.exports = [
	{
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
	},

	{
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
	},

	{
		method: 'get',
		path: '/api/customer-refresh',
		handler: (request, reply) => {
			var customer = request.yar.get('current_customer');
			reply({ status: 'ok', customer: customer });
		}
	},

	{
		method: 'get',
		path: '/api/reset-current-customer',
		handler: (request, reply) => {
			request.yar.set('current_customer', null);
			reply({ status: 'ok' });
		}
	},

	// this is due to problem with session sharing between request/yar and IO
	// hope to link it properly soon!
	{
		method: 'post',
		path: '/api/set-loggedin-customer',
		handler: (request, reply) => {
			if (request.payload.customer) {
				request.yar.set('current_customer', request.payload.customer);
			}
			reply({ status: 'ok' });
		}
	},
	
]