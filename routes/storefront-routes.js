import Joi from 'joi'
import path from 'path'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	
	, GetStorefrontData = require('./handlers/storefront/GetStorefrontData')

	;

module.exports = [
	{
		method: 'get',
		path: '/api/get-storefront-data',
		handler: GetStorefrontData
	},

]
