import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'

// import SomeComponent from './components/SomeComponent'
import NoMatch from './components/NoMatch'

export default (
	<Route path='/' component={App}>
		{/*<Route path='someRoute(/:namedParam1)(/:namedParam2)' component={SomeComponent} />*/}
		<Route path="*" component={NoMatch} />
	</Route>
);
