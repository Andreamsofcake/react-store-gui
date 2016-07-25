import Joi from 'joi'

var New = require('./handlers/transaction/New')
	, Update = require('./handlers/transaction/Update')
	, SpendCustomerCredit = require('./handlers/transaction/SpendCustomerCredit')
	, Close = require('./handlers/transaction/Close')
	, Cancel = require('./handlers/transaction/Drop')
	, PostTransactionInventoryCleanup = require('./handlers/transaction/PostTransactionInventoryCleanup')
	;

module.exports = [
	{
		method: 'post',
		path: '/api/transaction/new',
		handler: New,
	},

	{
		method: 'post',
		path: '/api/transaction/update',
		handler: Update,
	},

	{
		method: 'post',
		path: '/api/transaction/spend-customer-credit',
		handler: SpendCustomerCredit,
	},

	{
		method: 'post',
		path: '/api/transaction/complete',
		handler: Close,
	},

	{
		method: 'post',
		path: '/api/transaction/cancel',
		handler: Cancel,
	},

	{
		method: 'post',
		path: '/api/transaction/drop',
		handler: Cancel,
	},

// this is a test route, thought we might be able to "fix" the TSV inventory tracking problems,
// but we can't so far due to bad vend handling in TSV	
// keeping it here for now....
	{
		method: 'post',
		path: '/api/post-transaction-inventory-cleanup',
		handler: PostTransactionInventoryCleanup,
	},
]