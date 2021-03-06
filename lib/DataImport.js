'use strict'
import fs from 'fs'
import path from 'path'
import RQ from 'request'

var filen = __filename.split(path.sep).pop()
	, ACTION = filen.substr(0, filen.lastIndexOf('.'))
	, debug = require('debug')('vending-app-gui:' + ACTION)
	;

/******************

	DEV NOTES:
	
	- NetTSV must be restarted after tinkering with the database:
		>> TsvActions.apiCall('restart');
		>> build equiv call to http://localhost:8085/
	
	- tables:
		>> product: holds product data
		>> coil: maps products to coils
			(whether or not the coils are running good or valid is not detected)
		>> coilqty: running record of changes to inventory through inventory tool
			(maybe sale as well, not confirmed yet)
		>> inventory: running record of TOTAL INVENTORY for a product across all coils
			select count(*) from inventory where coilNumber = 'PRODUCT BY COIL NUMBER'
	
	default export of this script should take the entire "config" blob from MDLE, and be able to load mysql accordingly.
	steps:
	
	1. build price dictionary
		- use products list and planogram.published_grid to build a dictionary of prices by product._id:
		productPrices: {
			"5768b6044c0041448e01e8fa": 20.00
		}
	
	2. reconcile products
		
		1. select id, productName from table.product
		2. any products that are already in the system, leave alone (and record the IDs in productMysqlIDs dict)
		3. any new products, insert and record IDs
		4. any products removed (by planogram change), i.e. not present in MDLE.products:
			- find diff based on product.productName compared to MDLE.products (product.productName == products._id)
			- get existing coilNumber from table.coil by product.productID
				select coilNumber from coil where productID = product.productID
			- remove rows from inventory, coil, coilqty where coilNumber = coilNumber
			- remove from product table
		
		productMysqlIDs: {
			"5768b6044c0041448e01e8fa": mysql.productID
		}

		products.forEach( (product, INDEX) => {} )
		valid product row, in JSON:
		{
			"productID": INDEX,
			"price": productPrices[product._id], // decimal(6,2) row!
			"productName": product._id,
			"productDescription": "",
			"productCategory1ID": null,
			"productCategory2ID": null,
			"productCategory3ID": null,
			"productCategory4ID": null,
			"productCategory5ID": null,
			"sku": product.sku,
			"productCategoryID": null,
			"IsDropShip": 0,
			"IsGroup": 0,
			"dropShipID": 0,
			"maxLifetimeDays": null,
			"isDeleted": 0,
			"moniker": product.name
		}	

	3. build planogram grid
		need to compare inbound grid to whatever is in table.coil

			valid coil row, in JSON:
			{
				"coilID": INT AUTOINCREMENT,
				"coilNumber": G.slot,
				"capacity":0,
				"productID": G.mysqlID,
				"selection":"",
				"machineID":0,
				"userID":0,
				"spoiledAsOf":null,
				"mappedTo":""
			}

		1. select coilNumber, productID from coil
		2. compare and split EXISTS_SAME, EXISTS_DIFFERENT, NOT_EXISTS, NEW_SLOT
		3. NOT_EXISTS: coilNumbers exist in coil but not in published_grid?
			> delete the set
			'delete from coilqty where coilNumber in ( '+NOT_EXISTS.join(',')+' )'
			'delete from coil where coilNumber in ( '+NOT_EXISTS.join(',')+' )'
			'delete from inventory where coilNumber in ( '+NOT_EXISTS.join(',')+' )'
		4. EXISTS_SAME: coil exists and is same?
				- select finalQuantity from coilqty where coilNumber = published_grid.slot order by coilQtyID desc limit 1
				/////// - delete from table.inventory where coilNumber = published_grid.slot;
				- if (finalQuantity < 0) finalQuantity = 0
					delete from table.inventory where coilNumber = published_grid.slot;

				- else if (finalQuantity > 0) {
					select count(*) as inventory_count from inventory where coilNumber = published_grid.slot;
					if (inventory_count > finalQuantity) {
						delete from table.inventory where coilNumber = published_grid.slot limit (inventory_count - finalQuantity);
					} else if (inventory_count < finalQuantity) {
						var inserts = []
							, num_to_insert = finalQuantity = inventory_count
							;
						for (var i = 1; i <= num_to_insert; i += 1) {
							inserts.push('(0, ' + published_grid.slot + ', 0)');
						}
						'insert into inventory (machineID, coilNumber, pendingSale) values ' + inserts.join(', ');
					}
					
				}

		5. EXISTS_DIFFERENT: coil exists but is different product?
			> dump any existing record of the old product inventory markers
				delete from coilqty where coilNumber = EXISTS_DIFFERENT[i]
				delete from inventory where coilNumber = EXISTS_DIFFERENT[i]
				update coil set productID = productMysqlID[ _id ] where coilNumber = EXISTS_DIFFERENT[i]

		6. NEW_SLOT: slots did not exist previously, just needs row in table.coil
			insert into coil ....
	
	4. restart NetTSV!

*******************/

