var crypto = require('crypto')
	, fs = require('fs')
    , path = require('path')
	, debug = require('debug')('r88r:utils')
	;

/**
 * @module utils
 */

var FUNCROOT = module.exports = {

/**
 * get a ?query=var from current location href
 * @function getGetVar
 * @param {string} key - query var key to look for
 * @param {string} [default_= ] - default value to pass back if not var not found
 * @returns {string} - value or default_
 */
	getGetVar: function(key, default_) {
		if (default_==null) { default_=''; }
		key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
		var qs = regex.exec(window.location.href);
		if(qs == null) {
			//console.log('[getGetVar] '+key+', returning default!: ' + default_);
			return default_;
		} else {
			//console.log('[getGetVar] '+key+', returning val!: ' + decodeURIComponent(qs[1]));
			return decodeURIComponent(qs[1]);
		}
	}
	
/**
 * get list of directories
 * @function getDirectories
 * @param {string} srcpath - path to get directories in
 * @returns {array} - list of directories
 */
	, getDirectories: function(srcpath) {
		return fs.readdirSync(srcpath).filter(function(file) {
			return fs.statSync(path.join(srcpath, file)).isDirectory();
		});
	}
	
/**
 * strip object down to passed-in properties, at top level (not recursive)
 * @function cleanObject
 * @param {object} object - source object to filter props on
 * @param {array} props - list of props to filter object with
 * @param {boolean} [strict=false] - if strict, the filter will return null if a property is not found on the source object
 * @returns {array} - list of directories
 */
	, cleanObject: function(object, props, strict) {
		if (props) {
			strict = strict || false;
			var newObj = {}
				, anyPropWasNotString = false
				, anyPropWasMissing = false
				;
			if (!(props instanceof Array)) { props = [props] }
			props.forEach(function(prop) {
				if (typeof prop === 'string') {
					if (object.hasOwnProperty(prop)) {
						newObj[prop] = object[prop];
					} else {
						anyPropWasMissing = false
					}
				} else {
					anyPropWasNotString = true;
				}
			});
			
			if (anyPropWasNotString) {
				return null;
			}

			if (strict && anyPropWasMissing) {
				return null;
			}
		
			return newObj;
		}
		return null;
	}
	
/**
 * encode URI component, a little smarter
 * @function _encodeURIComponent
 * @param {string} str - string to encode
 * @returns {str} - encoded string
 */
	, _encodeURIComponent: function(str) {
		str = encodeURIComponent(str);
		str = str.replace('(', '%28');
		str = str.replace(')', '%29');
		str = str.replace('|', '%7C');
		return str;
	}

/**
 * quick wrapper for sorting arrays of objects
 * @function _compare
 * @param {object} a - first compare object
 * @param {object} b - second compare object
 * @param {string} prop - property to compare
 * @returns {boolean}
 */
	, _compare: function(a, b, prop) {
		var _A = a[prop]
			, _B = b[prop]
			;
		if (typeof _A == 'string') {
			_A = _A.toLowerCase();
			_B = _B.toLowerCase();
		}
		if (_A < _B) return -1;
		if (_A > _B) return 1;
		return 0;
	}

/**
 * Recursively merge properties of two objects 
 * @function mergeRecursive
 * @param {object} obj1 - target merge object
 * @param {object} obj2 - inbound merge object
 * @returns {object} - merged object
 */
	, mergeRecursive: function(obj1, obj2) {

	  for (var p in obj2) {
		try {
		  // Property in destination object set; update its value.
		  if ( obj2[p].constructor==Object ) {
			obj1[p] = this.mergeRecursive(obj1[p], obj2[p]);

		  } else {
			obj1[p] = obj2[p];

		  }

		} catch(e) {
		  // Property in destination object not set; create it and set its value.
		  obj1[p] = obj2[p];

		}
	  }

	  return obj1;
	}

/**
 * classy hooooooge object prototype extender (pseudo-inheritance)
 * @function extendproto
 * @param {object} obj1 - target merge object
 * @param {object} obj2 - inbound merge object
 * @returns {object} - extended object
 */
	, extendproto: function(obj1, obj2) {
		for(var key in obj2.prototype) {
			if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
				obj1.prototype[key] = obj2.prototype[key];
			}
		}
	}

/**
 * simple object cloner
 * @function clone
 * @param {object} obj - object to clone
 * @returns {object} - cloned object
 */
	, clone: function(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;
	
		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
	
		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			//for (var i = 0, var len = obj.length; i < len; ++i) {
			for (var i = 0; i < obj.length; ++i) {
				copy[i] = this.clone(obj[i]);
			}
			return copy;
		}
	
		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
			}
			return copy;
		}
	
		throw new Error("Unable to copy obj! Object type isn't supported.");
	}

/**
 * Get epoch seconds for NOW
 * @function epoch
 * @returns {number} seconds based epoch (instead of JS epoch + ms)
 */
	, epoch: function() {
		var d = new Date();
		return (d.getTime()-d.getMilliseconds())/1000;
	}

/**
 * Generate unique guid ID
 * @function uniq
 * @returns {string} uniq gui-ish ID
 */
	, uniq: function() {
		var uniq = Math.random() + '',
			ts = new Date().getTime();
		uniq = uniq.split('.');
		uniq = uniq[ uniq.length-1 ];
		uniq = uniq.substr(0, 5);
		return uniq;
	}

