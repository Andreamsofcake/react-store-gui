'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { browserHistory } from 'react-router'
import { Router, match, RouterContext } from 'react-router'
import Routes from './Routes'
import AppLayout from './components/AppLayout'
import NoMatch from './components/NoMatch'
import { isClient, getPropsFromRoute } from './utils'
//import OM from 'object-merge'

if (isClient) {
	console.log('[renderComponentWithRoot] HAYNOW rendering on the client ');
	ReactDOM.render(
		<Router history={browserHistory}>{Routes}</Router>,
		document.getElementById('root')
	);
}

function renderComponentWithRoot(Component, componentProps, initialData) {
	console.log('[renderComponentWithRoot] HAYNOW rendering on the component ');

	const componentHtml = renderToStaticMarkup(
		<Component {...componentProps} />
	);
	
	const app_render = renderToStaticMarkup(
		<AppLayout app_render={componentHtml} />
	);
	
	return '<!DOCTYPE html>' + app_render;
	
}

function handle404(reply) {
	const wholeHtml = renderComponentWithRoot(NoMatch);
	reply(wholeHtml).code(404);
}

function handleError(reply, error) {
	reply(error.message).code(500);
}

function handleRedirect(reply, redirectLocation) {
	reply.redirect(302, redirectLocation.pathname + redirectLocation.search);
}

function handleRoute(reply, renderProps) {

	//const isDeveloping = process.env.NODE_ENV !== 'production';
	const routeProps = getPropsFromRoute(renderProps, ['requestState']);

	function renderPage(reply) {
		const wholeHtml = renderComponentWithRoot(RouterContext, renderProps, reply);
		reply(wholeHtml).code(200);
	}

	if (routeProps.requestState) {
		routeProps.requestState().then(renderPage);
	} else {
		renderPage(reply);
	}
}

function ServerRouter(req, reply, next) {

	match({ routes: Routes, location: req.url }, (error, redirectLocation, renderProps) => {
		
		// optional pre-processing or data loading or extra foo, then conditionally:
		finish();
		
		function finish(reactData) {

			if (reactData) {
				renderProps.initialData = reactData;
			}
			
			/*
			console.log('[SERVER Router.js]');
			console.log(req.url);
			console.log(Object.keys(renderProps));
			console.log( JSON.stringify(renderProps) );
			*/

			if (error) {
				console.log(' >>>>> error');
				handleError(error);
			} else if (reply, redirectLocation) {
				console.log(' >>>>> redirect');
				handleRedirect(reply, redirectLocation)
			} else if (renderProps) {
				console.log(' >>>>> renderProps');
				handleRoute(reply, renderProps);
			} else {
				console.log(' >>>>> 404');
				handle404(reply);
			}
		}
	});
}

// trying to work around babel shit: (using this method results in an object, not a function being exported. meh)
// found this is babel 5.x (keystone) vs babel 6 (newest release)
// http://stackoverflow.com/questions/33505992/babel-6-changes-how-it-exports-default?lq=1
// http://stackoverflow.com/questions/33500598/es6-export-default-imports-into-default-object
//export default ServerRouter;
// old method was working, we are not in keystone for this app though so hopefully the (above) new way works?
module.exports = ServerRouter;