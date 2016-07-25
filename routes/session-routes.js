import Joi from 'joi'

var New = require('./handlers/session/New')
	, Update = require('./handlers/session/Update')
	, AddShopEvent = require('./handlers/session/AddShopEvent')
//	, AddCart = require('./handlers/session/AddCart') // just do this with Update for now
	, AddUser = require('./handlers/session/AddUser')
	, Close = require('./handlers/session/Close')
	, Drop = require('./handlers/session/Drop')
	;

module.exports = [
	{
		method: 'post',
		path: '/api/vend-session/new',
		handler: New,
	},

	{
		method: 'post',
		path: '/api/vend-session/update',
		handler: Update,
	},

	{
		method: 'post',
		path: '/api/vend-session/add-shop-event',
		handler: AddShopEvent,
	},

	{
		method: 'post',
		path: '/api/vend-session/add-user',
		handler: AddUser,
	},

	{
		method: 'post',
		path: '/api/vend-session/close',
		handler: Close,
	},

	{
		method: 'post',
		path: '/api/vend-session/drop',
		handler: Drop,
	},
	
	{
		method: 'post',
		path: '/api/vend-session/close-session-transaction',
		handler: Close,
	},

	{
		method: 'post',
		path: '/api/vend-session/drop-session-transaction',
		handler: Drop,
	},
	
		
]