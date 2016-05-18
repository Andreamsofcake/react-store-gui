var RQ = require('request');

var url = 'http://localhost:8085/tsv/flashapi'
	;

RQ.post({
	url: url,
//	body: [ 'resetCreditBalance' ],
//	body: [ 'fetchCreditBalance' ],
	body: [ 'startVend' ],
	json: true
}, function(err, response, body) {
	
	console.log('flashapi response:');
	console.log(err);
	console.log(response);
	console.log(body);
	
	process.exit(1);
});