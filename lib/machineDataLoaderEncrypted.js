import SDK from 'sdk-core-lib'
import RQ from 'request'
import path from 'path'

var filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:' + ACTION)
	;

export default function(MI, cb) {
	var data = {
		machine : {},
		planogram : {},
		products : [],
		categories : []
	}
	debug('[get data start] MI: ');
	debug(MI);

	ProxyCall('machineGetByVendorId', { vendor_id: MI.vendor_id }, (err, response) => {
		if (err) return cb(err);
		data.machine = response.data.item;

		ProxyCall('machinePlanogramGetByMachineId', { id: data.machine._id }, (err, response) => {
			if (err) return cb(err);
			data.planogram = response.data.item;
			if (data.planogram.product_grid.length) {
				let product_ids = [];
				data.planogram.product_grid.forEach( PG => {
					if (product_ids.indexOf(PG.product) === -1) {
						product_ids.push(PG.product);
					}
				});

				debug('ok, get products... ids:');
				debug( product_ids );

				ProxyCall('productList', { ids: product_ids }, (err, response) => {
					if (err) return cb(err);
					data.products = response.data.items;
					if (data.products.length) {
						let category_ids = [];
						data.products.forEach( P => {
							if (P.categories.length) {
								P.categories.forEach( C => {
									//debug('category');
									//debug(C);
									if (category_ids.indexOf(C) === -1) {
										category_ids.push(C);
									}
								});
							}
						});
						
						ProxyCall('productCategoryList', { ids: category_ids }, (err, response) => {
							if (err) return cb(err);
							data.categories = response.data.items;
							
							cb(null, data);
						});
						
					} else {
						cb('no matching products found for the planogram grid');
					}

				});

			} else {
				return cb('planogram has no product grid, cannot load products');
			}


		});

	});
  
}

import { ProxyCall } from './Bootup'
