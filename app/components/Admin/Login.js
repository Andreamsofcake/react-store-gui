import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import { browserHistory, Link } from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../../actions/TsvActions'
import {
	emptyCart,
	gotoDefaultIdlePage,
	startGeneralIdleTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('AdminLogin');

import { uniq } from '../../utils'
import PrintMatchAdmin from '../Biometrics/AdminPrintMatch'

Big.log('name? '+PrintMatchAdmin.name);

class AdminLogin extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    this.state = {
    	token: uniq(),
		num: "",
		maxChars: 6,
		instructionMessage: Translate.translate('AdminLogin','LoginMsg')
    };
  }

  enter() {
  	startGeneralIdleTimer(this.props.location.pathname);
  	var localPass = TsvSettingsStore.getCache('machineSettings.AdminPassword')
  		, result = 'VALID'
  		;
  	  	
  	function handlePass(result) {
		switch(result){
			case "VALID":
				browserHistory.push("/Admin/Home");
				break;

			default:
				this.setState({
				  instructionMessage : Translate.translate('AdminLogin', 'InvalidPassword'),
				  num: ""
				}) //"Invalid Password";
				break;
		}
  	}
  	
  	handlePass = handlePass.bind(this)
  	
  	if (localPass) {
  		Big.log('using localPass for login check: '+localPass+', '+(typeof localPass) +', ' + (typeof this.state.num));
  		result = !!(localPass == this.state.num);
  		if (result) { result = 'VALID' }
  		handlePass(result);
  	
  	} else {
  		Big.log('using TsvApi for login check');
		TsvActions.apiCall('validateAdminPassword', this.state.num, (err, res) => {
			handlePass(res.result);
		});
	}
  }

  clear() {
  	startGeneralIdleTimer(this.props.location.pathname);
    this.setState({
      instructionMessage : Translate.translate('AdminLogin', 'LoginMsg'),
      num: ""
    })
  }

  press(digit) {
  	startGeneralIdleTimer(this.props.location.pathname);
    if(this.state.num.length < this.state.maxChars){
        this.setState({
          num: this.state.num + digit
        })
    }
  }

  back() {
    gotoDefaultIdlePage();
  }
    // Add change listeners to stores
  componentDidMount() {
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

	adminPrintMatchCallback(matched, responses, user) {
		if (matched) {
			browserHistory.push("/Admin/Home");
		//} else {
			// nada for now
			/*
			this.setState({
				adminBeginMatched: false,
				adminBeginResponses: responses
			});
			*/
		}
	}

  render() {
    return (
      <_E.Row className="AdminLogin" >
        <_E.Col>

          <div style={{width:'60%',margin: '0 auto'}}>

			  <h2 id="instruction">{ this.state.instructionMessage }</h2>

			  <_E.Row><p>{' '}</p></_E.Row>
			  <_E.Row>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 1)}>1</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 2)}>2</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 3)}>3</_E.Button></_E.Col>
			  </_E.Row>

			  <_E.Row><p>{' '}</p></_E.Row>
			  <_E.Row>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 4)}>4</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 5)}>5</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 6)}>6</_E.Button></_E.Col>
			  </_E.Row>

			  <_E.Row><p>{' '}</p></_E.Row>
			  <_E.Row>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 7)}>7</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 8)}>8</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 9)}>9</_E.Button></_E.Col>
			  </_E.Row>

			  <_E.Row><p>{' '}</p></_E.Row>
			  <_E.Row>
				  <_E.Col sm="1/3" md="1/3" lg="1/3"></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button  size="lg" onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3"></_E.Col>
			  </_E.Row>

			  <_E.Row><p>{' '}&nbsp;</p></_E.Row>
			  <_E.Row>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="warning" onClick={this.clear.bind(this)}>Clear</_E.Button></_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>
					<div style={{backgroundColor: '#fff', width: '100%', fontSize: '1.5em', padding: '0.45em', border: '1px solid #ddd', borderRadius: '4px', margin: '0 auto'}}>
						&nbsp;{this.state.num}&nbsp;
				  	</div>
				  	<p>{' '}&nbsp;</p>
				  	<p>{' '}&nbsp;</p>
				  	<_E.Button type="primary" component={(<Link to="/Storefront">{Translate.translate('AdminLogin','BackToStore')}</Link>)} />
				  </_E.Col>
				  <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" onClick={this.enter.bind(this)}>Enter</_E.Button></_E.Col>
			  </_E.Row>

			  <_E.Row><p>{' '}</p></_E.Row>
			  <_E.Row><p>{' '}</p></_E.Row>
	          <h2>Existing admin users, login with your fingerprint:</h2>

			  <_E.Row><p>{' '}</p></_E.Row>
			  <_E.Row>
				  <_E.Col>
					<PrintMatchAdmin
						token={this.state.token}
						matchCallback={this.adminPrintMatchCallback.bind(this)}
						/>
				  </_E.Col>
			  </_E.Row>


          </div>

          </_E.Col>
      </_E.Row>

    );
  }
}

export default AdminLogin
