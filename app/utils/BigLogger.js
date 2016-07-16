/*******

	that can be turned on/off via config, so we don't constantly fill the dev console (memory waste)
	.. why not CONSOLE for easy search replace? :-)
	
	>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	>> why is this important?
		we can use the logging also as a sort of one-way event monitor for remote debugging,
		as well as scraping known log events for GUI events like transactions, timeouts, etc.
		>> kills two, or three, or four... birds with one stone.

	>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	
	.. nah, don't want to type capitals for it...
		Log.log
		Logger.log
		SomethingFun.log
		Bucket.log
		Big.log
		Big.error
		Big.dir
		Big.warn
		Big.throw
		(any other necessary console.* method)
		
		call like:
		@arg1 = string|array|object|boolean|whatever (like what you usually put in the console methods)
		@arg2 = options
			{
				prefix: STRING,
				restTBD: true
			}
		@arg3 = callback
			callback(actions, options); // async processing of stuff also
		Big.METHOD( arg1, [arg2, [arg3]] )
			if (typeof arg2 === 'function' && !arg3) {
				arg3 = arg2
				arg2 = {} // default config if exists
			}
		
		class BigLogger {
		
			constructor(prefix) {
				// factory:
				if (!this instanceof BigLogger) {
					return new BigLogger(prefix);
				}
			}
			
			...

		}
		
	.. also allows to handle the errors differently,
		like actually send off status messages or alerts to different places besides the dev console
		"help help I'm being hacked"
			(when someone is just randomly trying admin passwords because they find the secret button)
			of course, just "5 tries left" can put a stop to brute force,
			maybe if miss > 3 (or == 5) send warning to cloud
	.. load like:
		// general:
		import Big from '../utils/BigLogger'

		// prefixed (like DEBUG)
		import Logger from '../utils/BigLogger'
		var Big = Logger('prefix-for-this-component');

		// or old style:
		var Big = require('../utils/BigLogger')('prefix-for-this-component');
		
		// code hint:
			to run API:
			1. globalActions = api.filter({ type: global_functions });
			2. prefixActions = api.filter({ prefix: PREFIX });
			3. replace any globalActions with matching prefixActions
				>> if global has 2 of one kind, even one prefix match will override
			4. sort_order
				>> default:1, if sort_order: INT in def, use it
			5. step through and run each
			
			ALWAYS LOAD/FILTER ACTIONS EVERY TIME:
			0. phase 2: get config options from the PubSubAppConfigAssetManager
			   (phase 1, just hard-code)
			0a. it's cheap to filter, who cares
			1. allows inbound socket API based config update,
				so we can do stuff like "turn on logging"
					in the cloud and get a stream of what should be going to the dev console
			1a. there's a third action set, "admin" that will be injectable and not overridable
				
				** uh, this could allow us to remote test maybe????

	.. needs different "write" modes, like good does.

		api => [ ARRAY_OF_ANY_BELOW_MULTIPLES_OK_LIKE_GLOBAL_CONSOLE_AND_PREFIX_AXIOS ] // to allow multiple actions, like sending
			=> { console: true } // just write this to the console will ya!
			=> function to call (not always just an outbound API call I guess, can "talk" to other stuff going on
			=> { axios: { AXIOS_CONFIG, [then()], catch() }
			=> { SocketAPI: { TBD_CONFIG, see an Actions } }
			=> { prefix: THE_PREFIX, ANY_VALID_DIRECT_SETTING_ABOVE }
				.. any other global setting for this prefix,
					to cancel out actions if you DO NOT EVER want a component reporting for some reason
					((( 
						ok, except for any action that has admin: true
							because this allows "always on" for remote logging and such,
							inserted by an Admin Console command
						)))
				LIKE: console: false
					axios: false
					etc

		prefixes => list of prefixes to filter by
				 => v2, regex in here, so we can PREFIX=shopping* api: => stats api
				 								 PREFIX=checkout* api: => cart tracking / transaction building
		etc => tbd

	>>>> crank out v1, that at least controls logging to the console.

********/
import axios from 'axios'
//import SocketAPI from './SocketAPI' // when ready.... not using yet

//import objectAssign from 'react/lib/Object.assign'
//import { EventEmitter } from 'events'
//import muDB from '../../lib/muDB'

// cannot import from utils/index, it results in undefined BigLogger from recursion import
//import { isClient } from '../utils'

var globalAPI = [
	{ type: 'console', config: true }/*,
	{ type: 'axios', config: {
		url: '/api/big-log',
		method: 'post',
		then: [(response) => {
			console.log('[BigLog] posted log request to API');
		}],
		catch: (error) => {
			console.error('[BigLog] error, did not log request post to api!');
			console.error(error);
		}
	
	}}
	*/
]

// future, will be pushing these admin-level api configs from remote, loading async via SOME_TBD_PROCESS
var adminAPI = []

class BigLog {
	
	constructor(prefix, options) {
		
		if (!(this instanceof BigLog)) {
			return new this(prefix);
		}

		if (!options && prefix && typeof prefix === 'object') {
			options = prefix;
			prefix = options.prefix || null;
		}
		
		this.prefix = prefix || null;
		this.options = {};
		this.setOptions(options);
		
	}
	
