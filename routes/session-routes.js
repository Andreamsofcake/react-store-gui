import Joi from 'joi'

var SessionHandler = require('./handlers/session/SessionHandler')
	, TransactionHandler = require('./handlers/session/TransactionHandler')
	, PostTransactionInventoryCleanup = require('./handlers/session/PostTransactionInventoryCleanup')
	;

module.exports = [
	{
		method: 'post',
		path: '/api/vend-session/{action}',
		handler: SessionHandler,
		/*config: {
			plugins: {
				'hapi-io': {
					event: 'session-handler'
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}*/
	},

	{
		method: 'post',
		path: '/api/transaction/{action}',
		handler: TransactionHandler,
		/*config: {
			plugins: {
				'hapi-io': {
					event: 'transaction-handler'
					, mapping: {

					},
					post: (ctx, next) => {
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}*/
	},
	
	{
		method: 'post',
		path: '/api/post-transaction-inventory-cleanup',
		handler: PostTransactionInventoryCleanup,
	},
	
		
]