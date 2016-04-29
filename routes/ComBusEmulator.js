//import SDK from 'sdk-core-lib'
import path from 'path'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var emulator_command = request.payload.emulator_command
		, io = request.server.plugins['hapi-io'].io
		;
	
	debug('send flash command: ' + JSON.stringify(emulator_command) );
	
	if (emulator_command && emulator_command[0] && emulator_command[0][0] && emulator_command[0][0] === 'insertCash') {
		var amt = emulator_command[1];
		var totalInserted = request.yar.get('emulatorInsertedCash') || 0
		totalInserted += emulator_command[1] * 100; // guess we're dealing in cents!
		request.yar.set('emulatorInsertedCash', totalInserted);
		emulator_command = ['creditBalanceChanged', amt, totalInserted];
	}
	
	// commands are sent through a "multi event" handler, which expects arrays of arrays
	//io.to('flash-api-multi-event').emit('flash-api-multi-event', [ emulator_command ]);
	// update: having ComEmulator send pre-wrapped commands
	io.to('flash-api-multi-event').emit('flash-api-multi-event', emulator_command );
	
	reply({ status: 'ok', msg: 'flash api multi event sent', emulator_command }).code(200);

}