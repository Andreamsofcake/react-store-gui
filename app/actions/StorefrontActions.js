import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
// import SocketAPI from '../utils/SocketAPI'
// import axios from 'axios'
// import { browserHistory } from 'react-router'

var StorefrontActions = {
  toggleIDtoCategoryFilter(ID) {
    AppDispatcher.handleServerAction({
      actionType: appConstants.TOGGLE_CATEGORY_ID_TO_FILTER,
      data: ID
    });
  },

  clearCategoryFilter() {
		AppDispatcher.handleServerAction({
			actionType: appConstants.CLEAR_CATEGORY_FILTER,
			data: null
		});
	},


};

module.exports = StorefrontActions;
