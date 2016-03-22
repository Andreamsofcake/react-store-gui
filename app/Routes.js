import React, { Component } from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'

import View0 from './components/View0'
import View2 from './components/View2'

import CardVending from './components/CardVending'
import CashVending from './components/CashVending'
import CashCard from './components/CashCard'
import ShoppingCart from './components/ShoppingCart'
import ThankYouMsg from './components/ThankYouMsg'
import VendError from './components/VendError'

import CategorySearch from './components/CategorySearch'
import ProductSearch from './components/ProductSearch'

import NoMatch from './components/NoMatch'

export default (
	<Route path='/' component={App}>
		<Route path='View0' component={View0} />
		<Route path='View2' component={View2} />

		<Route path='Card_Vending' component={CardVending} />
		<Route path='Cash_Vending' component={CashVending} />
		<Route path='Cash_Card' component={CashCard} />

		<Route path='Shopping_Cart' component={ShoppingCart} />
		<Route path='THANKYOU_MSG' component={ThankYouMsg} />

		<Route path='Vend_Error' component={VendError} />

		<Route path='Category_Search' component={CategorySearch} />
		<Route path='Product_Search' component={ProductSearch} />
		<Route path="*" component={NoMatch} />
	</Route>
);
