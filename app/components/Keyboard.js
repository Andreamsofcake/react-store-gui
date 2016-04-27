import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { browserHistory } from 'react-router'

import TsvActions from '../actions/TsvActions'

class Keyboard extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    //RootscopeActions.setSession('currentView', 'Keyboard');
    
    // original code does both of these, not sure why:
    updateCredit();
    RootscopeActions.setConfig('credit', RootscopeStore.getSession('creditBalance') );

    keyboardTitle = "EnterEmailTitle";

    //RootscopeActions.setConfig('bShowCredit', RootscopeStore.getCache('credit') && true);
    
    this.state = {
		bShowBtns: true,
		//emailAddress: "",
		//email: "",//may need to use rootScope
		//coupon: "",
		output: '',

		bShift: false,
		/*
		// appear to be abandonded:
		key_a: bShift ? "A":"a",
		key_b: bShift ? "B":"b",
		key_c: bShift ? "C":"c",
		key_d: bShift ? "D":"d",
		key_e: bShift ? "E":"e",
		key_f: bShift ? "F":"f",
		key_g: bShift ? "A":"a",
		key_h: bShift ? "B":"b",
		key_i: bShift ? "C":"c",
		key_j: bShift ? "D":"d",
		key_k: bShift ? "E":"e",
		key_f: bShift ? "F":"f",
		*/
		keyboardTitle: 'EnterEmailTitle',
    }
    
	var binders = [
		'clickKey',
		'switchKeys',
		'yes',
		'no',
		'enter',
		'back',
		'capsLock',
		'shiftKey',
	];
	binders.forEach(B => {
		if (this[B]) { this[B] = this[B].bind(this); }
	});
    
    // this might be as simple as RootscopeActions.setConfig('bAbleToLogin', false)
    //TsvActions.apiCall('disableLoginDevices');
  }
  
  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  yes() {
  	this.setState({
  		bShowBtns: false,
  		keyboardTitle: 'EnterEmail'
  	});
  }

  no() {
  	RootscopeActions.gotoPayment();
  }

  back() {
  	RootscopeActions.removeKeyboard(); // probably is redundant, as we'll just close this component
  	RootscopeActions.gotoPayment();

	if (RootscopeStore.getCache('custommachinesettings.bHasShoppingCart') === true
		&& RootscopeStore.getCache('currentLocation') != "/Shopping_Cart") {
		browserHistory.push('/Shopping_Cart');

	} else {
		browserHistory.push('/View2');
	}

  }

  enter() {
	console.log("entered! (enter key)");

	var VIEW = RootscopeStore.getConfig('keyboardView');
	switch(VIEW) {

		case "Enter_Email":
			console.log("Validate Email");
			browserHistory.push('/Thankyou_Msg');
			break;

		case "Enter_Coupon":
			console.log("Validate Coupon");
			//
			break;

		default:
			console.error('unknown keyboardView: ' + VIEW);
			break;
	}
  }

  clickKey(key) {
	  //console.log("Hi Ping Debug Click Key: "+key);
	  //console.log("email: " + email);
	  //email += key;
	  this.setState({
	  	output: this.state.output + key
	  });
  }

  bksp() {
  	if (this.state.output && this.state.output.length) {
  		this.setState({
  			output: this.state.output.substr(0, this.state.output.length-1)
  		});
  	}
  }

  capsLock() {
  	this.setState({
  		bShift: !this.state.bShift
  	});
  }

  shiftKey() {
  	this.setState({
  		bShift: !this.state.bShift
  	});
/*
	  $(document).ready(function() {
		  $(".shift").toggleClass("system_key");
	  });
*/
  }

  switchKeys(key) {
	  switch(key) {
		  case '`':
			  return this.state.bShift ? '~':key;
			  break;
		  case '1':
			  return this.state.bShift ? '!':key;
			  break;
		  case '2':
			  return this.state.bShift ? '@':key;
			  break;
		  case '3':
			  return this.state.bShift ? '#':key;
			  break;
		  case '4':
			  return this.state.bShift ? '$':key;
			  break;
		  case '5':
			  return this.state.bShift ? '%':key;
			  break;
		  case '6':
			  return this.state.bShift ? '^':key;
			  break;
		  case '7':
			  return this.state.bShift ? '&':key;
			  break;
		  case '8':
			  return this.state.bShift ? '*':key;
			  break;
		  case '9':
			  return this.state.bShift ? '(':key;
			  break;
		  case '0':
			  return this.state.bShift ? ')':key;
			  break;
		  case '-':
			  return this.state.bShift ? '_':key;
			  break;
		  case '=':
			  return this.state.bShift ? '+':key;
			  break;
		  case '[':
			  return this.state.bShift ? '{':key;
			  break;
		  case ']':
			  return this.state.bShift ? '}':key;
			  break;
		  case '&bsol;':
			  return this.state.bShift ? key:'&bsol;';
			  break;
		  case ';':
			  return this.state.bShift ? ':':key;
			  break;
		  case "quote":
			  return this.state.bShift ? '"':"'";
			  break;
		  case ',':
			  return this.state.bShift ? '<':key;
			  break;
		  case '.':
			  return this.state.bShift ? '>':key;
			  break;
		  case '/':
			  return this.state.bShift ? '?':key;
			  break;
		  default:
			  return this.state.bShift ? key.toUpperCase():key;
	  }
  }

  render() {

	var title;

	switch (this.state.keyboardTitle) {

		case 'EnterEmail':
		case 'Enter_Email':
			title = (<h3>{Translate.translate(this.state.keyboardTitle)}</h3>);
			break;

		case 'EnterCoupon':
		case 'Enter_Coupon':
			title = (<h3>{Translate.translate('EnterCouponCode')}</h3>);
			break;
		
		default:
			title = (<p>unrecognized keyboard type request: {this.state.keyboardTitle}</p>);
			break;
	}

    return (

<div className="keyboard">
	
        <div className="animate-switch">

            {title}

            <div className="kb">

                <form name="myForm" className="form" novalidate>

                    <input type="email" id="kbInput" name="output" value={this.state.output} required />
                    {this.displayErrorMessages()}

                </form>

                {this.renderKeyboard()}

            </div>

            <div className="btns">
                <button onClick={this.no}>No</button>
                <button onClick={this.enter}>Submit</button>
            </div>

        </div>

</div>

    );
  }
  
  // FIXME: need to know how to SET error messages....
  displayErrorMessages() {
  	if (this.state.errorMessages && this.state.errorMessages.length) {
/*
    <span ng-show="myForm.coupon.$error.required">Coupon Code is Required.</span>
	<span ng-show="myForm.email.$error.required">Email Address is Required.</span>
	<span ng-show="myForm.email.$error.email">Invalid email address.</span>
*/
  		return (
			<div style={{color:'red'}}>
				{this.errorMessages.map( (MSG, IDX) => {
					return (<span key={IDX}>{MSG}</span>);
				})}
			</div>
		);
    }
  }
  
  renderKeyboard() {
  	return (
  		<div id="keyboard">
<div className="myKeyboard">
    <div className="row">
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('`') )}>~<br />`</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('1') )}>!<br />1</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('2') )}>@<br />2</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('3') )}>#<br />3</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('4') )}>$<br />4</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('5') )}>%<br />5</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('6') )}>^<br />6</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('7') )}>&<br />7</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('8') )}>*<br />8</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('9') )}>(<br />9</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('0') )}>)<br />0</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('-') )}>_<br />-</div>
        <div className="key num dual" onClick={this.clickKey( this.switchKeys('=') )}>+<br />=</div>
        <div className="key backspace" onClick={this.bksp}>⌫</div>
    </div>

    <div className="row">
        <div className="key tab" onClick="bksp()">Tab</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('q') )}>Q</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('w') )}>W</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('e') )}>E</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('r') )}>R</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('t') )}>T</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('y') )}>Y</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('u') )}>U</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('i') )}>I</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('o') )}>O</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('p') )}>P</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys('[') )}>{<br />[</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys(']') )}>}<br />]</div>
        <div className="key letter dual slash" onClick={this.clickKey( this.switchKeys('|') )}>|<br />\</div>
    </div>

    <div className="row">
        <div className="key caps" onClick={this.capsLock}>Caps<br />Lock</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('a') )}>A</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('s') )}>S</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('d') )}>D</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('f') )}>F</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('g') )}>G</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('h') )}>H</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('j') )}>J</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('k') )}>K</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('l') )}>L</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys(';') )}>:<br />;</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys('quote') )}>"<br />'</div>
        <div className="key enter" onClick={this.enter}>Enter</div>
    </div>

    <div className="row">
        <div className={"key shift left" + this.state.bShift ? ' system_key'} onClick={this.shiftKey}>Shift</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('z') )}>Z</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('x') )}>X</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('c') )}>C</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('v') )}>V</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('b') )}>B</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('n') )}>N</div>
        <div className="key letter" onClick={this.clickKey( this.switchKeys('m') )}>M</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys(',') )}>< <br />,</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys('.') )}>><br />.</div>
        <div className="key dual" onClick={this.clickKey( this.switchKeys('/') )}>?<br />/</div>
        <div className={"key shift right" + this.state.bShift ? ' system_key'} onClick={this.shiftKey}>Shift</div>
    </div>

    <div className="row">
        <div className="key space" onClick={this.clickKey(' ')}">&nbsp;</div>
    </div>
</div>
  		</div>
  	);
  }
  
}

export default Keyboard
