import React, { Component } from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'

import Activate from './components/Activate'

import View0 from './components/View0'
import View2 from './components/View2'
import PageIdle from './components/PageIdle'

import AdminLogin from './components/AdminLogin'
import AdminHome from './components/AdminHome'
import AdminSettings from './components/AdminSettings'

import CustomerSignup from './components/CustomerSignup'
import CustomerLogin from './components/CustomerLogin'
import StorefrontStatic from './components/StorefrontStatic'
import Storefront from './components/Storefront'
import ProductDetail from './components/ProductDetail'
import TransactionRefund from './components/TransactionRefund'
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
		<Route path='Activate' component={Activate} />

		<Route path='View0' component={View0} />
		<Route path='View2' component={View2} />

		<Route path='Admin_Login' component={AdminLogin} />
		<Route path='Admin_Login' component={AdminHome} />
		<Route path='Admin_Settings' component={AdminSettings} />

		<Route path='Customer_Signup' component={CustomerSignup} />
		<Route path='Customer_Signup/:step' component={CustomerSignup} />

		<Route path='Customer_Login' component={CustomerLogin} />
		<Route path='Customer_Login/:step' component={CustomerLogin} />

		<Route path='Storefront_Static' component={StorefrontStatic} />
		<Route path='Storefront' component={Storefront} />
		<Route path='Product_Detail/:productID' component={ProductDetail} />
		<Route path='Transaction_Refund' component={TransactionRefund} />
		<Route path='Card_Vending' component={CardVending} />
		<Route path='Cash_Vending' component={CashVending} />
		<Route path='Cash_Card' component={CashCard} />

		<Route path='Shopping_Cart' component={ShoppingCart} />
		<Route path='THANKYOU_MSG' component={ThankYouMsg} />

		<Route path='Vend_Error' component={VendError} />

		<Route path='Page_Idle' component={PageIdle} />

		<Route path='Category_Search' component={CategorySearch} />
		<Route path='Product_Search' component={ProductSearch} />
		<Route path="*" component={NoMatch} />
	</Route>
);
