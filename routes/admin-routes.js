import Joi from 'joi'

var GetClientUsers = require('./handlers/admin/GetClientUsers')
	, GetTestCustomers = require('./handlers/admin/GetTestCustomers')
	, RefreshStorefrontData = require('./handlers/admin/RefreshStorefrontData')
	, RefreshCloudConfig = require('./handlers/admin/RefreshCloudConfig')
	, InventorySlotMap = require('./handlers/admin/InventorySlotMap')
	, ClientUserAddBiometric = require('./handlers/admin/ClientUserAddBiometric')
	, SaveSlotMap = require('./handlers/admin/SaveSlotMap')
	;

module.exports = [
	{
		method: 'get',
		path: '/api/get-client-users',
		handler: GetClientUsers,
	},

	{
		method: 'get',
		path: '/api/get-test-customers',
		handler: GetTestCustomers,
	},

	{
		method: 'get',
		path: '/api/refresh-storefront-data',
		handler: RefreshStorefrontData,
	},
	
	{
		method: 'get',
		path: '/api/refresh-cloud-config',
		handler: RefreshCloudConfig,
	},
	
	{
		method: 'get',
		path: '/api/inventory-slot-map',
		handler: InventorySlotMap,
	},
	
	{
		method: 'post',
		path: '/api/client-user-add-biometric',
		handler: ClientUserAddBiometric
	},
	
	{
		method: 'post',
		path: '/api/save-slot-map',
		handler: SaveSlotMap
	},
	
	
]