import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { Link, browserHistory } from 'react-router'

class Activate extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = { numClicks: 0, loginOK: 3 };
    
  }

  handleClick(e) {
  	var num = this.state.numClicks;
  	num += 1;
  	if (num >= this.state.loginOK) {

	  	browserHistory.push('/Admin/Login');
	  	this.setState({
  			numClicks: 0
	  	});

  	} else {
	  	this.setState({
  			numClicks: num
	  	});
	}
  }

  render() {
  	var STYLZ = {
  		height:'3em',
  		width:'4em',
  		backgroundColor:'transparent',
  		//border: '1px solid red',
  		position: 'absolute',
  		top: 0,
  		left: 0
  	}
  	if (this.props.testing) {
  		STYLZ.border = '1px solid red';
  		STYLZ.color = '#fff';
  	}
    return (
      <div
      	style={STYLZ}
      	onClick={this.handleClick.bind(this)}
      	>
      	{this.showClicks()}
      </div>
    );
  }
  
  showClicks() {
  	if (this.props.testing) {
  		return this.state.numClicks
  	}
  	return null;
  }
}

export default Activate
