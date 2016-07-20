import React, { Component } from 'react'
//import * as Translate from '../../lib/Translate'

//import RootscopeActions from '../actions/RootscopeActions'
//import RootscopeStore from '../stores/RootscopeStore'
import CS_Actions from '../../actions/CustomerSignupActions'
import CS_Store from '../../stores/CustomerStore'

import appConstants from '../../constants/appConstants'

import { browserHistory } from 'react-router'
import * as _E from 'elemental'

class Step extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.state = {
    	errorMsg: null,
    	simulatorPhoto: null
    }
    
    this._onCSStoreChange = this._onCSStoreChange.bind(this);

  };

  // Add change listeners to stores
  componentDidMount() {
  	CS_Store.addChangeListener( this._onCSStoreChange );
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	CS_Store.removeChangeListener( this._onCSStoreChange );
  }
  
  _onCSStoreChange(event) {
  	if (event.type === appConstants.PHOTO_TAKEN_SIGNUP) {
  		if (event.status === 'ok') {
  			this.setState({
  				errorMsg: null
  			});
  		} else {
  			this.setState({
  				errorMsg: 'There was a problem taking your photo, please try again.'
  			});
  		}
  	}
  }
  
  selectSimulatorPhoto(who, e) {
  	this.setState({
  		simulatorPhoto: who
  	});
  }
  
  startPhotoCapture() {
  	if (this.props.testing && !this.state.simulatorPhoto) {
  		return alert('TESTING: Please choose a customer print from the orange buttons.');
  	}
  	CS_Actions.grabPhoto(this.props.signupToken, this.state.simulatorPhoto);
  }

  render() {
    return (
    	<div>
		  <_E.Row >
			<_E.Col>
				<div style={{width:'100px',height:'100px',borderRadius:'50px',backgroundColor:'#84E60E', margin:'0 auto 1em'}}></div>
			  <h2>Initial photo for Facial Recognition</h2>
			  <p>Look at the green bubble above.</p>
			  <_E.Button type="warning" onClick={this.startPhotoCapture.bind(this)}>TESTING: Press to "take" the photo, this will happen automatically on a countdown, like a photo booth.</_E.Button>
			</_E.Col>
		  </_E.Row>
		  {this.renderSimulator()}
		</div>
    );
  }
  
  renderSimulator() {
  	if (this.props.testing) {
  		return (
		  <_E.Row style={{ border: '1px solid #666', borderRadius: '4px', backgroundColor: '#ccc', maxWidth: '85%', margin: '3em auto', paddingTop: '0.4em' }}>
			<_E.Col>
			  <h4 style={{fontWeight: 'normal'}}>SIMULATOR: choose a customer photo:</h4>
			  <_E.Row style={{marginBottom: '1em'}}>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPhoto.bind(this, 'KrisKhan')}>Kris Khan</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPhoto.bind(this, 'MaryJaneSmith')}>Mary Jane Smith</_E.Button>
				</_E.Col>
				<_E.Col basis="33%" style={{textAlign: 'center', marginBottom: '1em'}}>
					<_E.Button size="sm" type="warning" onClick={this.selectSimulatorPhoto.bind(this, 'BuddyGalore')}>Buddy Galore</_E.Button>
				</_E.Col>
			  </_E.Row>
			  <p style={{fontSize: '0.75em'}}>Picked: {this.state.simulatorPhoto || 'none yet'}, signup token: <strong>{this.props.signupToken}</strong></p>
			</_E.Col>
		  </_E.Row>
		);
  	}
  	return null;
  }

}

export default Step
