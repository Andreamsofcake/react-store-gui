var AppDispatcher = require('../dispatcher/AppDispatcher')
	, appConstants = require('../constants/appConstants')
	, objectAssign = require('react/lib/Object.assign')
	, EventEmitter = require('events').EventEmitter
	, CHANGE_EVENT = 'change'

// example state vars:
	, _store = {
		foo: [],
		bar: {
		
		}
	}

	;

// example updater functions (triggered by Dispatch + appConstant listeners)
function setFoo(data) {
	_store.foo = data;
}

function addToFoo(data) {
	_store.foo.push( data );
}

function setBar(data) {
	_store.bar = data;
}

function updateBar(path, data) {
	_store.bar[path] = data;
}

// example getter functions (no direct setting in stores!)
var RootscopeStore = objectAssign({}, EventEmitter.prototype, {
	addChangeListener: function(cb) {
		this.on(CHANGE_EVENT, cb);
	},

	removeChangeListener: function(cb) {
		this.removeListener(CHANGE_EVENT, cb);
	},
	
	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	getFoo: function() {
		return _store.foo;
	},

	getBar: function(key) {
		if (path) {
			return _store.bar[path]; 
		}
		return _store.bar;
	}

});

RootscopeStore.dispatch = AppDispatcher.register(function(payload){
	var action = payload.action;
	switch(action.actionType) {

		case appConstants.EXAMPLE_ACTION_CONSTANT:
			if (action.data) {
				setFoo(action.data);
			}
			RootscopeStore.emitChange();
			break;

		default:
			return true;
			break;
	}
});

module.exports = RootscopeStore;