	setOptions(options) {
		if (options && typeof options === 'object') {
			// should really do a merge, right?
			//this.options = OM(options, this.options);
			//this.options = options;
			// for now, simple override:
			Object.keys(options).forEach( KEY => {
				this.options[KEY] = options[KEY];
			});
			if (this.options.prefix) {
				this.prefix = this.options.prefix;
			}
		}
	}
	
	buildApiStack() {
		var localAPI = {};
		globalAPI.forEach( API => {
			if (API.type) {
				if (!localAPI[API.type]) localAPI[API.type] = [];
				localAPI[API.type].push(API.config);
			}
		});

		if (this.options && this.options.api) {
			var firsts = {};
			this.options.api.forEach( API => {
				if (API.type) {
					if (!localAPI[API.type]) localAPI[API.type] = [];
					// clear it out
					if (API.config === false) {
						localAPI[API.type] = [];
					} else {
						// specific defs to instance override globals, clobber any that are in there on first encounter of override:
						if (!firsts[API.type]) {
							localAPI[API.type] = [];
						}
						firsts[API.type] = true;
						localAPI[API.type].push(API.config);
					}
				}
			});
		}

		adminAPI.forEach( API => {
			if (API.type) {
				if (!localAPI[API.type]) localAPI[API.type] = [];
				localAPI[API.type].push(API.config);
			}
		});

		//console.log('got localAPI:');
		//console.log(localAPI);
		return localAPI;
	}
	
	runRequest(method, arg, options, callback) {
		var api = this.buildApiStack(options)
			;
		
		if (!method) {
			if (callback) {
				callback('error: no recognized __method specified???');
			} else {
				throw new Error('error: no recognized __method specified???');
			}
		}
		
		Object.keys(api).forEach( TYPE => {
			var stack = api[TYPE];
			switch (TYPE) {
				case 'console':
					// no need to parse through, as long as the first node exists and config !== false, run it.
					if (stack[0] && stack[0] === true) {
						if (!!(console[method])) {
							console[method](this.prefixArg(arg, options));
							if (callback) {
								callback(null, { arg: this.prefixArg(arg, options), options });
							}
							return this;
						} else if (method === 'throw') {
							//throw new Error( this.prefix || this.options.prefix + ' -- ' + this.prefixArg(arg, options));
							throw new Error(this.prefixArg(arg, options));
						}
					//} else {
						//console.warn('console called, but no stack?');
						//console.log(api[TYPE]);
					}
					break;

				case 'axios':
				case 'ajax':
				case 'server':
					//console.warn('BigLog not ready for this yet: '+TYPE);
					stack.forEach( call => {
						if (call.url
							&& call.method
							&& call.then && call.then.length
							&& call.catch
							&& axios[call.method]) {
							
							switch (call.method) {
								case 'get':
									try {
										var callme = axios[call.method](call.url + '/' + method)
										call.then.map( C => {
											return callme.then(C);
										});
										callme.then( () => {
											if (callback) {
												callback(null, { arg: this.prefixArg(arg, options), options });
											}
										});
										callme.catch(call.catch);
									} catch(e) {
										// nada?
									}
									break;

								case 'post':
									try {
										var callme = axios[call.method](call.url + '/' + method, { log: arg, options })
										call.then.map( C => {
											return callme.then(C);
										});
										callme.then( () => {
											if (callback) {
												callback(null, { arg: this.prefixArg(arg, options), options });
											}
										});
										callme.catch(call.catch);
									} catch (e) {
										// nada?
									}
									break;
							}
							
						} else {
							console.warn(call);
							throw new Error('[BigLog] axios mis-config');
						}
					});
					break;

				case 'SocketAPI':
				case 'socket':
				case 'websocket':
					console.warn('BigLog not ready for this yet: '+TYPE);
					break;
				
				default:
					console.warn('unknown BigLog TYPE: '+TYPE);
					break;
			}
		});
	}
	
	prefixArg(arg, options) {
		if (arg && typeof arg === 'string') {
			var prefix = this.prefix || this.options.prefix;
			if (options && options.prefix) {
				prefix = options.prefix;
			}
			if (prefix) { prefix = '[' + prefix + ']: ' }
			return prefix + arg;
		}
		return arg;
	}

	log(arg, options, callback) {
		this.runRequest('log', arg, options, callback);
	}

	dir(arg, options, callback) {
		this.runRequest('dir', arg, options, callback);
	}

	warn(arg, options, callback) {
		this.runRequest('warn', arg, options, callback);
	}

	error(arg, options, callback) {
		this.runRequest('error', arg, options, callback);
	}

	throw(arg, options, callback) {
		this.runRequest('throw', arg, options, callback);
	}

}

/*
// testing:
if (isClient) {
	console.warn('exposing BigLog!');
	window.BigLog = BigLog;
} else {
	console.warn('not client, no expose BigLog!');
}
//*/

export default BigLog;
