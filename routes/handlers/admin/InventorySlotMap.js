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
	
	var maxSlots = 99
		, currentSlotNumber = 0
		, map = []
		, errmap = []
		;
	
	if (process.env.CANNED_API_DATA) {
		return reply({ status: 'ok', msg: 'inventory map created', data:
			JSON.parse(fs.readFileSync('./mysql-tool/inventory-slot-map-data.json').toString())
		}).code(200);
	}
	
	function saveMapData(err, slotInfo) {

		if (err) {
			errmap.push(err);
		} else {
			slotInfo.slot = currentSlotNumber;
			map.push(slotInfo);
		}
		
		if (currentSlotNumber === maxSlots) {
			fs.writeFileSync('./inventory-slot-map-data.json', JSON.stringify({ map, errmap }));
			return reply({ status: 'ok', msg: 'inventory map created', data:
				{ map, errmap }
			}).code(200);
		} else {
			FlashapiCall(['adminValidateProductByCoil', currentSlotNumber += 1], saveMapData);
		}
	}
	
	FlashapiCall(['adminValidateProductByCoil', currentSlotNumber += 1], saveMapData);

}
