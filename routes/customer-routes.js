import Joi from 'joi'

var CustomerRegisterModule = require('./handlers/customer/CustomerRegisterModule')
	, CustomerMatchLogin = require('./handlers/customer/CustomerMatchLogin')
	, LoadCustomerByMembershipId = require('./handlers/customer/LoadCustomerByMembershipId')
	, CustomerSpendCredits = require('./handlers/customer/CustomerSpendCredits')
	, AdminVerifyLoadCustomerByMembershipId = require('./handlers/customer/AdminVerifyLoadCustomerByMembershipId')
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
		method: 'post',
		path: '/api/load-customer-by-membership-id',
		handler: LoadCustomerByMembershipId
	},
	
	{
		method: 'post',
		path: '/api/admin-verify-and-load-customer-by-membership-id',
		handler: AdminVerifyLoadCustomerByMembershipId
	},
	
	{
		method: 'post',
		path: '/api/spend-customer-credit',
		handler: CustomerSpendCredits
	},

	{
		method: 'get',
		path: '/api/customer-refresh',
		handler: (request, reply) => {
			var customer = request.yar.get('current_customer')
				, credit = request.yar.get('current_customer_credit') || { credit_amount_cents: 0 }
				;
			reply({ status: 'ok', customer: customer, credit: credit });
		}
	},

	{
		method: 'get',
		path: '/api/reset-current-customer',
		handler: (request, reply) => {
			request.yar.set('current_customer', null);
			request.yar.set('current_customer_credit', null);
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
				request.yar.set('current_customer_credit', request.payload.credit || false);
			}
			reply({ status: 'ok' });
		}
	},
	
]