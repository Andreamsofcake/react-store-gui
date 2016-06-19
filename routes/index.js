throw new Error('not ready for index automagic import of routes yet!');
//import Joi from 'joi'
import fs from 'fs'
import path from 'path'
import { readdirRecurse } from '../lib/utils'

var concat_routes = []
	, ROUTE_FILENAME = '_defined_routes.js'
	, ROUTE_REGEX = new RegExp( ROUTE_FILENAME );
	;

/*

DEVNOTE: all routes are contained in the handler folders, file named ROUTE_FILENAME
>> this is so we can compartmentalize routes somewhat, easier to manage

look through CURRENT_DIRECTORY folders for defined_routes.js,
	require,
	concat,
	register

*/

var files = readdirRecurse(__dirname)
	, route_files = files.filter((x) => {
		return ROUTE_REGEX.test(x);
	});

module.exports = function(handlers, server) {

	route_files.forEach( file => {
		var func = require('./' + file)
		concat_routes = concat_routes.concat( func(handlers, server) );
	});

	return concat_routes;
}
