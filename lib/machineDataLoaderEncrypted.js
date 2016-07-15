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
		productImages : [],
		categories : []
	}
	debug('[get data start] MI: ');
	debug(MI);

	ProxyCall('machineGetByVendorId', { vendor_id: MI.vendor_id }, (err, response) => {
		if (err) return cb(err);
		data.machine = response.data.item;

		ProxyCall('planogramGetByMachineId', { id: data.machine._id, published: true }, (err, response) => {
			if (err) return cb(err);
			data.planogram = response.data.item;
			var GRID = data.planogram.published_grid || []; //data.planogram.product_grid;
			if (GRID.length) {
				let product_ids = [];
				GRID.forEach( P => {
					if (product_ids.indexOf(P.product) === -1) {
						product_ids.push(P.product);
					}
				});

				//debug('ok, get products... ids:');
				//debug( product_ids );

				ProxyCall('productList', { ids: product_ids }, (err, response) => {
					if (err) return cb(err);
					data.products = response.data.items;
					if (data.products.length) {
						let category_ids = []
							, productImage_ids = [];
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
							if (P.images.length) {
								P.images.forEach( I => {
									debug('image ID');
									debug(I);
									if (productImage_ids.indexOf(I) === -1) {
										productImage_ids.push(I);
									}
								});
							}
						});
						
						ProxyCall('productCategoryList', { ids: category_ids }, (err, response) => {
							if (err) return cb(err);
							data.categories = response.data.items;

							ProxyCall('productImageList', { ids: productImage_ids }, (err, response) => {
								if (err) return cb(err);
								//debug('WELL DO WE GET IMAGES????');
								//debug(response.data.items);
								data.productImages = response.data.items;
							
								cb(null, data);
							});
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
