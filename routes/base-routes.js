import Joi from 'joi'
import path from 'path'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	
	, ClientSideSetup = require('./handlers/base/ClientSideSetup')
	, MachineInfo = require('./handlers/base/MachineInfo')
	, BigLog = require('./handlers/base/BigLog')

	;

module.exports = [
/*
// more complex handler directly in index.js
	{
		method: 'GET',
		path: '/assets/{filename*}',
		handler: {
			directory: {
				path: 'public/assets',
				redirectToSlash: true,
				index: true
			}
		}
	},
*/
	{
		method: 'post',
		path: '/api/big-log/{method}',
		handler: BigLog.post
	},

	{
		method: 'get',
		path: '/api/big-log/{method}',
		handler: BigLog.get
	},

	{
		method: 'get',
		path: '/api/machine-info',
		handler: MachineInfo
	},

	{
		method: 'get',
		path: '/{route*}',
		//handler: require('./app/Router.js')
		handler: ClientSideSetup // skipping server side rendering, causing visual flutters
	},

]