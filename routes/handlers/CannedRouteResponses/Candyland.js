// Candyland === "Canned (responses) Land" :-)
var Candyland = function(config) {
	
	//do some checking at some point
	
	// no special handling yet
	var CannedLand = function(config) {

		/*
	
		ORDER OF STRIPES IS IMPORTANT!!!!:
	
		STRIPE: {
			source: candyPropName,
			target: candyPropName,
			striper: Function(config, source, target)
		}
	
		*/
		if (config.stripes && config.stripes.length) {
			config.stripes.forEach( STRIPE => {
				// TRY CATCY SOMEDAY
				STRIPE.striper(config, STRIPE.source, STRIPE.target);
			});
		}
	
	};
	
	CannedLand.prototype.Can = function(method) {
		return !!(config.slides[method] && typeof config.slides[method] === 'function');
	}

	// needs a new neame! alias...
	CannedLand.prototype.Do = function(method, payload, request, reply) {
		var response;
		config.bag = {};

		if (config.slides[method]) {
			config.bag = {
				method: method,
				payload: payload
			}

			// runtime transmorgiphying for config
			var snakes = Object.keys(config.snakes);
			if (snakes.length) {
				snakes.forEach( S => {
					config.snakes[S](config, request, reply);
				});
			}

			response = config.slides[method](config, request, reply);
		}
		return response;
	}
	
	/*CannedLand.prototype.*/var Land = function() {
		
	}
	
	return new CannedLand(config);
	
}

export default Candyland;