/**
 * Help to generate simple pseudo-docs from functions
 * @function getFunctionParameterNames
 * @param {function} fn - function to get signature from
 * @returns {array} - function parameters found in definition
 */
	, getFunctionParameterNames: function(fn) {
		var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
			, code = fn.toString().replace(COMMENTS, '')
			, result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);

		return result === null
			? []
			: result;
	}
	
/**
 * Help to generate simple pseudo-docs from functions
 * @function getFunctionName
 * @param {function} fn - function to get name from
 * @returns {string} - matched function name
 */
	, getFunctionName: function(fn) {
		var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
			, code = fn.toString().replace(COMMENTS, '')
			, result = code.match(/function\s?(\w)\(/g);
		
		debug('[getFunctionName] I don\'t work yet.... what just happened? '+result);

		// need to finish the return, and test the match above:
		return result === null
			? ''
			: result;
	}

/**
 * Return a "clean" endpoint in format the API expects: no trailing slash
 * @function cleanEndpoint
 * @param {string} endpoint - http://foo.com
 * @returns {string} - "clean" endpoint, makes sure there's no trailing slash and there IS a protocol
 */
	, cleanEndpoint: function(endpoint) {
		if (!(/^https?:\/\//.test(endpoint))) {
			endpoint = (this.config.default_protocol || 'http') + '://' + endpoint;
		}
		if (endpoint.substring(-1,1) == '/') {
			endpoint = endpoint.substring(0, -1);
		}
		return endpoint;
	}
	
/**
 * Returns a "clean" string for use in web-url-friendly tokens
 * <br />(essentially just a limited alphachar filter)
 * @function cleanString
 * @param {(string|array)} str - (or ARRAY_OF_STRINGS)
 * @returns {(string|array)} - "clean" string (or ARRAY_OF_STRINGS)
 */
	, cleanString: function(str, nodash) {
		
		nodash = nodash || false;
		
		if (str instanceof Array) {
			str.forEach(function(T, idx) {
				str[idx] = this.cleanString(T, nodash);
			}.bind(this));
			
			return str;

		} else {
		
			// Remove spaces
				var clean = str.trim().replace(/\s/g, '_');

			if (nodash) {
				// Restrict to alphanumeric, underscore
				clean = clean.replace(/[^A-Za-z0-9_]/g, '');
			} else {
				// Restrict to alphanumeric, underscore, dash
				clean = clean.replace(/[^A-Za-z0-9_\-]/g, '');
			}
		
			return clean;
		}
	}

/**
 * request URL from Request object, for some reason not all returns have the same href property path
 * @function getUrlFromRequest
 * @param {object} req - "request" compatible object
 * @returns {string} url - url found, if any
 */
	, getUrlFromRequest: function(req) {
		var url;
		if (req.url && req.url.href) {
			url = req.url.href;
		} else if (req.href) {
			url = req.href;
		}
		return url;
	}

/**
 * wrapper around checking typeof + array type, with loose typing on string/number/boolean
 * @function smart_typeof
 * @param {(array|string|number|object|boolean)} data - some value
 * @param {boolean} [strictString=false] - whether or not to check the value for strict string type, or just string-compat
 * @returns {string} - type
 */
	, smart_typeof: function(data, strictString) {
		strictString = strictString || false;
		var _type = false;
		if (data instanceof Array) {
			_type = 'array';
		} else if (typeof data == 'object') {
			_type = 'object';	
		} else if (strictString) {
			_type = typeof data;
		} else if (typeof data == 'string' || typeof data == 'number' || typeof data == 'boolean') {
			_type = 'string';
		}
		return _type;
	}

/**
 * recurse through an object or array to find a buried property reference (or multiple references)
 * @function deepProperty
 * @param {(array|object)} data - some value
 * @param {string} property - what prop to look for in the data
 * @returns {array} - list of found values for that property
 */
	, deepProperty: function(data, property, found) {
		/*
		// test:
			var FOUND = deepProperty(search_in, 'simple_query_string');
			console.log( JSON.stringify(FOUND, null, 4) );
		*/
		found = found || [];
		var _type = smart_typeof(data);
	
		if (_type) {
			switch (_type) {
				case 'array':
					for (var i = 0; i < data.length; i += 1) {
						deepProperty(data[i], property, found);
					}
					break;
				case 'object':
					for (var k in data) {
						if (data.hasOwnProperty(k)) {
							if (k == property) {
								found.push(data[k]);
							}
							if (['array','object'].indexOf(smart_typeof(data[k])) > -1) {
								deepProperty(data[k], property, found);
							}
						}
					}
					break;
			}
		}
		return found;
	}
	
/**
 * recurse through a directory, return files that match filter()
 * @function readdirRecurse
 * @param {string} root - path to start recursing from
 * @param {function} filter - custom file matching filter (only matches on constructed path name!)
 * @returns {array} - list of found files
 */
	// read func stolen from: https://github.com/fs-utils/fs-readdir-recursive
	, readdirRecurse: function (root, filter, files, prefix) {
		  prefix = prefix || ''
		  files = files || []
		  filter = filter || function(x) { return x[0] !== '.' } // basically, "don't return any . files"

		  var dir = path.join(root, prefix)
		  if (!fs.existsSync(dir)) return files
		  if (fs.statSync(dir).isDirectory())
			fs.readdirSync(dir)
			.filter(filter)
			.forEach(function (name) {
			  FUNCROOT.readdirRecurse(root, filter, files, path.join(prefix, name))
			})
		  else
			files.push(prefix)

		  return files
	}
}
