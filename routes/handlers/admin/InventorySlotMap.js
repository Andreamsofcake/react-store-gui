//import SDK from 'sdk-core-lib'
import path from 'path'
import fs from 'fs'
import RQ from 'request'

import { ConfigData } from '../../../lib/Bootup'
import { FlashapiCall } from '../tsv/TsvProxy'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	var numSlots = 99
		, numCalls = 0
		, map = []
		, errmap = []
		;
	
	function saveMapData(err, ok) {
		numCalls += 1;
		if (err) {
			errmap.push(err);
		} else {
			map.push(ok);
		}
		
		if (numCalls === numSlots) {
			fs.writeFileSync('./inventory-slot-map-data.json', JSON.stringify({ slotMap: map, errmap, configData: ConfigData() }));
			return reply({ status: 'ok', msg: 'inventory map created', data:
				{ slotMap: map, errmap, configData: ConfigData() }
			}).code(200);
		} else {
			FlashapiCall(['adminValidateProductByCoil', numCalls + 1], saveMapData);
		}
	}
	
	FlashapiCall(['adminValidateProductByCoil', numCalls + 1], saveMapData);

}
