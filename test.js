var RQ = require('request')
	, mysql = require('mysql')
	, fs = require('fs')
	;

/*
// simple test of machine nodejs proxy
	RQ.post({
		url: 'http://localhost:8086/machine/api-proxy',
	//	body: [ 'resetCreditBalance' ],
	//	body: [ 'fetchCreditBalance' ],
		body: {  },
		json: true,
		headers: {
			'SDK-machine-key': 'foo'
		}
	}, function(err, response, body) {
	
		console.log('flashapi response:');
		console.log(err);
		//console.log(response);
		console.log(body);
	
		process.exit(1);
	});
*/

if (process.argv[2] === 'api' && process.argv[3]) {

	var url = 'http://localhost:8085/tsv/flashapi';
	
	RQ.post({
		url: url,
	//	body: [ 'resetCreditBalance' ],
	//	body: [ 'fetchCreditBalance' ],
		body: [ process.argv[3] ],
		json: true
	}, function(err, response, body) {
	
		console.log('flashapi response:');
		console.log(err);
		console.log(response);
		console.log(body);
	
		process.exit(1);
	});

}

if (process.argv[2] === 'mysql') {
	
	var connReady = false
		, conn = mysql.createConnection({
			user: 'root',
			password: 'avt', // 'avt', // old dev machine is root/root
			database: 'tsv',
			host: 'localhost',
			port: 3306
		})
		;

	conn.connect((err, ok) => { if (!err) { connReady = true; } else { throw new Error(err); } });

	function query() {

		if (!connReady) {
			return setTimeout(() => { query() }, 250);
		}
	
		var filename = process.argv[3] || 'mysql-dump.json';
		var q = process.argv[4] || 'select * from coil';

		conn.query(q, function(err, rows, fields) {
			if (err) throw (err);
			if (rows && rows.length) {
				var output = [];
				rows.forEach( function(ROW) {
					//console.log( JSON.stringify(ROW) );
					output.push( JSON.stringify(ROW) );
				});
				output = "[\n" + output.join(",\n") + "\n]";
				fs.writeFileSync(filename, output);
			}
			process.exit(1);
		});
	
	}

	query();

}