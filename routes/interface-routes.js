import Joi from 'joi'
import path from 'path'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	
	, ActivateModule = require('./handlers/interface/ActivateModule')
	, PrintReaderModule = require('./handlers/interface/PrintReaderModule')

	;

module.exports = [
	{
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
	},

	{
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
	},
]

