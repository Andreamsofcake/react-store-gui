import AppDispatcher from '../dispatcher/AppDispatcher'
import appConstants from '../constants/appConstants'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import objectAssign from 'react/lib/Object.assign'
import { EventEmitter } from 'events'
import muDB from '../../lib/muDB'

import { isClient } from '../utils'

var CHANGE_EVENT = 'change'

var StorefrontStore = objectAssign({}, EventEmitter.prototype, {
});

module.exports = StorefrontStore;
