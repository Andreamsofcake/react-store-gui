import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
//import SocketAPI from '../utils/SocketAPI'
//import axios from 'axios'
//import { browserHistory } from 'react-router'

//import * as Translate from '../../lib/Translate'
//import RootscopeStore from '../stores/RootscopeStore'

var RootscopeActions = {
	
// setters for RootscopeStore:

	setConfig(path, value) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_ROOT_CONFIG,
			data: { path, value }
		});
	},
	
	setCache(path, value) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_ROOT_CACHE,
			data: { path, value }
		});
	},

	setSession(path, value) {
		AppDispatcher.handleServerAction({
			actionType: appConstants.UPDATE_ROOT_SESSION,
			data: { path, value }
		});
	},

};

module.exports = RootscopeActions;
