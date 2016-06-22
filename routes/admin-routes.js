import Joi from 'joi'

var GetClientUsers = require('./handlers/admin/GetClientUsers')
	, RefreshStorefrontData = require('./handlers/admin/RefreshStorefrontData')
	;

module.exports = [
	{
		method: 'get',
		path: '/api/get-client-users',
		handler: GetClientUsers,
	},

	{
		method: 'get',
		path: '/api/refresh-storefront-data',
		handler: RefreshStorefrontData,
	},
	
]