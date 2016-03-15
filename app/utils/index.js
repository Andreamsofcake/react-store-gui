export function getPropsFromRoute({ routes }, componentProps) {
	let props = {};
	const lastRoute = routes[routes.length - 1];

	routes.reduceRight((prevRoute, currRoute) => {
	   
		componentProps.forEach(componentProp => {
			if (!props[componentProp] && currRoute.component[componentProp]) {
				props[componentProp] = currRoute.component[componentProp];
			}
		});
		
	}, lastRoute);

	return props;
}

export function _encodeURIComponent(str) {
	str = encodeURIComponent(str);
	str = str.replace('(', '%28');
	str = str.replace(')', '%29');
	str = str.replace('|', '%7C');
	return str;
}

export const isClient = (typeof document !== 'undefined');

/**
 * Returns a "clean" string for use in web-url-friendly tokens
 * <br />(essentially just a limited alphachar filter)
 * @function cleanString
 * @param {string} - (or ARRAY_OF_STRINGS)
 * @returns {string} - "clean" string
 */
export function cleanString(str, nodash) {
	
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
 * moneyformat(amount, n, x, s, c)
 * 
 * @param number  amount to format
 * @param integer n: length of decimal
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 * @param integer x: length of whole part
 *
 * borrowed from: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
 */
export function moneyformat = function(amount, n, s, c, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = amount.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};