// handle errors better eventually!

export function DataImportToTsv( databomb, conn, cb ) {
	cleanUpOldData(conn, (err, ok) => {
		if (err) throw err;
		buildPriceDictionary(databomb.planogram, databomb.products, (err, priceDict) => {
			if (err) { debug('error here: buildPriceDictionary'); return cb(err); }
		
			//debug('short circuit, lettuce look at priceDict vs. grid.');
			//return cb(null, { priceDict, PG: databomb.planogram.published_grid });

			buildProductIdDictionary(conn, (err, productMysqlIDs) => {
				if (err) { debug('error here: buildProductIdDictionary'); return cb(err); }

				deleteRemovedProducts(databomb.products, productMysqlIDs, conn, (err, ok) => {
					if (err) { debug('error here: deleteRemovedProducts'); return cb(err); }

					insertMissingProducts(databomb.products, priceDict, productMysqlIDs, conn, (err, productMysqlIDs) => {
						if (err) { debug('error here: insertMissingProducts'); return cb(err); }

						buildPlanogramGrid(databomb.planogram, databomb.products, priceDict, productMysqlIDs, conn, (err, ok) => {
							if (err) { debug('error here: buildPlanogramGrid (called method)'); return cb(err); }
							/**
								productMysqlIDs can pick up a lot of garbage, especially on a first run...
								let's clean it out
							**/
							//debug('BEFORE cleaning productMysqlIDs');
							//debug(productMysqlIDs);
							var foo = {};
							Object.keys(productMysqlIDs).forEach( K => {
								if (productMysqlIDs[K]) foo[K] = productMysqlIDs[K];
							});
							productMysqlIDs = foo;
							//debug('AFTER cleaning productMysqlIDs');
							//debug(productMysqlIDs);
							
							// finally, restart TSV (if exists... CANNED_API_DATA generally points towards local dev)
							if (process.env.CANNED_API_DATA) {
								return cb(null, { priceDict, productMysqlIDs }); // return generated data
							//*
							} else {
								RQ.post({
									url: 'http://localhost:8085/tsv/flashapi',
									body: [ 'restart' ],
									json: true
								}, (err, response, body) => {
									if (err) cb(err);
									return cb(null, { priceDict, productMysqlIDs }); // return generated data
								});
							}
							//*/
							
						});
					});
				});
			});
		
		});
	});
}

function cleanUpOldData(conn, cb) {
	conn.query('SET foreign_key_checks = 0', (err, ok) => {
		conn.query('delete from coil where productID = -1', (err, ok) => {
			if (err) { debug('error here: cleanUpOldData'); return cb(err); }
			cb(null, true);
		});
	});
}

// 1. build price dictionary
function buildPriceDictionary( planogram, products, cb ) {
	var PG = planogram.published_grid && planogram.published_grid.length ? planogram.published_grid : null;
	if (PG && products && products.length) {
		var priceDict = {};
		
		PG.forEach( node => {
			var prod = products.filter( _P => {
				return _P._id == node.product;
			});
			if (prod && prod[0]) {
				priceDict[node.product] = node.price || prod[0].sugg_price;
			}
		});
		return cb(null, priceDict);
	}
	cb('error: no products and/or planogram, cannot continue');
}

function buildProductIdDictionary(conn, cb) {
	var productMysqlIDs = {};		
	conn.query('select productID, productName from product', function(err, productRows) {
		if (err) { debug('error here: buildProductIdDictionary'); return cb(err); }
		if (productRows && productRows.length) {
			productRows.forEach( ROW => {
				productMysqlIDs[ROW.productName] = ROW.productID;
			});
		}
		cb(null, productMysqlIDs);
	});
}

