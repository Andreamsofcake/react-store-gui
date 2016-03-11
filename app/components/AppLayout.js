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
		<meta name="msapplication-TileColor" content="#FFFFFF" />
		<meta name="msapplication-TileImage" content="/gfx/favi/favicon-144.png" />
		<meta name="msapplication-config" content="/gfx/favi/browserconfig.xml" />


		<title>SDK Vending App GUI</title>

		{/* alt cdn load for socket: <script src="https://cdn.socket.io/socket.io-1.4.1.min.js"></script> */}
		<script src="/socket.io/socket.io.js" type="text/javascript"></script>
		{/*<script type="text/javascript">
			var socket = io();
			socket.on('msg', function(message) {
				//console.log(message);
			});
			socket.on('connection', function() {
				console.log('[ SOCKET IO ] connected');
				socket.emit('testResponse');
			});
			console.log('[ SOCKET IO ] should be running....');
		</script>*/}

		<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
		
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/foundation/6.1.0/foundation.min.css" />
		<link rel="stylesheet" type="text/css" href="/styles/search.css" />
		<link rel="stylesheet" href="/styles/custom.css" />
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
