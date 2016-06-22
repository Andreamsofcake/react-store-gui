//import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	// ok that's some fucked up pathing, but somehow it thinks it's top-level, I guess due to inclusion at index.js level
	, indexHtml = fs.readFileSync('./index.html').toString()
	;

module.exports = function(request, reply) {
	
	//reply({ status: 'ok', msg: 'flash api multi event sent', emulator_command }).code(200);
	reply(indexHtml).code(200);

}