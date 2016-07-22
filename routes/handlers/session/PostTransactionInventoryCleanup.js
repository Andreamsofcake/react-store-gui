import fs from 'fs'
import path from 'path'
import { FlashapiCall } from '../tsv/TsvProxy'

var fsplit = __filename.split(path.sep)
	, filen = fsplit.pop()
	, filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:routes:' + ACTION)
	;

module.exports = function(request, reply) {
	
	
	debug('HIT ... payload keys:');
	debug( Object.keys(request.payload) );

	let { cart } = request.payload;
	
	if (!cart) {
		return reply({ status: 'err', msg: 'missing cart data, cannot process.' }).code(500);
	}
	
	fs.writeFileSync('post-vend-cart-data.json', JSON.stringify(cart, null, 4) );
	
	return reply({ status: 'ok', msg: 'so far just testing' });
	
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