function deleteRemovedProducts(products, productMysqlIDs, conn, cb) {
	
	var productNames = Object.keys(productMysqlIDs) // existing product name / id combos
		, removes = []
		;
	if (productNames && productNames.length) {

		productNames.forEach( PN => {
			var exists = products.filter( P => { return P._id == PN } );
			if (!exists || !exists.length) {
				removes.push( PN );
			}
		})
		
		if (removes.length) {
			
			function _deleteProductData(removes) {
				var remove_mongo_id = removes && removes.length ? removes.pop() : null;
				if (!remove_mongo_id) {
					return cb(null, productMysqlIDs);
				}
				conn.query('SET foreign_key_checks = 0', (err, ok) => {
					conn.query('delete from product where productID = "' + productMysqlIDs[remove_mongo_id] + '"', (err, ok) => {
						if (err) throw err;
						conn.query('select coilNumber from coil where productID = "' + productMysqlIDs[remove_mongo_id] + '" order by coilID desc limit 1', (err, row) => {
							if (err) throw err;
							if (row.length) {
								var remove_coilNumber = row[0].coilNumber;
								conn.query('delete from inventory where coilNumber = "' + remove_coilNumber + '"', (err, ok) => {
									if (err) throw err;
									conn.query('delete from coil where coilNumber = "' + remove_coilNumber + '"', (err, ok) => {
										if (err) throw err;
										conn.query('delete from coilqty where coilNumber = "' + remove_coilNumber + '"', (err, ok) => {
											if (err) throw err;
											delete productMysqlIDs[remove_mongo_id];
											_deleteProductData(removes);
										});
									});
								});
							} else {
								_deleteProductData(removes);
							}
						});
					});
				});
			}
			
			_deleteProductData(removes);
			
		} else {
			cb(null, productMysqlIDs);
		}

	} else {
		cb(null, productMysqlIDs);
	}

}

function insertMissingProducts(products, priceDict, productMysqlIDs, conn, cb) {
	debug('insertMissingProducts');
	
	var inserts = []
		, fields = [ 'price', 'productName', 'sku', 'moniker', 'IsDropShip', 'IsGroup', 'isDeleted', 'productCategoryID' ]
		;
	
	products.forEach( P => {
		if ( !productMysqlIDs.hasOwnProperty(P._id) ) {
			inserts.push(P);
		}
	});
/*
		valid product row, in JSON:
		{
			"productID": INDEX,
			"price": productPrices[product._id], // decimal(6,2) row!
			"productName": product._id,
			"sku": product.sku,
			"IsDropShip": 0,
			"IsGroup": 0,
			"isDeleted": 0,
			"moniker": product.name
		}	
*/
	function _insertProduct(inserts) {
		if (inserts && inserts.length) {
			var P = inserts.shift()
				, values = []
				, markers = []
				;
			
			values.push( priceDict[P._id] );
			values.push( P._id );
			values.push( P.sku );
			values.push( P.name );
			values.push( 0 );
			values.push( 0 );
			values.push( 0 );
			values.push( null );
			
			for (var i = 0; i < values.length; i += 1) {
				markers.push('?');
			}
			
			debug('------------------------ insert product query: ------------------------');
			debug('insert into product ( '+fields.join(', ')+' ) values ( '+markers.join(', ')+' )');
			
			conn.query('insert into product ( '+fields.join(', ')+' ) values ( '+markers.join(', ')+' )', values, function(err, ok) {
				if (err) throw err;
				productMysqlIDs[ P._id ] = ok.insertId;
				_insertProduct(inserts);
			});
			
		} else {
			return cb(null, productMysqlIDs);
		}
	}

	_insertProduct(inserts);
	
}

