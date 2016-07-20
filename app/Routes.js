import React, { Component } from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'

// idle modules ?
import View0 from './components/View0'
import View2 from './components/View2'
import PageIdle from './components/PageIdle'

// admin modules
import AdminActivate from './components/Admin/Activate'
import AdminAutoMap from './components/Admin/AutoMap'
import AdminBillAcceptor from './components/Admin/BillAcceptor'
import AdminCardScanTest from './components/Admin/CardScanTester'
import AdminCheckFaults from './components/Admin/CheckFaults'
import AdminComponentControl from './components/Admin/ComponentControl'
import AdminHome from './components/Admin/Home'
import AdminInventory from './components/Admin/Inventory'
import AdminInventory2 from './components/Admin/Inventory2'
import AdminJofemarExerciser from './components/Admin/JofemarExerciser'
import AdminLogin from './components/Admin/Login'
import AdminPrintReaderTester from './components/Admin/PrintReaderTester'
import AdminPrintRegistration from './components/Admin/PrintRegistration'
import AdminSettings from './components/Admin/Settings'
import AdminStorefrontData from './components/Admin/StorefrontData'
import AdminSystemInfo from './components/Admin/SystemInfo'
import AdminVms from './components/Admin/Vms'

// store modules
import CardVending from './components/CardVending'
import CashVending from './components/CashVending'
import ChooseCashCard from './components/ChooseCashCard'
import CustomerCreditVending from './components/CustomerCreditVending'
//import CustomerLogin from './components/CustomerLogin'
//import CustomerSignup from './components/CustomerSignup'
import CustomerLoginTest from './components/CustomerLoginTest'
import CustomerMembershipAccess from './components/Customer/MembershipAccess'
import ProductDetail from './components/ProductDetail'
import ShoppingCart from './components/ShoppingCart'
import Storefront from './components/Storefront'
import StorefrontStatic from './components/StorefrontStatic'
import ThankYouMsg from './components/ThankYouMsg'
import TransactionRefund from './components/TransactionRefund'
import VendError from './components/VendError'

// deprecated, but still here:
import CategorySearch from './components/CategorySearch'
import ProductSearch from './components/ProductSearch'

import NoMatch from './components/NoMatch'

export default (
	<Route path='/' component={App}>

		<Route path='View0' component={View0} />
		<Route path='View2' component={View2} />
		
		<Route path='Admin'>
			<IndexRoute component={AdminLogin} />
			<Route path='Activate' component={AdminActivate} />
			<Route path='AutoMap' component={AdminAutoMap} />
			<Route path='BillAcceptor' component={AdminBillAcceptor} />
			<Route path='CardScanTest' component={AdminCardScanTest} />
			<Route path='CheckFaults' component={AdminCheckFaults} />
			<Route path='ComponentControl' component={AdminComponentControl} />
			<Route path='Home' component={AdminHome} />
			<Route path='Inventory' component={AdminInventory} />
			<Route path='Inventory2' component={AdminInventory2} />
			<Route path='JofemarExerciser' component={AdminJofemarExerciser} />
			<Route path='Login' component={AdminLogin} />
			<Route path='PrintReaderTest' component={AdminPrintReaderTester} />
			<Route path='PrintRegistry' component={AdminPrintRegistration} />
			<Route path='Settings' component={AdminSettings} />
			<Route path='StorefrontData' component={AdminStorefrontData} />
			<Route path='SystemInfo' component={AdminSystemInfo} />
			<Route path='Vms' component={AdminVms} />

		</Route>
{/*
		<Route path='CustomerSignup' component={CustomerSignup} />
		<Route path='CustomerSignup/:step' component={CustomerSignup} />

		<Route path='CustomerLogin' component={CustomerLogin} />
		<Route path='CustomerLogin/:step' component={CustomerLogin} />
*/}
		<Route path='CustomerLoginTest' component={CustomerLoginTest} />
		<Route path='CustomerLoginTest/:step' component={CustomerLoginTest} />

		<Route path='CustomerMembershipAccess' component={CustomerMembershipAccess} />

		{/*<Route path='Storefront_Static' component={StorefrontStatic} />*/}
		<Route path='Storefront' component={Storefront} />
		<Route path='ProductDetail/:productID' component={ProductDetail} />
		<Route path='Transaction_Refund' component={TransactionRefund} />
		<Route path='CardVending' component={CardVending} />
		<Route path='CashVending' component={CashVending} />
		<Route path='ChooseCashCard' component={ChooseCashCard} />
		<Route path='CustomerCreditVending' component={CustomerCreditVending} />

		<Route path='ShoppingCart' component={ShoppingCart} />
		<Route path='ThankYouMsg' component={ThankYouMsg} />

		<Route path='VendError' component={VendError} />

		<Route path='PageIdle' component={PageIdle} />

		<Route path='CategorySearch' component={CategorySearch} />
		<Route path='ProductSearch' component={ProductSearch} />
		<Route path="*" component={NoMatch} />
	</Route>
);
