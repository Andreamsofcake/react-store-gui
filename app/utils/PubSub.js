// not done yet at all, copied some functionality from old old jsFQ/AssetManager
// finish refactor/update code to use this, or maybe 
// https://github.com/mroderick/PubSubJS
// https://cdn.jsdelivr.net/pubsubjs/1.4.2/pubsub.min.js

		pubsub: [],
		
		_setPriority: function(call) {
			this.priority = [];
			var stack = this.get_cache('pubsub', call);
			if (!stack || !stack.length) { return -1; }
			stack.each(function(v, k) {
				this.priority.push(k);
			}.bind(this));
			this.priority.sort();
		},
		
		publish: function(call, params, type) {
			//console.log('someone published... ['+call+'] ['+type+']');
			if (!call) { return false; }
			var stack = this.get_cache('pubsub', call);
			if (!stack || !stack.length) { return -1; }
			type = type || 'all';
			this._setPriority(call);
			var _p;

			for (var i=0; i<this.priority.length; i += 1) {
				_p = this.priority[i];
				if (stack[_p] && stack[_p].length) {
					stack[_p].each(function(o) {
						if (o.type == type || o.type == 'all') {
							o.func(params);
							if (o.once) {
								this.unsubscribe(call, o.klass, o.priority);
							}
						}
					});
				}
			}
		},
		
		subscribe: function(call, func, type, once, priority, klass) {
			//console.log('someone subscribed... ['+call+'] ['+type+'] ['+klass+']');
			if (!call || !func || !klass || !typeof(func) == 'function') { return false; }
			priority = priority || 3;
			if (isNaN(priority)) { priority = 3; }
			var o = {
				klass: klass,
				type: type || 'all',
				once: once || false,
				func: func
			}
			var stack = this.get_cache('pubsub', call);
			if (!stack) { stack = []; }
			if (!stack[priority]) { stack[priority] = []; }
			stack[priority].push(o);
			this.set_cache('pubsub', call, stack);
			return true;
		},

		unsubscribe: function(call, klass, priority) {
			if (!call || !klass) { return false; }
			var stack = this.get_cache('pubsub', call);
			if (!stack || !stack.length) { return -1; }
			priority = priority || 3;
			this._setPriority(call);
			var _p;
			for (var i=0; i<this.priority.length; i += 1) {
				_p = this.priority[i];
				if (stack[_p] && stack[_p].length && _p == priority) {
					stack[_p].each(function(o, k) {
						if (o.klass === klass) {
							stack[_p][k] = null;
							delete(stack[_p][k]);
							//console.log('unsubscribed ('+call+', '+klass+', '+priority+')');
							return true;
						}
					});
				}
			}
			return false;
		},