// this would be get to promisfy.all():
function buildPlanogramGrid(planogram, products, priceDict, productMysqlIDs, conn, cb) {
	debug('buildPlanogramGrid');

	var PG = planogram.published_grid && planogram.published_grid.length ? planogram.published_grid : null
		, EXISTS_MONGO_IDS = []
		, EXISTS_SLOTS = []
		, EXISTS_SAME = []
		, EXISTS_DIFFERENT = []
		, NOT_EXISTS = []
		, NEW_SLOTS = [] // these will end up being value sets for a bulk insert
		, UNDEFINED_SLOTS_COUNT = 0
		;
	
	conn.query('select coilNumber, productID from coil', (err, rows) => {
		if (err) { debug('error here: buildPlanogramGrid, step 1'); return cb(err); }
		rows.forEach( R => {
			debug('row ....');
			debug(R);
			var thisSlot = PG.filter( _ => { return _.slot == R.coilNumber; });
			// should be only one slot that matches...
			if (thisSlot && thisSlot.length) {
				EXISTS_SLOTS.push( parseInt(R.coilNumber) );
				thisSlot = thisSlot.pop();
				debug('match: ' + JSON.stringify(thisSlot) );
				debug(R.productID, productMysqlIDs[ thisSlot.product ]);
				if (R.productID == productMysqlIDs[ thisSlot.product ]) {
					debug('push to EXISTS_SAME');
					EXISTS_SAME.push(thisSlot);
					EXISTS_MONGO_IDS.push(thisSlot.product);

				} else if (productMysqlIDs[ thisSlot.product ] && R.productID != productMysqlIDs[ thisSlot.product ]) {
					debug('push to EXISTS_DIFFERENT');
					EXISTS_DIFFERENT.push(thisSlot);
					EXISTS_MONGO_IDS.push(thisSlot.product);

				} else {
					debug('something funny happening.');
				}

			} else {	
				debug('did not match anything');
				NOT_EXISTS.push( R.coilNumber );
			}
		});

		debug('--------------- EXISTS_SLOTS');
		debug(EXISTS_SLOTS);
		debug('--------------- EXISTS_SLOTS end');

		PG.forEach( SLOT => {
			debug('check slot: ' + SLOT.slot + ', product: ' + SLOT.product + ' ... exists? ' + (EXISTS_SLOTS.indexOf(SLOT.slot)));

			//if (EXISTS_MONGO_IDS.indexOf(SLOT.product) === -1) {
			if (EXISTS_SLOTS.indexOf(SLOT.slot) === -1) {
				debug('new slot?');
				//var productData = products.filter( P => { return P._id == SLOT.product; });
				if (productMysqlIDs[SLOT.product]) {
					NEW_SLOTS.push('(' + SLOT.slot + ', ' +  productMysqlIDs[SLOT.product] + ')');
				} else {
					UNDEFINED_SLOTS_COUNT += 1;
				}
			} else {
				debug('nada');
			}
		});
		
		var results = {
			newSlotsDone: false,
			existsSameDone: false,
			existsDifferentDone: false,
			notExistsDone: false
		}
		
		debug('--------------- planogram published_grid');
		debug(PG);
		debug('--------------- planogram builder parts');
		debug(NEW_SLOTS);
		debug(EXISTS_SAME);
		debug(EXISTS_DIFFERENT);
		debug(NOT_EXISTS);
		debug('--------------- planogram builder parts END');
		
		var numSlots = 0;
		numSlots += NEW_SLOTS.length;
		numSlots += EXISTS_SAME.length;
		numSlots += EXISTS_DIFFERENT.length;
		numSlots += UNDEFINED_SLOTS_COUNT;
		//numSlots += NOT_EXISTS.length;
		
		if (numSlots !== PG.length) {
			//throw new Error('ARARAAAAARRRRRRRGGGh '+numSlots+', '+PG.length);
			debug('slots imported do not match the parsed count!!!!! count: '+numSlots+', imported: '+PG.length);
		}

////////////// NEW_SLOTS
		if (NEW_SLOTS.length) {
			debug('NEW_SLOTS query:');
			debug('insert into coil (coilNumber, productID) values ' + NEW_SLOTS.join(','));
			
			var q = 'insert into coil (coilNumber, productID) values ' + NEW_SLOTS.join(',');
			conn.query(q, (err, rows) => {
				if (err) { debug('error here: buildPlanogramGrid, NEW_SLOTS 1'); debug(q); return cb(err); }
				results.newSlotsDone = true;
				if ( checkResults(results) ) { cb(null, true); }
			});
		} else {
			results.newSlotsDone = true;
			if ( checkResults(results) ) { cb(null, true); }
		}

////////////// EXISTS_SAME
		if (EXISTS_SAME.length) {

			function _same(EXISTS_SAME) {
				if (!EXISTS_SAME.length) {
					results.existsSameDone = true;
					if ( checkResults(results) ) { return cb(null, true); }
				} else {
					var same = EXISTS_SAME.pop();
					
					conn.query('select finalQuantity from coilqty where coilNumber = "' + same.slot + '" order by coilQtyID desc limit 1', (err, row) => {
						if (err) { debug('error here: buildPlanogramGrid, EXISTS_SAME 1'); return cb(err); }
						if (row.length) {
							var finalQuantity = row[0].finalQuantity;
							if (finalQuantity <= 0) {
								conn.query('delete from inventory where coilNumber = "' + same.slot + '"', (err, count) => {
									if (err) { debug('error here: buildPlanogramGrid, EXISTS_SAME 2'); return cb(err); }
									_same(EXISTS_SAME);
								});

							} else if (finalQuantity > 0) {
								conn.query('select count(*) as inventory_count from inventory where coilNumber = "' + same.slot + '"', (err, count) => {
									if (err) { debug('error here: buildPlanogramGrid, EXISTS_SAME 3'); return cb(err); }
									var inventory_count = 0;
									if (row.length) {
										var inventory_count = row[0].inventory_count;
									}

									if (inventory_count > finalQuantity) {
										//delete from table.inventory where coilNumber = published_grid.slot limit (inventory_count - finalQuantity);
										conn.query('delete from inventory where coilNumber = "' + same.slot + '" limit ' + (inventory_count - finalQuantity), (err, ok) => {
											if (err) { debug('error here: buildPlanogramGrid, EXISTS_SAME 4'); return cb(err); }
											_same(EXISTS_SAME);
										});

									} else if (inventory_count < finalQuantity) {
										var inserts = []
											, num_to_insert = finalQuantity = inventory_count
											;
										for (var i = 1; i <= num_to_insert; i += 1) {
											inserts.push('(0, ' + same.slot + ', 0)');
										}
										// bulk insert the inventory rows:
										conn.query('insert into inventory (machineID, coilNumber, pendingSale) values ' + inserts.join(', '), (err, ok) => {
											if (err) { debug('error here: buildPlanogramGrid, 5'); return cb(err); }
											_same(EXISTS_SAME);
										});
									}
								});
							}
							
						} else {
							// was in grid, but no inventory was ever loaded to this slot
							_same(EXISTS_SAME);
						}
					});

				}
			}
			
			_same(EXISTS_SAME);

		} else {
			results.existsSameDone = true;
			if ( checkResults(results) ) { cb(null, true); }
		}

////////////// EXISTS_DIFFERENT
		if (EXISTS_DIFFERENT.length) {

			function _diff(EXISTS_DIFFERENT) {
				if (!EXISTS_DIFFERENT.length) {
					results.existsDifferentDone = true;
					if ( checkResults(results) ) { return cb(null, true); }
				} else {
					var diff = EXISTS_DIFFERENT.pop();
					conn.query('delete from coilqty where coilNumber = ' + diff.slot, (err, ok) => {
						if (err) { debug('error here: buildPlanogramGrid, EXISTS_DIFFERENT 1'); return cb(err); }
						conn.query('delete from inventory where coilNumber = ' + diff.slot, (err, ok) => {
							if (err) { debug('error here: buildPlanogramGrid, EXISTS_DIFFERENT 2'); return cb(err); }
							conn.query('update coil set productID = "' + productMysqlIDs[ diff.product ] + '" where coilNumber = ' + diff.slot, (err, ok) => {
								if (err) { debug('error here: buildPlanogramGrid, EXISTS_DIFFERENT 3'); return cb(err); }
								_diff(EXISTS_DIFFERENT);
							});
						});
					});
				}
			}
			
			_diff(EXISTS_DIFFERENT);

		} else {
			results.existsDifferentDone = true;
			if ( checkResults(results) ) { cb(null, true); }
		}

////////////// NOT_EXISTS
		if (NOT_EXISTS.length) {
			conn.query('delete from coilqty where coilNumber in ( "'+NOT_EXISTS.join('","')+'" )', (err, ok) => {
				if (err) { debug('error here: buildPlanogramGrid, NOT_EXISTS 1'); return cb(err); }
				conn.query('delete from coil where coilNumber in ( "'+NOT_EXISTS.join('","')+'" )', (err, ok) => {
					if (err) { debug('error here: buildPlanogramGrid, NOT_EXISTS 2'); return cb(err); }
					conn.query('delete from inventory where coilNumber in ( "'+NOT_EXISTS.join('","')+'" )', (err, ok) => {
						if (err) { debug('error here: buildPlanogramGrid, NOT_EXISTS 3'); return cb(err); }
						results.notExistsDone = true;
						if ( checkResults(results) ) { cb(null, true); }
					});
				});
			});
		} else {
			results.notExistsDone = true;
			if ( checkResults(results) ) { cb(null, true); }
		}
	});
	
	var alreadyDone = false;
	function checkResults(results) {
		var done = true;
		Object.keys(results).forEach( KEY => {
			if (!KEY) done = false;
		});
		if (!alreadyDone) {
			if (done) alreadyDone = true;
			return done;
		}
	}
}
