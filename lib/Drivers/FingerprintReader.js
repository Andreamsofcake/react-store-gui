import RQ from 'request'

let grabQ = []
//	, matchQ = []
//	, registerQ = []
	;

class FingerprintReader {
	
	constructor() {

	}
	
	// using different flushers so we can customize flush response per each type if we want:
	flushGrabQ() {
		while (grabQ.length) {
			var obj = grabQ.pop();
			obj.reply({ token: obj.args.token, status: 'err', apiResponse: 'request has been replaced by a new request' }).code(200);
		}
	}

	/*
	flushMatchQ() {
		while (matchQ.length) {
			var obj = matchQ.pop();
			obj.reply({ obj.args.token, status: 'err', apiResponse: 'request has been replaced by a new request' }).code(200);
		}
	}
	
	flushRegisterQ() {
		while (registerQ.length) {
			var obj = registerQ.pop();
			obj.reply({ obj.args.token, status: 'err', apiResponse: 'request has been replaced by a new request' }).code(200);
		}
	}
	*/
	
	// queue on grab, because the GUI can sometimes leave grabprint requests
	// hanging open due to changes in app state, with no way to cancel the open request(s)
	grabPrint(reply, args) {
		
		this.flushGrabQ();
		grabQ.push({ reply, args });

		RQ.post({
			url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/grabprint' + sequence,
			json: true,
			body: {}

		}, (err, response, body) => {
			debug('grab print sequence "'+sequence+'" response:');
			debug(body);
			
			var replyObj = grabQ.pop();
	
			if (!replyObj || !replyObj.reply) {
				debug('major error, we lost our last reply from the queue!');
				return;
			}
	
			var reply = replyObj.reply;
			
			if (err) {
				return reply({ token: replyObj.args.token, status: 'err', apiResponse: err }).code(500);
			}

			let M = body.data || '';
			if (body.msg) M += ': ' + (typeof body.msg == 'object' ? JSON.stringify(body.msg) : body.msg);

			if (!body || body.status !== 'ok') { 
				return reply({ token: replyObj.args.token, status: 'err', apiResponse: M }).code(500);
			}
			
			M += ' [Scan OK]';
			
			return reply({ token: replyObj.args.token, status: 'ok', apiResponse: M }).code(200);
		});
	}

	// no queue on matching.... (yet, because in general the GUI will call match in correct sequence)
	matchPrint(reply, args) {
		
		if (!reply || !args || !args.matchProps || !args.token) {
			debug('major error, missing required params');
			return;
		}

		let { matchProps, token } = args
			, matchUser = matchProps.user
			;
		
		function match(matchUser, cb) {

			if (matchUser && typeof matchUser === 'object') {
				matchUser = matchUser._id;
			}
			
			RQ.post({
				url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/matchprint',
				json: true,
				body: {
					userid: matchUser,
					clientid: MI.client,
					locationid: null,
					machineid: null,
				}

			}, (err, response, body) => {
				debug('match print response:');
				debug(body);
				if (err) {
					return cb(err);
				}

				let M = body.data || '';
				let matchedUser;
				if (body.msg) {
					M += ': ' + (typeof body.msg == 'object' ? JSON.stringify(body.msg) : body.msg);
					if (typeof body.msg == 'object') {
						matchedUser = body.msg;
					}
				}

				if (!body || body.status !== 'ok') { 
					return cb(true, M);
				}
			
				return cb(null, M, matchedUser);
			});
		}
		
		function matchLoop(err, apiResponse, matchedUser) {
			
			// positive match!
			if (!err && apiResponse && matchedUser) {
				return reply({ token, status: 'ok', matchedUser, apiResponse: M }).code(200);
			}
		
			if (matchUser instanceof Array) {

				if (matchUser.length) {
					match(matchUser.pop(), matchLoop);

				} else {
					// on multiple match attempts, will pass back the last err, or the last apiResponse
					return reply({ token, status: 'err', apiResponse: err || apiResponse || 'unknown fail' }).code(404);
				}

			} else {
				match(matchUser, (err, apiResponse, matchedUser) => {
					if (err && !apiResponse) {
						return reply({ token, status: 'err', apiResponse: err }).code(500);
					} else if (err && apiResponse) {
						return reply({ token, status: 'err', apiResponse }).code(404);
					}
					return reply({ token, status: 'ok', matchedUser, apiResponse }).code(200);
				});
			}
		}
		
		matchLoop();

	}

	// no queue on registering.... (yet, because in general the GUI will call match in correct sequence)
	registerPrint(reply, args) {

		if (!reply || !args || !args.registerUser || !args.token) {
			debug('major error, missing required params');
			return;
		}

		let { registerUser, token } = args;

		RQ.post({
			url: 'http://127.0.0.1:8000/api/v1/bio/ib/ecurve/addprint',
			json: true,
			body: {
				userid: registerUser,
				clientid: MI.client,
				locationid: MI.location,
				machineid: MI._id,
			}

		}, (err, response, body) => {
			debug('add (register) print response:');
			debug(body);
			if (err) {
				return reply({ token, status: 'err', apiResponse: err }).code(500);
			}

			let M = body.data || '';
			if (body.msg) M += ': ' + (typeof body.msg == 'object' ? JSON.stringify(body.msg) : body.msg);

			if (!body || body.status !== 'ok') { 
				return reply({ token, status: 'err', apiResponse: M }).code(500);
			}
			
			return reply({ token, status: 'ok', apiResponse: M }).code(200);
		});
	}
	
}

export default new FingerprintReader();