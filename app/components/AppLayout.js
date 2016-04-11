import React, { Component } from 'react'
//import { Link } from 'react-router'
//import Helmet from 'react-helmet'
//import './scss/App.scss'
//import { isClient } from '../utils'

class AppLayout extends Component {
/*
<meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, width=device-width">
	or, less limiting: width=device-width, initial-scale=1.0
*/
	render() {
		return (
<html>
	<head>
		<meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, width=device-width" />
		<meta httpEquiv="X-UA-Compatible" content="IE=edge" />

		<title>SDK Vending App GUI</title>

		{/* alt cdn load for socket: <script src="https://cdn.socket.io/socket.io-1.4.1.min.js"></script> */}
		<script src="/socket.io/socket.io.js" type="text/javascript"></script>
		{/*<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" type="text/javascript"></script>*/}
		{/* The core React library * /}
		<script src="https://fb.me/react-0.14.7.js"></script>
		{/* The ReactDOM Library * /}
		<script src="https://fb.me/react-dom-0.14.7.js"></script>
		*/}

		<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />

		{/*<link rel="stylesheet" href="https://cdn.jsdelivr.net/foundation/6.1.0/foundation.min.css" />*/}
		{/*<link rel="stylesheet" type="text/css" href="http://elemental-ui.com/site.css"/>*/}
		<link rel="stylesheet" type="text/css" href="/css/elemental-site.css"/>
		<link rel="stylesheet" type="text/css" href="/css/styles.css"/>
		<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.3.15/slick.css" />
		{/*
		<link rel="stylesheet" href="/assets/css/react-datepicker-min.css"/>
		<link rel="stylesheet" href="/assets/css/styles.css" />
		*/}
	</head>
	<body>

	<div id="body" className="row column clearfix">
		<div id="root" className="clearfix" dangerouslySetInnerHTML={{__html: this.props.app_render}} />
	</div>

	<script src='/assets/CLIENT.js'></script>
	</body>
</html>
		)
	}
}

module.exports = AppLayout;
