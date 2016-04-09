var RQ = require('request');

var home = 'http://vms2.avtvms.com/VmsProd/Manage/AllMachines.aspx'
	, login = 'http://vms2.avtvms.com/VmsProd/Login.aspx'
	;

RQ.post({
	url: login
	//*
	, form: {
		'Login1$UserName': 'admin@sdkcore.com',
		'Login1$Password': 'SDKCore1'
	}
	//*/
}, function(err, response, body) {
	
	console.log('login response:');
	console.log(err);
	console.log(response);
	console.log(body);
	
	process.exit(1);
});