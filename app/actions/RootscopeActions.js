import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import SocketAPI from '../utils/SocketAPI'
import axios from 'axios'

var RootscopeActions = {
	
	exampleAjaxGetAction( params ) {
		axios.get('/foo/bar/baz', {
			params: {
				params // .get() turns this into a ?query=string
			}
		})
		.then(response => {
			if (response.data && response.data.data) {
				if (response.data.data.contexts) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
						data: response.data.data
					});
				}
				if (response.data.data.contextSet) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
						data: response.data.data
					});
				}
			} else {
				if (response.data && response.data.error) {
					console.error('[RootscopeActions] failed to get foo, error:');
					console.log(response.data.error);
				} else {
					console.error('[RootscopeActions] failed to get foo, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[RootscopeActions] failed to get foo, call chain error probably check component tree');
			console.log(error);
		})
	},

	exampleAjaxPostAction( params ) {
		axios.post('/foo/bar/baz', 
			params // .post() expects and passes this as a json object
		)
		.then(response => {
			if (response.data && response.data.data) {
				if (response.data.data.contexts) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
						data: response.data.data
					});
				}
				if (response.data.data.contextSet) {
					AppDispatcher.handleServerAction({
						actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
						data: response.data.data
					});
				}
			} else {
				if (response.data && response.data.error) {
					console.error('[RootscopeActions] failed to post foo, error:');
					console.log(response.data.error);
				} else {
					console.error('[RootscopeActions] failed to post foo, no data returned. full response:');
					console.log(response);
				}
			}
		})
		.catch(error => {
			console.error('[RootscopeActions] failed to post foo, call chain error probably check component tree');
			console.log(error);
		})
	},

	exampleWebsocketAction(data) {
		SocketAPI.send('fooSocketAction', data, this.exampleWebsocketResponseHandler.bind(this));
	},

	exampleWebsocketResponseHandler(data) {
		if (data && data.status == 'ok') {
			AppDispatcher.handleServerAction({
				actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
				data: data
			});
		} else {
			alert('Sorry, failed to handle the fooSocketAction.');
			console.log('foo item fail:');
			console.log(data);
		}
	}
	
};

module.exports = RootscopeActions;
