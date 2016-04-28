import React, { Component } from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'

import Activate from './components/Activate'

import View0 from './components/View0'
import View2 from './components/View2'
import PageIdle from './components/PageIdle'

import AdminAutoMap from './components/AdminAutoMap'
import AdminCheckFaults from './components/AdminCheckFaults'
import AdminComponentControl from './components/AdminComponentControl'
import AdminHome from './components/AdminHome'
import AdminInventory from './components/AdminInventory'
import AdminJofemarExerciser from './components/AdminJofemarExerciser'
import AdminLogin from './components/AdminLogin'
import AdminPrintReaderTester from './components/AdminPrintReaderTester'
import AdminSettings from './components/AdminSettings'
import AdminSystemInfo from './components/AdminSystemInfo'
import AdminVms from './components/AdminVms'

import CustomerSignup from './components/CustomerSignup'
import CustomerLogin from './components/CustomerLogin'
import StorefrontStatic from './components/StorefrontStatic'
import Storefront from './components/Storefront'
import ProductDetail from './components/ProductDetail'
import TransactionRefund from './components/TransactionRefund'
import ChooseCashCard from './components/ChooseCashCard'
import CardVending from './components/CardVending'
import CashVending from './components/CashVending'
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
		
		<Route path='Admin'>
			<IndexRoute component={AdminLogin} />
			<Route path='AutoMap' component={AdminAutoMap} />
			<Route path='CheckFaults' component={AdminCheckFaults} />
			<Route path='ComponentControl' component={AdminComponentControl} />
			<Route path='Home' component={AdminHome} />
			<Route path='Inventory' component={AdminInventory} />
			<Route path='JofemarExerciser' component={AdminJofemarExerciser} />
			<Route path='Login' component={AdminLogin} />
			<Route path='PrintReaderTest' component={AdminPrintReaderTester} />
			<Route path='Settings' component={AdminSettings} />
			<Route path='SystemInfo' component={AdminSystemInfo} />
			<Route path='Vms' component={AdminVms} />

		</Route>

		<Route path='CustomerSignup' component={CustomerSignup} />
		<Route path='CustomerSignup/:step' component={CustomerSignup} />

		<Route path='CustomerLogin' component={CustomerLogin} />
		<Route path='CustomerLogin/:step' component={CustomerLogin} />

		{/*<Route path='Storefront_Static' component={StorefrontStatic} />*/}
		<Route path='Storefront' component={Storefront} />
		<Route path='ProductDetail/:productID' component={ProductDetail} />
		<Route path='Transaction_Refund' component={TransactionRefund} />
		<Route path='CardVending' component={CardVending} />
		<Route path='CashVending' component={CashVending} />
		<Route path='ChooseCashCard' component={ChooseCashCard} />

		<Route path='ShoppingCart' component={ShoppingCart} />
		<Route path='ThankYouMsg' component={ThankYouMsg} />

		<Route path='VendError' component={VendError} />

		<Route path='PageIdle' component={PageIdle} />

		<Route path='CategorySearch' component={CategorySearch} />
		<Route path='ProductSearch' component={ProductSearch} />
		<Route path="*" component={NoMatch} />
	</Route>
);
