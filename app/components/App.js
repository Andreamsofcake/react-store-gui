import React, { Component } from 'react'
import { Link } from 'react-router'
//import './scss/App.scss'

import { isClient } from '../utils'

class App extends Component {

	render() {

		return (
			<div>
				<div className="row route-content">
					<div className="large-11 columms">
					{this.props.children}
					</div>
				</div>
			</div>
		)
	}
}

export default App;
