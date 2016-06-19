import Joi from 'joi'
import path from 'path'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	
	, TsvProxy = require('./handlers/TsvProxy')
	;

module.exports = [
	{
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
	},

	{
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
						//debug( 'what is PL? ' + typeof pl );
						//debug( pl );

						if (payload.subscribe_to_externals) {
							ctx.socket.join( 'flash-api-multi-event' );
							//debug('subscribed socket to flash-api-multi-event' );
						} else {
							//debug('DID NOT SUBSCRIBE TO flash-api-multi-event' );

						}
						ctx.socket.emit(ctx.event, ctx.result);
						next();
					}
				}
			}
		}
	},
]