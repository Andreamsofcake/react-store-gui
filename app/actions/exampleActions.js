import Log from '../utils/BigLogger'
var Big = new Log('ExampleActions');


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
					Big.error('failed to get foo, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to get foo, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to get foo, call chain error probably check component tree');
			Big.log(error);
		})
	},

	exampleAjaxPostAction( params ) {
		axios.post('/foo/bar/baz', 
			params // .post() expects and passes this as a json object
		)
		.then(response => {
			if (response.data && response.data.data) {
				AppDispatcher.handleServerAction({
					actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
					data: response.data.data
				});
			} else {
				if (response.data && response.data.error) {
					Big.error('failed to post foo, error:');
					Big.log(response.data.error);
				} else {
					Big.error('failed to post foo, no data returned. full response:');
					Big.log(response);
				}
			}
		})
		.catch(error => {
			Big.error('failed to post foo, call chain error probably check component tree');
			Big.log(error);
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
			Big.log('foo item fail:');
			Big.log(data);
		}
	},
	
	// think: emptyCart()
	exampleBasicAction() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.EXAMPLE_ACTION_CONSTANT,
			data: null
		});
	},

// helper functions, these may move!

